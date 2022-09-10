import Chart from './chart';
import { merge } from '../utils';


/**
 * 铁芯接地电流图谱类
 */
class Dashboard extends Chart {
    constructor(...args) {
        super(...args);
    }
    /**
     * 生成铁芯接地电流配置项
     * @param {*自定义配置} custom 
     */
    option() {
        let opts = this.opts;
        let chartBody = this.chartBody;

        let range = chartBody.axisInfo.rangeMax - chartBody.axisInfo.rangeMin;
        let color = [
            [(chartBody.axisInfo.nomalMax - chartBody.axisInfo.rangeMin) / range, chartBody.axisInfo.nomalColor],
            [(chartBody.axisInfo.warningMax - chartBody.axisInfo.rangeMin) / range, chartBody.axisInfo.warningColor],
            [(chartBody.axisInfo.alarmMax - chartBody.axisInfo.rangeMin) / range, chartBody.axisInfo.alarmColor]
        ];
        let chartOption = {
            title: {
                text: chartBody.title,
            },
            tooltip: {
                formatter: function (params) {
                    if (params.componentType === 'series') {
                        let color = chartBody.axisInfo.nomalColor;
                        if (params.value > chartBody.axisInfo.nomalMax && params.value <= chartBody.axisInfo.warningMax) {
                            color = chartBody.axisInfo.warningColor;
                        } else if (params.value > chartBody.axisInfo.warningMax && params.value <= chartBody.axisInfo.alarmMax) {
                            color = chartBody.axisInfo.alarmColor;
                        }
                        let htmlStr = `<div style="padding:${opts.fontSize * 0.5}px">`;
                        htmlStr += `<div style="display: flex;align-items: center;"><span style="display:inline-block;width:${opts.fontSize}px;height:${opts.fontSize}px;border-radius:${opts.fontSize * 0.5}px;margin-right:${opts.fontSize * 0.5}px;background-color:${color};"></span>`
                        htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${chartBody.axisInfo.desc}:${chartBody.axisInfo.value}${chartBody.axisInfo.unit}<span><br/></div>`;
                        htmlStr += '</div>';
                        return htmlStr;
                    }
                }
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            legend: { show: false },
            xAxis: [{ show: false }],
            yAxis: [{ show: false }],
            series: [
                {
                    name: chartBody.axisInfo.desc,
                    type: 'gauge',
                    radius: '80%',
                    center: ['50%', '55%'],
                    min: chartBody.axisInfo.rangeMin,
                    max: chartBody.axisInfo.rangeMax,
                    axisLine: {// 坐标轴线
                        lineStyle: {
                            color: color,
                            width: opts.fontSize
                        }
                    },
                    axisTick: {// 坐标轴小标记
                        splitNumber: 5,
                        length: opts.fontSize * 1.2,
                        lineStyle: {
                            color: 'auto'
                        }
                    },
                    splitLine: {// 分隔线
                        length: opts.fontSize * 1.4,
                        lineStyle: {
                            color: 'auto'
                        }
                    },
                    axisLabel: {
                        fontSize: opts.fontSize
                    },
                    title: {
                        show: false,
                        textStyle: {
                            fontSize: opts.fontSize,
                            color: opts.color
                        }
                    },
                    detail: {
                        textStyle: {
                            fontWeight: 'bolder',
                            fontSize: opts.detailFontSize ? opts.detailFontSize : opts.fontSize * 1.5
                        },
                        formatter: `{value} ${chartBody.axisInfo.unit}`,
                    },
                    data: [{
                        value: chartBody.axisInfo.value,
                        name: chartBody.axisInfo.desc
                    }]
                }
            ]
        };
        return merge(chartOption, this.baseOption());
    }

}

export default Dashboard;