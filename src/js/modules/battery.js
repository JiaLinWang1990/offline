
import Chart from './chart';
import { merge, getStringCode } from '../utils';
/**
 * 周期图谱类
 */
class Battery extends Chart {
    constructor(...args) {
        super(...args);
    }

    /**
     * 周期图谱配置项
     * @param {*自定义配置} data 
     */
    option() {
        let opts = this.opts;
        let chartBody = this.chartBody;
        let { title, axisInfo, series } = chartBody;

        let chartOption = {
            title: {
                text: title,
            },
            legend: {
                data: series.map((item) => { return item['name']; })
            },
            tooltip: {
                trigger: 'item',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function (params) {
                    if (params.componentType === 'series') {
                        let htmlStr = `<div style="padding:${opts.fontSize * 0.5}px">`;
                        let color = params.color;//图例颜色
                        htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${params.seriesName}:${params.value[0]}<span><br/>`;
                        htmlStr += `<div style="display: flex;align-items: center;"><span style="display:inline-block;width:${opts.fontSize}px;height:${opts.fontSize}px;border-radius:${opts.fontSize * 0.5}px;margin-right:${opts.fontSize * 0.5}px;background-color:${color};"></span>`
                        htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.yDesc}:${params.value[1]}${axisInfo.yUnit}<span><br/></div>`;
                        htmlStr += '</div>';
                        return htmlStr;
                    }
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
                type: 'category',
                interval: 5,
            }],
            yAxis: [{
                type: 'value',
                name: axisInfo.yDesc + ' [' + axisInfo.yUnit + ']',
                interval: (axisInfo.yRangeMax - axisInfo.yRangeMin) / 4,
                min: axisInfo.yRangeMin,
                max: axisInfo.yRangeMax,
            }],
            series: this.getSeries(opts, chartBody),
        };
        return merge(chartOption, this.baseOption());
    }

    getSeries(opts, chartBody) {
        let { trigger, series } = chartBody;
        let data = [];
        series.map((item) => {
            data = data.concat(item.dataList);
        });
        let seriesOption = [{
            type: 'line',
            data: [],
            silent: true,
            showSymbol: false,
            markLine: this.getMarkLine(opts, trigger)
        }];

        series.map((item) => {
            let itemDataList = item.dataList;
            let dataList = [];
            if (itemDataList.length > 0) {
                //全集
                for (let i = 0; i < data.length; i++) {
                    //排除
                    let barring = true;
                    //子集
                    for (let j = 0; j < itemDataList.length; j++) {
                        //判断序号是否相同
                        if (itemDataList[j][0] === data[i][0]) {
                            dataList.push(itemDataList[j]);
                            barring = false;
                        }
                    }
                    if (barring) {
                        dataList.push([data[i][0], '-', 0]);
                    }
                }
            }

            seriesOption.push({
                name: item.name,
                type: 'bar',
                barGap: '-100%',
                itemStyle: {
                    color: item.color
                },
                data: dataList.sort((a, b) => getStringCode(a[0]) - getStringCode(b[0])),
                barMinWidth: opts.fontSize,
            });
        });


        return seriesOption;
    }

    getMarkLine(opts, trigger) {
        let data = [];
        trigger.map((item) => {
            data.push(
                {
                    yAxis: item.value,
                    lineStyle: {
                        normal: {
                            color: item.color
                        }
                    },
                }
            );
        });

        let markLine = {
            silent: true,
            symbolSize: 0,
            lineStyle: {
                width: opts.lineWidth,
                type: 'dashed'
            },
            data: data
        };
        return markLine;
    }
}

export default Battery;
