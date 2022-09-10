import eleResize from "element-resize-event";
import * as echarts from 'echarts'
import {
	chartType,
	initOption,
	pashShiftCharts,
	cycleShiftCharts
} from "./constants";
import {
	chartOption
} from "./modules";
import {
	isEmpty,
	throttle,
	merge,
	getBaseRem
} from "./utils/index";
import {
	pashShift,
	cycleShift,
	thresholdFilter,
	infraredShapeBrush
} from "./utils/common";

/**
 * 合并配置项
 * @param {Object} opts 用户定义配置项
 */
let mergeOption = opts => {
	let rem = getBaseRem();
	//处理宽高为数字的情况
	if (!isNaN(opts.width)) {
		opts.width = opts.width + "px";
	}
	if (!isNaN(opts.height)) {
		opts.height = opts.height + "px";
	}
	if (isEmpty(opts.lineWidth)) {
		//如果rem=16，width=1
		opts.lineWidth = rem * 0.0625;
	}
	if (isEmpty(opts.fontSize)) {
		//如果rem=16，fontSize=12
		opts.fontSize = rem * 0.75;
	}
	//合并配置项
	return merge(opts, initOption);
};

/**
 * 初始化图谱Dom
 * @param {Document} targetEl 目标div
 * @param {Object} opts 用户定义配置项
 */
let initChart = (targetEl, opts, isResize) => {
	let width = isResize === true ? targetEl.clientWidth : opts.width;
	let height = isResize === true ? targetEl.clientHeight : opts.height;
	targetEl.setAttribute(
		"style",

		`width: ${width}; height: ${height};float: left;display: flex;justify-content: center;position:absolute;top:0;bottom:0;right:0;left:0;margin:auto;inset:unset;`	);
	let chart = echarts.getInstanceByDom(targetEl);
	if (isEmpty(chart)) {
		chart = echarts.init(targetEl, "", {
			devicePixelRatio: window.devicePixelRatio,
			renderer: opts.engine
		});
	}
	if (opts.stopPropagation) {
		let cachFunc = targetEl.onclick;
		targetEl.onclick = function (e) {
			let x = e.offsetX;
			let y = e.offsetY;
			let contentDiv = this.children[0];
			if (y < 40 || y > contentDiv.offsetHeight - 40 || x < 40 || x > contentDiv.offsetWidth - 40) {
				e.stopPropagation();
			} else {
				if (cachFunc) {
					cachFunc();
				}
			}
		}
	}
	return chart;
};

/**
 * 自动调整图谱大小
 * @param {Document} targetEl 目标div
 * @param {Object} opts 用户定义配置项
 */
let resizeChart = (targetEl, opts, initedChartEl) => {
	let width = targetEl.clientWidth === 0 ? opts.width : targetEl.clientWidth;
	let height =
		targetEl.clientHeight === 0 ? opts.height : targetEl.clientHeight;

	if (!opts.cover) {
		let size = Math.min(parseFloat(width), parseFloat(height));
		width = size;
		height = size;
	}

	let chart = initedChartEl ?
		initedChartEl :
		initChart(targetEl, opts, true);

	//判断是否需要重置颜色条
	let {
		visualMap
	} = chart.getOption();
	if (isEmpty(visualMap) === false) {
		let textStyle = visualMap[0].textStyle;
		chart.setOption({
			visualMap: {
				type: "continuous",
				align: "right",
				right: 0,
				precision: 2,
				itemWidth: opts.fontSize * 0.5,
				itemHeight: height - opts.fontSize * 7,
				textStyle: textStyle ?
					textStyle : {
						color: "transparent"
					}
			}
		});
	}

	//针对红外框选功能
	if (opts.type === chartType.infrared) {
		let {
			data,
			data: {
				axisInfo
			}
		} = opts;
		let {
			shapes = []
		} = data.series[0];
		let ratioX = targetEl.clientWidth / axisInfo.width;
		let ratioY = targetEl.clientHeight / axisInfo.height;
		if (shapes && shapes.length > 0) {
			infraredShapeBrush(chart, opts, ratioX, ratioY);

			//brush设置为保持多个图形，默认多边形
			chart.dispatchAction({
				type: "takeGlobalCursor",
				key: "brush",
				brushOption: {
					brushType: "polygon",
					brushMode: "multiple"
				}
			});

			//初始化标注块
			chart.dispatchAction({
				type: "brush",
				areas: shapes.map((item, index) => {
					return {
						brushType: "polygon",
						range: item.points.map(item => {
							return [item[0] * ratioX, item[1] * ratioY];
						}),
						panelId: index + 1
					};
				})
			});
		}
	}

	chart.resize({
		width: width,
		height: height
	});
};

/**
 * 绘制图谱
 * @param {Document} targetEl 目标div
 * @param {Object} opts 用户定义配置项
 */
let draw = async (targetEl, opts = {}) => {
	//合并配置项
	opts = mergeOption(opts);

	//绘制图谱
	let chart = initChart(targetEl, opts);
	let option = await chartOption(targetEl, opts);
	chart.clear();
	chart.setOption(option);

	//特殊处理，针对有相位偏移的图谱
	if (pashShiftCharts.indexOf(opts.type) > -1) {
		chart.phaseShift = (shiftNum = 0) => {
			let tempOption = merge(chart.getOption(), option);
			let opt = pashShift(tempOption, shiftNum, opts.type);
			chart.setOption(opt, false, true);
		};
	}

	//特殊处理，针对有周期偏移的图谱
	if (cycleShiftCharts.indexOf(opts.type) > -1) {
		chart.cycleShift = (shiftNum = 0) => {
			let tempOption = merge(chart.getOption(), option);
			let opt = cycleShift(tempOption, shiftNum, opts.type);
			chart.setOption(opt, false, false);
		};
	}

	//特殊处理，针对有阈值过滤的图谱
	if (opts.type === chartType.prpsd || opts.type === chartType.prpd2d) {
		chart.on("dataZoom", (params) => {
			let {
				dataZoomId,
				start,
				end
			} = params;
			let tempOption = merge(chart.getOption(), option);
			if (dataZoomId === 'threshold') {
				if (opts.type === chartType.prpd2d) {
					let yRange = tempOption.yAxis[0].max - tempOption.yAxis[0].min;
					let opt = thresholdFilter(tempOption, [(start / 100) * yRange, (end / 100) * yRange], opts.type);
					chart.setOption(opt, false, true);
				} else if (opts.type === chartType.prpsd) {
					let zRange = tempOption.visualMap.max - tempOption.visualMap.min;
					chart.dispatchAction({
						type: 'selectDataRange',
						selected: [(start / 100) * zRange + tempOption.visualMap.min, (end / 100) * zRange + tempOption.visualMap.min],
					});
				}
			}
			if (dataZoomId === 'phase') {
				let xRange = tempOption.xAxis[0].max - tempOption.xAxis[0].min;
				let opt = pashShift(tempOption, (start / 100) * xRange, opts.type);
				chart.setOption(opt, false, true);
			}
		})
	}

	//图谱自适应，图谱宽高调整的情况下有效
	resizeChart(targetEl, opts, chart);
	eleResize(
		targetEl,
		throttle(
			() => {
				resizeChart(targetEl, opts, chart);
			},
			50,
			true
		)
	);
	return chart;
};

/**
 * 修改Echarts的配置项
 * @param {Document} chart 目标图谱
 * @param {Object} option 自定义配置项
 */
let updateOption = (chart, opts = {}) => {
	chart.then((resolve, reject) => {
		let option = merge(opts, resolve.getOption());
		resolve.clear(); //清空ECharts
		resolve.setOption(option);
		option = null;
	})
};

export {
	chartType,
	draw,
	updateOption
};