
import Chart from './chart';
import { stripNum, merge } from '../utils';
/**
 * 振荡波--加压图谱
 * 
 */
class Compression extends Chart {
    constructor(...args) {
        super(...args);
    }

    /**
     * 图谱配置项
     * @param {*自定义配置} data 
     */
    option() {
        let opts = this.opts;
        let chartBody = this.chartBody;
        let { title, axisInfo } = chartBody;
        let chartOption = {
            title: {
                text: title,
            },
            legend: {
                show: false,
            },
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "line"
                }, formatter: function (param) {
                    let htmlStr = `<div style="padding:${opts.fontSize *
                        0.5}px"><span style="font-size:${opts.fontSize * 1.1}px">${
                        axisInfo.xDesc
                        }:${Math.floor(param[0].value[0] * 100) / 100} ${axisInfo.xUnit}<span><br/>`;
                    param.map(series => {
                        let color = series.color; //图例颜色
                        //为了保证和原来的效果一样，这里自己实现了一个点的效果
                        htmlStr += `<div style="display: flex;align-items: center;"><span style="display:inline-block;width:${
                            opts.fontSize
                            }px;height:${opts.fontSize}px;border-radius:${opts.fontSize *
                            0.5}px;margin-right:${opts.fontSize *
                            0.5}px;background-color:${color};"></span>`;
                        htmlStr += `${series.seriesName}: ${Math.floor(Number(series.value[1]) * 100) / 100} ${axisInfo.yUnit[series.seriesIndex]}<br/></div>`;
                    });
                    htmlStr += "</div>";
                    return htmlStr;
                }
            },
            toolbox: {},
            dataZoom: [{}, {
                type: 'inside',
                xAxisIndex: 1,
                minSpan: 1
            }],
            grid: [
                { left: opts.fontSize * 5.5, right: opts.fontSize * 3, bottom: '58%' },
                { left: opts.fontSize * 5.5, right: opts.fontSize * 3, top: '58%' },
            ],
            xAxis: [{
                type: 'value',
                gridIndex: 0,
                name: axisInfo.xDesc,
                maxInterval: Math.floor((axisInfo.xRangeMax - axisInfo.xRangeMin) / 6),
                min: axisInfo.xRangeMin,
                max: axisInfo.xRangeMax,
                axisLabel: {
                    formatter: `{value}${axisInfo.xUnit}`,
                    fontSize: opts.fontSize * 0.8,
                },
                axisLine: {
                    onZero: false,
                },
                position: 'bottom',
            }, {
                type: 'value',
                gridIndex: 1,
                name: axisInfo.xDesc,
                maxInterval: Math.floor((axisInfo.xRangeMax - axisInfo.xRangeMin) / 6),
                min: axisInfo.xRangeMin,
                max: axisInfo.xRangeMax,
                nameLocation: axisInfo.nameLocation,
                nameGap: opts.fontSize * 1.8,
                nameTextStyle: {
                    color: opts.color,
                    fontSize: opts.fontSize * 1.1
                },
                axisLabel: {
                    formatter: `{value}${axisInfo.xUnit}`,
                    fontSize: opts.fontSize * 0.8,
                    color: opts.color,
                },
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: opts.color,
                        width: opts.lineWidth
                    },
                },
                splitLine: {
                    lineStyle: {
                        type: 'dotted',
                        color: opts.color,
                        opacity: 0.6,
                        width: opts.lineWidth
                    }
                },
                position: 'bottom',
            }],
            yAxis: [{
                gridIndex: 0,
                name: axisInfo.yDesc[0] + axisInfo.yUnit[0],
                nameGap: opts.fontSize * 3.5,
                nameLocation: axisInfo.nameLocation,
                // splitNumber: 7,
                maxInterval: Math.floor((Math.floor(axisInfo.yRangeMax[0]) - Math.floor(axisInfo.yRangeMin[0])) / 5) + 1,
                minInterval: axisInfo.yInterval[0],
                // minInterval: axisInfo.yInterval[0],
                minorSplitLine: {
                    show: true,
                },
            },
            {
                gridIndex: 1,
                name: axisInfo.yDesc[1] + axisInfo.yUnit[1],
                nameGap: opts.fontSize * 3.5,
                nameLocation: axisInfo.nameLocation,
                // splitNumber: 5,
                maxInterval: Math.floor((Math.ceil(axisInfo.yRangeMax[1]) - Math.ceil(axisInfo.yRangeMin[1])) / 5),
                nameTextStyle: {
                    color: opts.color,
                    fontSize: opts.fontSize * 1.1
                },
                axisLine: {
                    lineStyle: {
                        color: opts.color,
                        width: opts.lineWidth
                    },
                },
                axisTick: {
                    lineStyle: {
                        color: opts.color,
                        width: opts.lineWidth
                    },
                },
                axisLabel: {
                    color: opts.color,
                    fontSize: opts.fontSize,
                },
                splitLine: {
                    lineStyle: {
                        type: 'dotted',
                        color: opts.color,
                        opacity: 0.5,
                        width: opts.lineWidth,
                    }
                },
            }],
            series: this.getSeries(opts, chartBody),
        };
        return merge(chartOption, this.baseOption());
    }

    getSeries(opts, chartBody) {
        let { series } = chartBody;
        let data = [];
        series.map((item) => {
            data = data.concat(item.dataList);
        });
        let seriesOption = [];
        series.map((item, index) => {
            let seriesObj = {};
            if (index == 0) {
                seriesObj = {
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                }
            } else {
                seriesObj = {
                    type: 'bar',
                    barMinWidth: opts.fontSize / 4,
                    barMaxWidth: opts.fontSize / 3,
                    barWidth: opts.fontSize / 4,
                }
            }
            seriesOption.push({
                ...seriesObj,
                name: item.name,
                xAxisIndex: index,
                yAxisIndex: index,
                large: true,
                itemStyle: {
                    color: item.color,
                },
                data: item.dataList,
            })
        });
        return seriesOption;
    }
}

export default Compression;
