
import Chart from './chart';
import { merge } from '../utils';
/**
 * 振荡波--局放图谱--放电次数
 */
class DischargeTimes extends Chart {
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
                trigger: "axis",
                axisPointer: {
                    type: "line"
                }, formatter: function (param) {
                    let htmlStr = `<div style="padding:${opts.fontSize *
                        0.5}px"><span style="font-size:${opts.fontSize * 1.1}px">${
                        axisInfo.xDesc
                        }:${param[0].value[0]} ${axisInfo.xUnit}<span><br/>`;
                    param.map(series => {
                        let color = series.color; //图例颜色
                        //为了保证和原来的效果一样，这里自己实现了一个点的效果
                        htmlStr += `<div style="display: flex;align-items: center;"><span style="display:inline-block;width:${
                            opts.fontSize
                            }px;height:${opts.fontSize}px;border-radius:${opts.fontSize *
                            0.5}px;margin-right:${opts.fontSize *
                            0.5}px;background-color:${color};"></span>`;
                        htmlStr += `${series.seriesName}: ${series.value[1]} ${axisInfo.yUnit}<br/></div>`;
                    });
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
                type: 'value',
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
                name: axisInfo.yDesc,
                nameGap: opts.fontSize * 3,
                nameLocation: axisInfo.nameLocation,
                splitNumber: 5,
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
            seriesOption.push({
                name: item.name,
                type: 'bar',
                barGap: '-100%',
                itemStyle: {
                    color: item.color
                },
                z: index == 2 ? 0 : (index + 4) * 2,
                data: item.dataList,
                barMinWidth: opts.fontSize * 0.5,
                barMaxWidth: opts.fontSize * 0.6,
            });
        });


        return seriesOption;
    }
}

export default DischargeTimes;
