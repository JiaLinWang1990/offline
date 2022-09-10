import Chart from './chart';
import Color from '../utils/color';
import {
    common
} from '../constants';
import {
    merge,
    isEmpty,
    pathToSvg,
    deepClone
} from '../utils';
import {
    sinSerie,
    splitArr,
    getFixNumByUnit
} from '../utils/common';

/**
 * 生成PRPS/PRPD-2D图谱配置项
 */
class PRP2D extends Chart {
    constructor(...args) {
        super(...args);
        this.phaseShiftShow = false;
        this.thresholdFilterShow = false;
        this.phaseShiftValHasRender = false;
    }
    /**
     * 生成PRPS/PRPD-2D图谱配置项
     * @return {*自定义配置} option
     */
    option() {
        let _self = this;
        let opts = this.opts;
        let chartBody = this.chartBody;
        let {
            title,
            axisInfo
        } = chartBody;
        let {
            color
        } = chartBody.series[0];

        //设置图谱颜色
        if (!isEmpty(color)) {
            color = Color.getColorList(color);
        }
        let log = 0;
        if (axisInfo.yRangeMax) {
            // log = Math.ceil(Math.log10(axisInfo.yRangeMax));
        }
        let barSize = opts.fontSize * 0.75;
        let phaseShift = chartBody.axisInfo.phaseShift ? chartBody.axisInfo.phaseShift / (chartBody.axisInfo.xRangeMax - chartBody.axisInfo.xRangeMin) * 100 : 0;
        let thresholdFilter = chartBody.axisInfo.thresholdFilter ? chartBody.axisInfo.thresholdFilter / (chartBody.axisInfo.yRangeMax - chartBody.axisInfo.yRangeMin) * 100 : 0;

        //最大值
        let subtext = axisInfo.zMaxValue;
        if (!isNaN(Number(subtext))) {
            if (subtext > axisInfo.zRangeMax) {
                subtext = 'Max>'
            } else {
                subtext = 'Max='
            }
            subtext += parseInt(axisInfo.zMaxValue) + axisInfo.zUnit
        }


        let chartOption = {
            title: {
                text: title,
                subtext: subtext,
                itemGap: opts.fontSize * 0.5,
                subtextStyle: {
                    color: opts.color,
                    fontSize: opts.fontSize,
                }
            },
            legend: {
                show: false,
                data: [axisInfo.zDesc]
            },
            grid: {
                left: opts.fontSize * 4,
                bottom: opts.fontSize * 4,
            },
            tooltip: {
                trigger: 'item',
                axisPointer: {
                    type: 'line',
                },
                formatter: function (params) {
                    let htmlStr = `<div style="padding:${opts.fontSize * 0.5}px">`;
                    let color = params.color; //图例颜色
                    htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.xDesc}:${parseInt(params.value[0])}${axisInfo.xUnit}<span><br/>`;
                    let dataValue = getFixNumByUnit(params.value[1], axisInfo.yUnit, 1);
                    htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.yDesc}:${dataValue}${axisInfo.yUnit}<span><br/>`;
                    //为了保证和原来的效果一样，这里自己实现了一个点的效果
                    htmlStr += `<div style="display: flex;align-items: center;"><span style="display:inline-block;width:${opts.fontSize}px;height:${opts.fontSize}px;border-radius:${opts.fontSize * 0.5}px;margin-right:${opts.fontSize * 0.5}px;background-color:${color};"></span>`
                    if (axisInfo.cycleNum > 0 && axisInfo.zSubtitle.length > 0) {
                        htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.zDesc}:${Math.ceil(params.value[2])}<span><br/>`;
                    } else {
                        htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.zDesc}:${parseInt(params.value[2])}${axisInfo.zUnit}<span><br/>`;
                    }
                    htmlStr += '</div>';
                    return htmlStr;
                },
            },
            toolbox: {
                right: opts.fontSize * 2.5,
                top: 0,
                showTitle: false,
                feature: axisInfo.yRangeMin != 0 ? {} : {
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
                        title: '相位偏移',
                        icon: common.thresholdFilterIcon,
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
            graphic: axisInfo.yRangeMin != 0 ? [] : [{
                type: 'image',
                right: opts.fontSize,
                top: opts.fontSize * 4,
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
                top: opts.fontSize * 6,
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
                xAxisIndex: 1,
                start: phaseShift,
                end: phaseShift,
                bottom: 2,
                left: barSize * 3.5,
                right: barSize * 3.5,
                height: barSize * 0.8,
                borderColor: common.sinColor,
                backgroundColor: 'rgba(167,183,204,0.4)',
                // handleIcon: 'M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
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
                labelFormatter: (value, a, b) => {
                    let flag = _self.phaseShiftValHasRender;
                    _self.phaseShiftValHasRender = !_self.phaseShiftValHasRender;
                    return flag ? '' : Math.ceil(value) + chartBody.axisInfo.xUnit;
                }
            }, {
                id: 'threshold',
                show: false,
                type: 'slider',
                orient: 'vertical',
                filterMode: 'none',
                zoomLock: false,
                realtime: false,
                yAxisIndex: 1,
                start: thresholdFilter,
                end: 100,
                left: 0,
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
                    return "|       " + Math.ceil(value) + chartBody.axisInfo.yUnit;
                }
            }],
            xAxis: [{
                type: 'value',
                name: axisInfo.xDesc + ' [' + axisInfo.xUnit + ']',
                interval: (axisInfo.xRangeMax - axisInfo.xRangeMin) / 4,
                min: axisInfo.xRangeMin,
                max: axisInfo.xRangeMax,
            }, {
                show: false,
                min: axisInfo.xRangeMin,
                max: axisInfo.xRangeMax,
            }],
            yAxis: [{
                type: 'value',
                interval: (axisInfo.yRangeMax - axisInfo.yRangeMin) / 4,
                // interval:1,
                min: axisInfo.yRangeMin,
                max: axisInfo.yRangeMax,
                name: function () {
                    let name = axisInfo.yDesc + ' [' + axisInfo.yUnit + ']';
                    if (log > 3) {
                        name = axisInfo.yDesc + ' [x' + Math.pow(10, log - 3) + axisInfo.yUnit + ']';
                    }
                    return name;
                }(),
                axisLabel: {
                    formatter: function (value, index) {
                        if (log > 3) {
                            value = value / Math.pow(10, (log - 3));
                        }
                        return value;
                    },
                }
            }, {
                show: false,
                min: axisInfo.yRangeMin,
                max: axisInfo.yRangeMax,
            }],
            series: this.getSeries(opts, chartBody),
            visualMap: {
                type: 'continuous',
                show: false, //!isEmpty(colors),
                top: opts.fontSize * 2.5,
                min: Number(axisInfo.cycleNum) === 0 ? axisInfo.zRangeMin : axisInfo.zRangeMin / axisInfo.cycleNum,
                max: Number(axisInfo.cycleNum) === 0 ? axisInfo.zRangeMax : axisInfo.zRangeMax / axisInfo.cycleNum,
                range: axisInfo.zRange,
                calculable: true,
                seriesIndex: 'all',
                inRange: isEmpty(color) ? {} : {
                    color: color,
                },
                outOfRange: {
                    color: 'transparent'
                }
            },
            phaseShift: axisInfo.phaseShift
        };
        return merge(chartOption, this.baseOption());
    }

    getSeries(opts, chartBody) {
        let {
            axisInfo,
            series
        } = chartBody;
        let {
            color,
            dataList
        } = series[0]

        //正弦线
        let sinLine = sinSerie(axisInfo.xRangeMax - axisInfo.xRangeMin, axisInfo.xRangeMin, axisInfo.yRangeMax - axisInfo.yRangeMin, axisInfo.yRangeMin, opts.lineWidth);
        let seriesOption = [sinLine];

        let rtn = splitArr(dataList);
        rtn.map((temp) => {
            let dataList = [];
            temp.map((item) => {
                let data = this.getSeriesData(item, axisInfo, color);
                if (!isEmpty(data)) {
                    dataList.push(data);
                }
            });
            seriesOption.push({
                name: axisInfo.zDesc,
                type: 'scatter',
                data: dataList,
                symbolSize: opts.fontSize * 0.4,
                symbolOffset: ['50%', '10%'],
                large: true,
            });
        });
        return seriesOption;
    }

    getSeriesData(dataList = [], axisInfo, color) {
        let {
            xRangeMax,
            xRangeMin,
            yRangeMax,
            yRangeMin,
            zRangeMin,
            cycleNum = 0,
            phaseShift,
            thresholdFilter = 0
        } = axisInfo;
        let value = dataList.slice(0);
        let xValue = parseFloat(value[0]) - phaseShift;
        let yValue = parseFloat(value[1]);
        let zValue = parseFloat(value[2]) <= zRangeMin ? 0 : parseFloat(value[2]);
        if (thresholdFilter < yRangeMin) {
            thresholdFilter = yRangeMin;
        }

        //调整相位偏差
        if (xValue < 0) {
            xValue += xRangeMax - xRangeMin;
        }
        if (cycleNum > 0) {
            zValue = zValue / cycleNum;
        }
        if (zValue > 0 && yValue <= yRangeMax) {
            return {
                value: [xValue, yValue, zValue],
                itemStyle: isEmpty(color) ? {
                    color: value[3],
                    opacity: yValue < thresholdFilter ? 0 : 1,
                } : {
                        opacity: yValue < thresholdFilter ? 0 : 1,
                    }
            };
        }
    }

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
            yAxis
        } = this.chart.getOption();
        let max = yAxis[0].max;
        let min = yAxis[0].min;
        if (type === 'zoomIn') {
            max = max * size;
            min = min * size;
        } else if (type === 'zoomOut') {
            max = max / size;
            min = min / size;
        }
        if (max > chartBody.axisInfo.yRangeMax * size ||
            max < chartBody.axisInfo.yRangeMax / 100 ||
            min > chartBody.axisInfo.yRangeMin * size ||
            min < chartBody.axisInfo.yRangeMin / 100
        ) {
            return false;
        }
        let chartBodyTmp = deepClone(chartBody);
        chartBodyTmp.axisInfo.yRangeMax = max;
        chartBodyTmp.axisInfo.yRangeMin = min;
        this.chart.setOption({
            yAxis: [{
                max: max,
                min: min,
                interval: (max - min) / 4,
            }, {
                max: max,
                min: min,
                interval: (max - min) / 4,
            }],
            series: this.getSeries(opts, chartBodyTmp)

        }, false, false)
    }
}
export default PRP2D;