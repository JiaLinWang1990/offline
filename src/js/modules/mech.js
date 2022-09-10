import Chart from './chart';
import { merge, isEmpty } from '../utils';


/**
 * 机械特性相关图谱类
 */
class Mech extends Chart {
    constructor(...args) {
        super(...args);
    }
    /**
     * 生成机械特性相关图谱配置项
     * @param {*自定义配置} data 
     */
    option() {
        let opts = this.opts;
        let chartBody = this.chartBody;
        let { title, axisInfo, series } = chartBody;
        let log = 0;
        if (axisInfo.yRangeMax) {
            log = Math.ceil(Math.log10(axisInfo.yRangeMax));
        }

        let chartOption = {
            title: {
                text: title,
            },
            legend: {
                data: series.map((item, index) => { return isEmpty(item['name']) ? (index + 1).toString() : item['name']; })
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'line',
                },
                formatter: function (param) {
                    let htmlStr = `<div style="padding:${opts.fontSize * 0.5}px"><span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.xDesc}:${param[0].value[0]} ${axisInfo.xUnit}<span><br/>`;
                    param.map((series) => {
                        let color = series.color;//图例颜色
                        //为了保证和原来的效果一样，这里自己实现了一个点的效果
                        htmlStr += `<div style="display: flex;align-items: center;"><span style="display:inline-block;width:${opts.fontSize}px;height:${opts.fontSize}px;border-radius:${opts.fontSize * 0.5}px;margin-right:${opts.fontSize * 0.5}px;background-color:${color};"></span>`
                        if (axisInfo.valDesc) {
                            let dataList = chartBody.series[series.seriesIndex].dataList;
                            if (dataList[series.dataIndex]) {
                                htmlStr += `${series.seriesName}: ${axisInfo.valDesc.on}<br/></div>`;
                            } else {
                                htmlStr += `${series.seriesName}: ${axisInfo.valDesc.off}<br/></div>`;
                            }
                        } else {
                            htmlStr += `${series.seriesName}: ${series.value[1]} ${axisInfo.yUnit}<br/></div>`;
                        }
                    });
                    htmlStr += '</div>';
                    return htmlStr;
                }
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
            xAxis: [{
                type: 'value',
                boundaryGap: false,
                name: axisInfo.xDesc + ' [' + axisInfo.xUnit + ']',
                min: axisInfo.xRangeMin,
                max: axisInfo.xRangeMax,
            }],
            yAxis: [axisInfo.valDesc
                ? {
                    type: 'value',
                    name: axisInfo.yDesc,
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: false
                    },
                    max: series.length * 2,
                }
                : {
                    type: 'value',
                    name: axisInfo.yDesc + ' [' + axisInfo.yUnit + ']',
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
        };
        return merge(chartOption, this.baseOption());
    }

    getSeries(opts, chartBody) {
        let seriesOption = [];
        let { axisInfo, series } = chartBody;
        let xRange = parseFloat(axisInfo.xRangeMax) - parseFloat(axisInfo.xRangeMin);
        series.map(function (item, index) {
            let data = [];
            if (typeof item.dataList[0] === 'number') {
                let interval = xRange / (item.dataList.length - 1);
                if (axisInfo.valDesc) {
                    item.dataList.map(function (d, i) {
                        data.push([(i * interval).toFixed(2), (d + (series.length - index) * 2 - 1)]);
                    });
                } else {
                    item.dataList.map(function (d, i) {
                        data.push([(i * interval).toFixed(2), d]);
                    });
                }
            } else {
                data = item.dataList;
            }
            let styleOption = {};
            if (isEmpty(item.color)) {
                styleOption = {
                    lineStyle: {
                        width: opts.lineWidth * 2
                    }
                }
            } else {
                styleOption = {
                    itemStyle: {
                        color: item.color,
                    },
                    lineStyle: {
                        color: item.color,
                        width: opts.lineWidth * 2
                    }

                }
            }

            seriesOption.push({
                type: 'line',
                name: isEmpty(item.name) ? (index + 1).toString() : item.name,
                data: data,
                showSymbol: false,
                smooth: chartBody.axisInfo.valDesc ? false : true,
                step: chartBody.axisInfo.valDesc ? 'start' : false,
                large: true,
                ...styleOption
            });
        });
        return seriesOption;
    }
}
export default Mech;


