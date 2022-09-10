
import Chart from './chart';
import { merge } from '../utils';
/**
 * 振荡波--局放图谱--放电量
 */
class Pdischarge extends Chart {
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
        let { title, axisInfo, series } = chartBody;

        let legend = series.map((item) => { return item['name']; });
        let chartOption = {
            title: {
                text: title,
            },
            legend: {
                data: legend,
                top: opts.fontSize * 4,
                orient: 'vertical',
                left: 'right',
                itemWidth: opts.fontSize,
            },
            tooltip: {
                trigger: "item",
                axisPointer: {
                    type: "line"
                },
                formatter: function (param) {
                    let htmlStr = `<div style="padding:${opts.fontSize *
                        0.5}px"><span style="font-size:${opts.fontSize * 1.1}px">${
                        axisInfo.xDesc
                        }:${param.data[0]} ${axisInfo.xUnit}<span><br/>`;
                    let color = param.color; //图例颜色
                    //为了保证和原来的效果一样，这里自己实现了一个点的效果
                    htmlStr += `<div style="display: flex;align-items: center;"><span style="display:inline-block;width:${
                        opts.fontSize
                        }px;height:${opts.fontSize}px;border-radius:${opts.fontSize *
                        0.5}px;margin-right:${opts.fontSize *
                        0.5}px;background-color:${color};"></span>`;
                    htmlStr += `${param.seriesName}: ${param.value[1]} ${axisInfo.yUnit}<br/></div>`;
                    htmlStr += "</div>";
                    return htmlStr;
                }
            },
            toolbox: {},
            grid: [{
                left: opts.fontSize * 5.5,
                right: opts.fontSize * 5.5,
            }],
            xAxis: [{
                scale: true,
                name: axisInfo.xDesc + '(' + axisInfo.xUnit + ")",
                maxInterval: Math.floor((axisInfo.xRangeMax - axisInfo.xRangeMin) / 10),//axisInfo.xInterval,
                min: axisInfo.xRangeMin,
                max: axisInfo.xRangeMax,
                axisLabel: {
                    fontSize: opts.fontSize * 0.8,
                    showMaxLabel: true,
                },
            }],
            yAxis: [{
                type: 'value',
                name: axisInfo.yDesc + axisInfo.yUnit,
                nameGap: opts.fontSize * 4,
                nameLocation: axisInfo.nameLocation,
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

        series.map((item) => {
            seriesOption.push({
                name: item.name,
                type: 'scatter',
                symbol: 'roundRect',
                symbolSize: opts.fontSize * 0.6,
                itemStyle: {
                    color: item.color
                },
                data: item.dataList,
                barMinWidth: opts.fontSize,
                symbolOffset: ['50%', 0]
            });
        });


        return seriesOption;
    }
}

export default Pdischarge;
