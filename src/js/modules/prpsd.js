import Chart from './chart';
import Color from '../utils/color';
import {
    common
} from '../constants';
import {
    isEmpty,
    merge,
    throttle,
    pathToSvg,
    deepClone
} from '../utils';
import {
    splitArr
} from '../utils/common';

/**
 * PRPS图谱类(适用云诊断和报告)
 */
class PRPSD extends Chart {
    constructor(...args) {
        super(...args);
        this.playing = this.opts.autoCycle;
        this.phaseShiftShow = false;
        this.thresholdFilterShow = false;
        this.AnimationDraw = null;
        this.cycleShift = 0;
        this.chartLoaded = false;
        this.guid = new Date().getTime() + '_id';
        if (this.cachedModule != undefined) {
            this.playing = this.chart.cachedModule.playing
        }
        this.chart.cachedModule = this;
        this.phaseShiftValHasRender = false;
    }

    /**
     * 生成PRPS平面三维图谱配置项
     * @param {*自定义配置} data 
     */
    option() {
        let _self = this;
        let opts = this.opts;
        let chartBody = this.chartBody;
        let {
            title,
            axisInfo
        } = chartBody;

        //设置图谱颜色
        let color = chartBody.series[0].color;
        let colors = []
        if (!isEmpty(color)) {
            colors = Color.getColorList(color);
        }
        let barSize = opts.fontSize * 0.75;

        let phaseShift = axisInfo.phaseShift ? axisInfo.phaseShift / (axisInfo.xRangeMax - axisInfo.xRangeMin) * 100 : 0;
        let thresholdFilter = axisInfo.thresholdFilter ? axisInfo.thresholdFilter / (axisInfo.zRangeMax - axisInfo.zRangeMin) * 100 : 0;

        let pauseIcon = pathToSvg(common.pauseIcon, opts.color);
        let playIcon = pathToSvg(common.playIcon, opts.color);

        let chartOption = {
            title: {
                text: chartBody.title,
            },
            legend: {
                show: false,
                data: [axisInfo.zDesc]
            },
            tooltip: {
                trigger: 'item',
                axisPointer: {
                    type: 'none',
                },
                formatter: function (params) {
                    let htmlStr = `<div style="padding:${opts.fontSize * 0.5}px">`;
                    let color = params.color; //图例颜色
                    let xValue = params.value[0] - axisInfo.phaseShift;
                    if (xValue < 0) {
                        xValue += axisInfo.xRangeMax - axisInfo.xRangeMin;
                    }
                    htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.xDesc}:${xValue}${axisInfo.xUnit}<span><br/>`;
                    htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.yDesc}:${params.value[1]}${axisInfo.yUnit}<span><br/>`;
                    //为了保证和原来的效果一样，这里自己实现了一个点的效果
                    htmlStr += `<div style="display: flex;align-items: center;"><span style="display:inline-block;width:${opts.fontSize}px;height:${opts.fontSize}px;border-radius:${opts.fontSize * 0.5}px;margin-right:${opts.fontSize * 0.5}px;background-color:${color};"></span>`
                    if (axisInfo.cycleNum > 0 && axisInfo.zSubtitle.length > 0) {
                        htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.zDesc}:${parseInt(axisInfo.cycleNum * (params.value[2] / 100))}%<span><br/>`;
                    } else {
                        htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.zDesc}:${parseInt(params.value[2])}${axisInfo.zUnit}<span><br/></div>`;
                    }

                    htmlStr += '</div>';
                    return htmlStr;
                },
            },
            toolbox: {
                right: opts.fontSize * 3,
                top: 0,
                showTitle: false,
                feature: axisInfo.zRangeMin != 0 ? {} : {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    saveAsImage: {},
                    restore: {},
                    myPhaseShift: {
                        icon: common.phaseShiftIcon,
                        title: '幅值区间',
                        onclick: function (model, api, type) {
                            _self.thresholdFilterShow = !_self.thresholdFilterShow;
                            // this.model.setIconStatus(
                            //     type,
                            //     _self.thresholdFilterShow ? "emphasis" : "normal"
                            // );
                            _self.showPhaseThreshold();
                        },
                    },
                    mythresholdFilter: {
                        icon: common.thresholdFilterIcon,
                        title: '相位偏移',
                        onclick: function (model, api, type) {
                            _self.phaseShiftShow = !_self.phaseShiftShow;
                            // this.model.setIconStatus(
                            //     type,
                            //     _self.phaseShiftShow ? "emphasis" : "normal"
                            // );
                            _self.showPhaseThreshold();
                        },
                    },
                }
            },
            xAxis: [{
                show: false,
                min: axisInfo.xRangeMin,
                max: axisInfo.xRangeMax,
            }],
            yAxis: [{
                show: false,
                min: axisInfo.yRangeMin,
                max: axisInfo.yRangeMax,
            }],
            zAxis: [{
                show: false,
                min: axisInfo.zRangeMin,
                max: axisInfo.zRangeMax,
            }],
            series: this.getSeries(opts, chartBody),
            visualMap: {
                type: 'continuous',
                show: false,
                min: axisInfo.zRangeMin,
                max: axisInfo.zRangeMax,
                range: [parseFloat(axisInfo.thresholdFilter) + axisInfo.zRangeMin, axisInfo.zRangeMax],
                seriesIndex: 'all',
                inRange: isEmpty(colors) ? {} : {
                    color: colors,
                },
                outOfRange: {
                    color: 'transparent'
                },
            },
            graphic: axisInfo.zRangeMin != 0 ? [{
                type: 'image',
                right: opts.fontSize,
                top: opts.fontSize * 0.5,
                style: {
                    image: this.playing ? pauseIcon : playIcon,
                    width: opts.fontSize * 1.5,
                    height: opts.fontSize * 1.5,
                },
                onclick: (() => {
                    this.playing = !this.playing;
                    if (this.playing) {
                        this.phaseShiftShow = false;
                        this.thresholdFilterShow = false;
                        this.showPhaseThreshold();
                    }
                    this.chart.setOption({
                        graphic: [{
                            style: {
                                image: this.playing ? pauseIcon : playIcon,
                            }
                        }]
                    }, false, false)
                    this.cycleShiftPlay();
                })
            }] : [{
                type: 'image',
                right: opts.fontSize,
                top: opts.fontSize * 0.5,
                style: {
                    image: this.playing ? pauseIcon : playIcon,
                    width: opts.fontSize * 1.5,
                    height: opts.fontSize * 1.5,
                },
                onclick: (() => {
                    this.playing = !this.playing;
                    if (this.playing) {
                        this.phaseShiftShow = false;
                        this.thresholdFilterShow = false;
                        this.showPhaseThreshold();
                    }
                    this.chart.setOption({
                        graphic: [{
                            style: {
                                image: this.playing ? pauseIcon : playIcon,
                            }
                        }]
                    }, false, false)
                    this.cycleShiftPlay();
                })
            }, {
                type: 'image',
                right: opts.fontSize,
                top: opts.fontSize * 6,
                style: {
                    image: pathToSvg(common.zoomOut, opts.color),
                    width: opts.fontSize * 1.2,
                    height: opts.fontSize * 1.2,
                },
                onclick: (() => {
                    this.ampZoom('zoomOut', opts, chartBody)
                })
            }, {
                type: 'image',
                right: opts.fontSize,
                top: opts.fontSize * 8,
                style: {
                    image: pathToSvg(common.zoomIn, opts.color),
                    width: opts.fontSize * 1.2,
                    height: opts.fontSize * 1.2,
                },
                onclick: (() => {
                    this.ampZoom('zoomIn', opts, chartBody)
                })
            }],
            dataZoom: [{
                id: 'phase',
                show: false,
                type: 'slider',
                orient: 'horizontal',
                filterMode: 'none',
                zoomLock: true,
                realtime: false,
                xAxisIndex: 0,
                start: phaseShift,
                end: phaseShift,
                bottom: 2,
                left: barSize * 3.5,
                right: barSize * 3.5,
                height: barSize * 0.8,
                borderColor: common.sinColor,
                backgroundColor: 'rgba(167,183,204,0.4)',
                handleIcon: 'M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
                handleSize: '110%',
                handleStyle: {
                    color: common.sinColor,
                    borderColor: common.sinColor,
                    borderWidth: 1,
                },
                textStyle: {
                    color: opts.color,
                    fontSize: opts.fontSize,
                },
                labelFormatter: (value) => {
                    let flag = _self.phaseShiftValHasRender;
                    _self.phaseShiftValHasRender = !_self.phaseShiftValHasRender;
                    return flag ? '' : parseInt(value) + axisInfo.xUnit;
                }
            }, {
                id: 'threshold',
                show: false,
                type: 'slider',
                orient: 'vertical',
                filterMode: 'none',
                zoomLock: false,
                realtime: false,
                yAxisIndex: 0,
                start: thresholdFilter,
                end: 100,
                left: barSize * 2,
                bottom: barSize * 2,
                top: barSize * 5.3,
                width: barSize * 0.8,
                fillerColor: 'rgba(167,183,204,0.4)',
                borderColor: common.sinColor,
                backgroundColor: 'transparent',
                handleIcon: 'M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
                handleSize: '110%',
                handleStyle: {
                    color: common.sinColor,
                    borderColor: common.sinColor,
                    borderWidth: 1,
                },
                textStyle: {
                    color: opts.color,
                    fontSize: opts.fontSize,
                },
                labelPrecision: 0,
                labelFormatter: (value) => {
                    let zRange = axisInfo.zRangeMax - axisInfo.zRangeMin;
                    let yRange = axisInfo.yRangeMax - axisInfo.yRangeMin;
                    return parseInt((value / yRange) * zRange + axisInfo.zRangeMin) + axisInfo.zUnit;
                }
            }],
            phaseShift: axisInfo.phaseShift,
            cycleShift: 0,
        };
        this.cycleShiftPlay();
        return merge(chartOption, this.baseOption());
    }

    /**
     * 渲染坐标系面板
     * @param {*} params 
     * @param {*} api 
     * @param {*} opts 
     */
    renderAxisItem(params, api, opts) {
        if (params.context.rendered) {
            return;
        }
        params.context.rendered = true;

        let {
            coordSys
        } = params;

        return {
            type: 'group',
            children: this.creatBasePanel(coordSys, opts)
        }
    }

    /**
     * 
     * @param {*} coordSys 
     * @param {*} opts 
     */
    creatBasePanel(coordSys, opts) {
        let {
            x,
            y,
            width,
            height
        } = coordSys;
        let xozWidth = width * 0.7;
        let xozHeight = height * 0.5;
        let xozLeft = width - xozWidth;
        let lineStyle = {
            fill: 'transparent',
            stroke: opts.color,
            lineWidth: opts.lineWidth
        }
        let fontStyle = {
            fill: opts.color,
            font: `${opts.fontSize * 1.1}px sans-serif`,
            textVerticalAlign: 'middle'
        }
        let lineCount = 4;
        let subtext = opts.zMaxValue;
        if (typeof (subtext) === 'number') {
            if (subtext > opts.zRangeMax) {
                subtext = 'Max>'
            } else {
                subtext = 'Max='
            }
            subtext += opts.zMaxValue + opts.zUnit
        }

        //XOZ面板
        let xoz = [{
            type: 'rect', //XOZ面板
            position: [x, y],
            shape: {
                x: xozLeft,
                y: 0,
                width: xozWidth,
                height: xozHeight
            },
            style: lineStyle
        }];
        //分割线
        for (let i = 1; i < lineCount; i++) {
            //横线
            xoz.push({
                type: 'line',
                position: [x, y],
                shape: {
                    x1: xozLeft,
                    y1: (xozHeight / lineCount) * i,
                    x2: width,
                    y2: (xozHeight / lineCount) * i,
                },
                style: {
                    ...lineStyle,
                    lineDash: [opts.lineWidth * 2],
                    opacity: 0.5
                }
            })
            //纵线
            xoz.push({
                type: 'line',
                position: [x, y],
                shape: {
                    x1: xozLeft + (xozWidth / lineCount) * i,
                    y1: 0,
                    x2: xozLeft + (xozWidth / lineCount) * i,
                    y2: xozHeight
                },
                style: {
                    ...lineStyle,
                    lineDash: [opts.lineWidth * 2],
                    opacity: 0.5
                }
            })
        }
        //正弦线
        xoz.push({
            type: 'bezierCurve',
            position: [x, y],
            shape: {
                x1: xozLeft,
                y1: xozHeight / 2,
                x2: width,
                y2: xozHeight / 2,
                cpx1: xozLeft + (xozWidth / 2),
                cpy1: xozHeight / 2 - xozHeight * 1.7,
                cpx2: xozLeft + (xozWidth / 2),
                cpy2: xozHeight / 2 + xozHeight * 1.7,
            },
            style: {
                ...lineStyle,
                stroke: common.sinColor,
                opacity: 0.8
            }
        });
        //文字描述-MaxValue
        xoz.push({
            type: 'text',
            position: [x, y],
            style: {
                x: xozLeft,
                y: -opts.fontSize,
                text: subtext,
                ...fontStyle
            }
        });
        //文字描述-zMax
        xoz.push({
            type: 'text',
            position: [x, y],
            style: {
                x: width + opts.fontSize * 0.2,
                y: opts.fontSize * 0.2,
                text: opts.zRangeMax,
                ...fontStyle,
                font: `${parseInt(Math.log10(opts.zRangeMax) + 1) > 4
                    ? opts.fontSize * 0.9
                    : opts.fontSize * 1.1
                    }px sans-serif`,
            }
        });
        //文字描述-zDesc
        xoz.push({
            type: 'text',
            position: [x, y],
            // origin: [width + opts.fontSize, xozHeight * 0.6],
            // rotation: Math.PI * 0.5,
            style: {
                x: width - opts.fontSize * 4.5,
                y: -opts.fontSize,
                text: `${opts.zDesc}[${opts.zUnit}]`,
                ...fontStyle
            }
        });
        //文字描述-zMin
        xoz.push({
            type: 'text',
            position: [x, y],
            style: {
                x: width + opts.fontSize * 0.3,
                y: xozHeight,
                text: opts.zRangeMin,
                ...fontStyle
            }
        });
        //XOY面板
        let xoy = [{
            type: 'polyline', //XOZ面板
            position: [x, y],
            shape: {
                points: [
                    [xozLeft, xozHeight],
                    [0, height - opts.fontSize * 0.5],
                    [xozWidth, height - opts.fontSize * 0.5],
                    [width, xozHeight]
                ],
            },
            style: lineStyle
        }];
        //分割线
        for (let i = 1; i < lineCount; i++) {
            //横线
            xoy.push({
                type: 'line',
                position: [x, y],
                shape: {
                    x1: xozLeft - (xozLeft / lineCount) * i,
                    y1: xozHeight + ((height - xozHeight) / lineCount) * i,
                    x2: width - (xozLeft / lineCount) * i,
                    y2: xozHeight + ((height - xozHeight) / lineCount) * i,
                },
                style: {
                    ...lineStyle,
                    lineDash: [opts.lineWidth * 2],
                    opacity: 0.5
                }
            })
            //纵线
            xoy.push({
                type: 'line',
                position: [x, y],
                shape: {
                    x1: xozLeft + (xozWidth / lineCount) * i,
                    y1: xozHeight,
                    x2: (xozWidth / lineCount) * i,
                    y2: height - opts.fontSize * 0.5
                },
                style: {
                    ...lineStyle,
                    lineDash: [opts.lineWidth * 2],
                    opacity: 0.5
                }
            })
        }
        //横轴坐标
        for (let i = 0; i <= lineCount; i++) {
            xoy.push({
                type: 'text',
                position: [x, y],
                style: {
                    x: (xozWidth / lineCount) * i - opts.fontSize,
                    y: height + opts.fontSize * 0.2,
                    text: ((opts.xRangeMax - opts.xRangeMin) / lineCount) * i,
                    ...fontStyle
                }
            })
        }
        //文字描述-xDesc
        xoy.push({
            type: 'text',
            position: [x, y],
            style: {
                x: xozWidth * 0.4,
                y: height + opts.fontSize * 1.5,
                text: `${opts.xDesc}[${opts.xUnit}]`,
                ...fontStyle
            }
        });
        //文字描述-yDesc
        xoy.push({
            type: 'text',
            position: [x, y],
            style: {
                x: xozWidth + xozLeft / 2 + opts.fontSize * 0.5,
                y: height * 0.75,
                text: `${opts.yDesc}[${opts.yUnit}]`,
                ...fontStyle
            }
        });
        //文字描述-yDesc-周期
        xoy.push({
            type: 'text',
            position: [x, y],
            style: {
                x: xozWidth + xozLeft * 0.25 + opts.fontSize * 0.5,
                y: height * 0.9,
                text: `${opts.yUnit}=${opts.yRangeMax - opts.yRangeMin}`,
                ...fontStyle
            }
        });
        return xoz.concat(xoy);
    }

    /**
     * 渲染数据
     * @param {*} params 
     * @param {*} api 
     * @param {*} opts 
     */
    renderDataItem(params, api, opts) {
        let {
            coordSys: {
                x,
                y,
                width,
                height
            }
        } = params;
        let xozWidth = width * 0.7;
        let xozHeight = height * 0.5;
        let xozLeft = width - xozWidth;

        let xRange = parseFloat(opts.xRangeMax) - parseFloat(opts.xRangeMin);
        let yRange = parseFloat(opts.yRangeMax) - parseFloat(opts.yRangeMin);
        let zRange = parseFloat(opts.zRangeMax) - parseFloat(opts.zRangeMin);

        let xValue = parseFloat(api.value(0)) - opts.phaseShift;
        //调整相位偏差
        if (xValue < 0) {
            xValue += xRange;
        }
        let yValue = parseFloat(api.value(1));
        let zValue = parseFloat(api.value(2));
        if (zValue > opts.zRangeMax) {
            zValue = opts.zRangeMax;
        }

        let xInterval = xozWidth / xRange;
        let yInterval = (height - opts.fontSize * 0.5 - xozHeight) / yRange;
        let zInterval = xozHeight / zRange;

        let xItem = xozLeft - (xozLeft / yRange) * yValue + (xValue - opts.xRangeMin) * xInterval;
        let yItem = xozHeight + (yValue - opts.yRangeMin) * yInterval + yInterval / 2;
        let zItem = (zValue > opts.zRangeMin) ? (zValue - opts.zRangeMin) * zInterval : 0;
        return {
            type: 'rect',
            position: [x, y],
            shape: {
                x: xItem,
                y: yItem,
                width: opts.lineWidth * 2,
                height: -zItem
            },
            style: api.style()
        };
    }

    /**
     * 
     * @param {*} opts 
     * @param {*} chartBody 
     */
    getSeries(opts, chartBody) {
        let {
            axisInfo,
            series
        } = chartBody;

        let seriesOption = [{
            type: 'custom',
            renderItem: (params, api) => this.renderAxisItem(params, api, {
                ...axisInfo,
                ...opts
            }),
            data: [0],
            silent: true
        }]

        let rtn = splitArr(series[0].dataList);
        rtn.map((temp) => {
            let dataList = [];
            temp.map((item) => {
                let data = this.getSeriesData(item, axisInfo, series[0].color);
                if (!isEmpty(data)) {
                    dataList.push(data);
                }
            });
            seriesOption.push({
                type: 'custom',
                renderItem: (params, api) => this.renderDataItem(params, api, {
                    ...axisInfo,
                    ...opts
                }),
                data: dataList,
            });
        });

        return seriesOption;
    }

    getSeriesData(dataList = [], axisInfo, color) {
        let {
            xRangeMax,
            xRangeMin,
            zRangeMin,
            cycleNum = 0,
            phaseShift
        } = axisInfo;
        let value = dataList.slice(0);
        let xValue = parseFloat(value[0]) - phaseShift;
        let yValue = parseFloat(value[1]);
        // let zValue = parseFloat(value[2]) <= zRangeMin ? 0 : parseFloat(value[2]);
        
        let zValue = parseFloat(value[2]) <= zRangeMin ? zRangeMin : parseFloat(value[2]);

        //调整相位偏差
        if (xValue < 0) {
            xValue += xRangeMax - xRangeMin;
        }
        if (cycleNum > 0) {
            zValue = (zValue / cycleNum) * 100;
        }
        // if (zValue > 0) {
            return {
                value: [xValue, yValue, zValue],
                itemStyle: color && color.length > 0 ? {
                    opacity: 1,
                } : {
                        color: value[3],
                        opacity: 1,
                    }
            };
        // }
    }

    distory = () => {
        this.playing = false;
        cancelAnimationFrame(this.AnimationDraw);
        this.AnimationDraw = null;
    }

    /**
     * 图谱播放
     * @param {Object} chart 图谱对象
     */
    cycleShiftPlay = () => {
        if (this.chart.cachedModule.guid != this.guid || this.opts.type != 9) {
            this.playing = false;
        }
        cancelAnimationFrame(this.AnimationDraw);
        this.AnimationDraw = null;
        if (this.playing) {
            if (this.cycleShift === 100) {
                this.cycleShift = 0;
            } else {
                this.cycleShift++;
            }
            if (this.chart.cycleShift) {
                this.chart.cycleShift(this.cycleShift);
            }
            this.AnimationDraw = requestAnimationFrame(throttle(this.cycleShiftPlay.bind(this), 50, false));
        }
    };

    showPhaseThreshold = () => {
        this.chart.setOption({
            dataZoom: [{
                show: this.phaseShiftShow
            }, {
                show: this.thresholdFilterShow
            }]
        }, false, false)
    }

    ampZoom = (type, opts, chartBody) => {
        const size = 10;
        let {
            zAxis
        } = this.chart.getOption();
        let max = zAxis[0].max;
        let min = zAxis[0].min;
        if (type === 'zoomIn') {
            max = max * size;
            min = min * size;
        } else if (type === 'zoomOut') {
            max = max / size;
            min = min / size;
        }
        if (max > chartBody.axisInfo.zRangeMax * size ||
            max < chartBody.axisInfo.zRangeMax / 100 ||
            min > chartBody.axisInfo.zRangeMin * size ||
            min < chartBody.axisInfo.zRangeMin / 100
        ) {
            return false;
        }
        let chartBodyTmp = deepClone(chartBody);
        chartBodyTmp.axisInfo.zRangeMax = max;
        chartBodyTmp.axisInfo.zRangeMin = min;


        this.chart.setOption({
            zAxis: [{
                max: max,
                min: min,
            }],
            series: this.getSeries(opts, chartBodyTmp)
        }, false, false);
        chartBodyTmp = null;
    }

}

export default PRPSD