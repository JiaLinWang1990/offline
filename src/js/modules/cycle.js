
import Chart from './chart';
import { merge } from '../utils';
import { sinSerie } from '../utils/common';

/**
 * 周期图谱类
 */
class Cycle extends Chart {
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
                        htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.xDesc}:${params.value[0]}${axisInfo.xUnit}<span><br/>`;
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
                type: 'value',
                name: axisInfo.xDesc + ' [' + axisInfo.xUnit + ']',
                interval: (axisInfo.xRangeMax - axisInfo.xRangeMin) / 4,
                min: axisInfo.xRangeMin,
                max: axisInfo.xRangeMax,
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
        let { axisInfo:{xRangeMax,xRangeMin,yRangeMax,yRangeMin}, trigger, series } = chartBody;
        let count = 0;
        series.map((item) => {
            count = count + item.dataList.length;
        });
        let interval = (xRangeMax - xRangeMin) / count;
        let sinLine = sinSerie(xRangeMax - xRangeMin, xRangeMin, yRangeMax - yRangeMin, yRangeMin, opts.lineWidth);
        let seriesOption = [{
            ...sinLine,
            markLine: this.getMarkLine(opts, trigger)
        }];

        series.map((item) => {
            let dataList = [];
            for (let i = 0; i < count; i++) {
                let barring = true;
                item.dataList.map((data) => {
                    if (data[0] === i * interval) {
                        dataList.push({
                            value: data
                        });
                        barring = false;
                    }
                });
                if (barring) {
                    dataList.push({
                        value: [i * interval, '-']
                    });
                }
            }

            seriesOption.push({
                name: item.name,
                type: 'bar',
                barGap: '-100%',
                itemStyle: {
                    color: item.color
                },
                data: dataList,
                barMaxWidth: opts.fontSize
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

export default Cycle;
