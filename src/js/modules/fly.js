
import Chart from './chart';
import Color from '../utils/color';
import { merge, initDimArr, isEmpty } from '../utils';
import { getColorIndex, splitArr } from '../utils/common';


/**
 * AE飞行图谱类
 */
class Fly extends Chart {
    constructor(...args) {
        super(...args);
    }
    /**
     * 生成AE相位图谱配置项
     * @return {*自定义配置} option
     */
    option() {
        let opts = this.opts;
        let chartBody = this.chartBody;
        let { title, axisInfo } = chartBody;
        let { color } = chartBody.series[0];
        let visualMap = {};
        //设置图谱颜色
        if (isEmpty(color)) {
            color = Color.getColorList('tlb');
            visualMap = {
                seriesIndex: -1,
                hoverLink:false
            }
        }
        else {
            color = Color.getColorList(color);
        }
        let log = 0;
        if (axisInfo.yRangeMax) {
            log = Math.ceil(Math.log10(axisInfo.yRangeMax));
        }

        let chartOption = {
            title: {
                text: title,
            },
            legend: {
                show: false,
                data: [axisInfo.zDesc]
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    restore: {},
                    saveAsImage: {}
                }
            },
            tooltip: {
                trigger: 'item',
                axisPointer: {
                    type: 'none',
                },
                formatter: function (params) {
                    if (params.componentType === 'series') {
                        let htmlStr = `<div style="padding:${opts.fontSize * 0.5}px">`;
                        let color = params.color;//图例颜色
                        htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.xDesc}:${params.value[0]}${axisInfo.xUnit}<span><br/>`;
                        htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.yDesc}:${params.value[1]}${axisInfo.yUnit}<span><br/>`;
                        if (params.value[2]) {
                            //为了保证和原来的效果一样，这里自己实现了一个点的效果
                            htmlStr += `<div style="display: flex;align-items: center;"><span style="display:inline-block;width:${opts.fontSize}px;height:${opts.fontSize}px;border-radius:${opts.fontSize * 0.5}px;margin-right:${opts.fontSize * 0.5}px;background-color:${color};"></span>`
                            htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.zDesc}:${parseInt(params.value[2])}${axisInfo.zUnit}<span><br/></div>`;
                        }
                        htmlStr += '</div>';
                        return htmlStr;
                    }
                },
            },
            xAxis: [{
                type: 'value',
                name: axisInfo.xDesc + ' [' + axisInfo.xUnit + ']',
                interval: (axisInfo.xRangeMax - axisInfo.xRangeMin) / 4,
                min: axisInfo.xRangeMin,
                max: axisInfo.xRangeMax,
            }],
            yAxis: [{
                type: 'value',
                interval: (axisInfo.yRangeMax - axisInfo.yRangeMin) / 4,
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
            }],
            series: this.getSeries(opts, chartBody),
            visualMap: {
                top: opts.fontSize * 3.6,
                min: axisInfo.zRangeMin,
                max: axisInfo.zRangeMax,
                inRange: {
                    color: color
                },
                ...visualMap
            },
            phaseShift: axisInfo.phaseShift
        };
        return merge(chartOption, this.baseOption());
    }
    getSeries(opts, chartBody) {
        let { axisInfo, trigger, series } = chartBody;
        let { zDesc } = axisInfo;

        let seriesOption = [{
            type: 'line',
            data: [],
            silent: true,
            showSymbol: false,
            markLine: {
                silent: true,
                symbolSize: 0,
                lineStyle: {
                    width: opts.lineWidth,
                    type: 'dashed',
                    color: trigger.color
                },
                data: [{
                    name: trigger.desc,
                    yAxis: trigger.value,
                    symbol: 'circle'
                }]
            },
        }]

        let point_data = initDimArr(320, 200, 0);
        let rtn = splitArr(series[0].dataList);
        rtn.map((temp) => {
            let dataList = [];
            temp.map((item) => {
                let data = this.getSeriesData(item, axisInfo, series[0].color, point_data);
                if (!isEmpty(data)) {
                    dataList.push(data);
                }
            });
            seriesOption.push({
                name: zDesc,
                type: 'scatter',
                data: dataList,
                symbolSize: opts.fontSize * 0.4,
                symbolOffset: ['25%', '-25%'],
            });
        });

        return seriesOption;
    }
    getSeriesData(dataList = [], axisInfo, color, points) {
        let { xRangeMax, xRangeMin, yRangeMax, yRangeMin, zRangeMin, cycleNum = 0, phaseShift } = axisInfo;
        let value = dataList.slice(0);

        let yValue = parseFloat(value[1]);
        let xValue = parseFloat(value[0]) - phaseShift;
        //调整相位偏差
        if (xValue < 0) {
            xValue += xRangeMax - xRangeMin;
        }

        let xRange = parseFloat(xRangeMax) - parseFloat(xRangeMin);
        let yRange = parseFloat(yRangeMax) - parseFloat(yRangeMin);

        if (isEmpty(value[2])) {
            value[2] = getColorIndex(value[0], value[1], xRange, yRange, points);

            let zValue = parseFloat(value[2]) < zRangeMin ? 0 : parseFloat(value[2]);
            if (cycleNum > 0) {
                zValue = (zValue / cycleNum) * 100;
            }
            if (zValue > 0) {
                return {
                    value: [xValue, yValue, zValue],
                    itemStyle: color && color.length > 0
                        ? {
                            opacity: 1,
                        }
                        : {
                            color: value[3],
                            opacity: 1,
                        }
                };
            }
        } else if (typeof (value[2]) === 'string') {
            return {
                value: [xValue, yValue],
                itemStyle: {
                    color: value[2]
                }
            };
        }
    }
}

export default Fly;