import Chart from "./chart";
import { merge, isEmpty } from "../utils";
import { common } from "../constants";
/**
 * 红外图谱类
 */
class Infrared extends Chart {
	constructor(...args) {
		super(...args);
	}
	/**
	 * 绘制红外图谱
	 * @param {*红外数据} data
	 */
	option() {
		let opts = this.opts;
		let chartBody = this.chartBody;
		let { title, axisInfo, series } = chartBody;

		let chartOption = {
			title: {
				text: title
			},
			legend: {
				show: false,
				data: [axisInfo.zDesc]
			},
			toolbox: {
				right: 0,
				showTitle: false,
				feature: {
					brush: {
						show: series[0].shapes ? true : false,
						type: ["rect", "polygon", "clear"]
					},
					saveAsImage: {
						show: false
					},
				},
				y: 'center',
				left: opts.fontSize,
				itemGap: opts.fontSize * 1.5,
				iconStyle: {
					borderColor: opts.color
				},
				orient: 'vertical'
			},
			brush: {
				xAxisIndex: "all",
				brushLink: "all",
				brushStyle: {
					borderWidth: 2,
					color: "rgba(128, 128, 128, 0.2)",
					borderColor: common.infraredColor
				},
				throttleType: 'debounce'
			},
			grid: {
				left: 0,
				right: 0,
				top: 0,
				bottom: 0
			},
			tooltip: {
				trigger: "item",
				axisPointer: {
					type: "none"
				},
				formatter: function (param) {
					let { componentType, componentSubType, data } = param;
					if (componentType === "series" && componentSubType === "custom") {
						let { name, value } = data;
						let htmlStr = `<div style="padding:${opts.fontSize *
							0.5}px"><span style="font-size:${opts.fontSize *
							1.1}px">${name}</span><br/>`;
						if (value) {
							value.forEach(item => {
								htmlStr += `<span style="font-size:${opts.fontSize *
									1.1}px">${item.key}: ${item.value
									}</span><br/>`;
							});
						}
						htmlStr += "</div>";
						return htmlStr;

					}
				}
			},
			xAxis: [{
				type: "value",
				show: false,
				max: axisInfo.width
			}],
			yAxis: [{
				type: "value",
				inverse: true,
				show: false,
				max: axisInfo.height
			}],
			series: this.getSeries(opts, chartBody),
			dataZoom: [
				{
					disabled: true
				}
			]
		};
		return merge(chartOption, this.baseOption());
	}

	getSeries(opts, chartBody) {
		let { series, axisInfo, trigger } = chartBody;
		let seriesOption = [];

		if (series[0].image) {
			seriesOption.push({
				type: "custom",
				renderItem: (params, api) => {
					let {
						coordSys: { x, y, width, height }
					} = params;
					let { path, data } = series[0].image;
					return {
						type: "image",
						position: [x, y],
						style: {
							image: isEmpty(path) ? data : path,
							width: width,
							height: height,
							opacity: 1
						}
					};
				},
				data: [0],
				silent: true
			});
		}
		if (trigger.length > 0) {
			trigger.forEach(item => {
				seriesOption.push({
					type: "custom",
					renderItem: (params, api) => {
						let {
							coordSys: { x, y, width, height }
						} = params;
						let ratioX = width / axisInfo.width;
						let ratioY = height / axisInfo.height;
						return {
							type: "polygon",
							position: [x, y],
							shape: {
								points: item.points.map(item => {
									return [item[0] * ratioX, item[1] * ratioY];
								})
							},
							style: {
								fill: item.fill_color
									? item.fill_color
									: "rgba(128, 128, 128, 0.2)",
								stroke: item.line_color
									? item.line_color
									: common.infraredColor,
								lineWidth: 2,
								lineDash: [5]
							}
						};
					},
					data: [
						{
							name: item.label ? item.label : "",
							value: item.content ? item.content : null
						}
					],
					silent: false
				});
			});
		}
		return seriesOption;
	}
}

export default Infrared;
