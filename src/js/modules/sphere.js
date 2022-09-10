import Chart from './chart';
import { merge } from '../utils';

class Sphere extends Chart {
    constructor(...args) {
        super(...args);
    }

    /**
     * 水球配置项
     * @param {*自定义配置} custom 
     */
    option() {
        let opts = this.opts;
        let chartBody = this.chartBody;

        let chartOption = {
            title: {
                text: chartBody.title,
            },
            tooltip: {
                trigger: 'item',
                axisPointer: {
                    type: 'none',
                },
                formatter: function (params) {
                    if (params.componentType === 'series') {
                        let { axisInfo, trigger, series } = chartBody;
                        let color = series[0].color;
                        if (series[0].dataList[0] >= trigger[0].value && series[0].dataList[0] < trigger[1].value) {
                            color = trigger[0].color;
                        } else if (series[0].dataList[0] >= trigger[1].value) {
                            color = trigger[1].color;
                        }
                        let htmlStr = `<div style="padding:${opts.fontSize * 0.5}px">`;
                        htmlStr += `<div style="display: flex;align-items: center;"><span style="display:inline-block;width:${opts.fontSize}px;height:${opts.fontSize}px;border-radius:${opts.fontSize * 0.5}px;margin-right:${opts.fontSize * 0.5}px;background-color:${color};"></span>`
                        htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.desc}:${series[0].dataList[0]}${axisInfo.unit}<span><br/></div>`;
                        htmlStr += '</div>';
                        return htmlStr;
                    }
                },
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            legend: { show: false },
            xAxis: [{show: false}],
            yAxis: [{show: false}],
            dataZoom: [{
                zoomLock: true
            }],
            series: this.getSeries(opts, chartBody),
        };
        return merge(chartOption, this.baseOption());
    }

    /**
     * 根据测量值获取在球中的坐标
     * @param {Number} value 测量值
     * @param {Object} opts 配置参数
     */
    getXYPosition(value, { r, rangeMax, rangeMin }) {
        let y = (r * 2) / (rangeMax - rangeMin) * (value - rangeMin)
        let x = Math.sqrt(Math.pow(r, 2) - Math.pow(Math.abs(r - y), 2))
        return [x, y];
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

        let { coordSys: { x, y, width, height } } = params;

        let size = Math.min(parseFloat(width), parseFloat(height)) * 0.5;
        let r = size * 0.86;
        let inr = size * 0.80;

        let fontStyle = {
            fill: opts.color,
            font: `${opts.fontSize * 1.1}px sans-serif`,
            textAlign: 'left',
            textVerticalAlign: 'middle'
        }

        let warningLine = this.getXYPosition(opts.trigger[0].value, {
            r: inr,
            rangeMax: opts.rangeMax,
            rangeMin: opts.rangeMin
        });
        let alarmLine = this.getXYPosition(opts.trigger[1].value, {
            r: inr,
            rangeMax: opts.rangeMax,
            rangeMin: opts.rangeMin
        });

        let axisPanel = [{
            type: 'ring',
            position: [x, y],
            shape: {
                cx: width * 0.5,
                cy: height * 0.5,
                r: r * 1.06,
                r0: r
            },
            style: {
                fill: opts.color
            }
        }, {
            type: 'text',
            position: [x, y],
            style: {
                text: `${opts.desc} [${opts.unit}]`,
                x: width * 0.5,
                y: height * 0.5 + opts.fontSize * 2,
                ...fontStyle,
                textAlign: 'center',
            }
        }, {
            type: 'line',
            position: [x, y],
            shape: {
                x1: width * 0.5 - warningLine[0],
                y1: height * 0.5 + inr - warningLine[1],
                x2: width * 0.5 + warningLine[0],
                y2: height * 0.5 + inr - warningLine[1],
            },
            style: {
                stroke: opts.trigger[0].color,
                lineWidth: opts.lineWidth * 1.5,
                lineDash: [opts.lineWidth * 2],
                opacity: 0.5
            }
        }, {
            type: 'text',
            position: [x, y],
            style: {
                text: `${opts.trigger[0].value}`,
                x: width * 0.5 + r * 1.06,
                y: height * 0.5 + inr - warningLine[1],
                ...fontStyle,
                fill: opts.trigger[0].color,
                lineWidth: opts.lineWidth * 1.5
            }
        }, {
            type: 'line',
            position: [x, y],
            shape: {
                x1: width * 0.5 - alarmLine[0],
                y1: height * 0.5 + inr - alarmLine[1],
                x2: width * 0.5 + alarmLine[0],
                y2: height * 0.5 + inr - alarmLine[1],
            },
            style: {
                stroke: opts.trigger[1].color,
                lineWidth: opts.lineWidth * 1.5,
                lineDash: [opts.lineWidth * 2],
                opacity: 0.5
            }
        }, {
            type: 'text',
            position: [x, y],
            style: {
                text: `${opts.trigger[1].value}`,
                x: width * 0.5 + r * 1.06,
                y: height * 0.5 + inr - alarmLine[1],
                ...fontStyle,
                fill: opts.trigger[1].color,
                lineWidth: opts.lineWidth * 1.5
            }
        },];

        return {
            type: 'group',
            children: axisPanel
        }
    }


    /**
     * 渲染数据
     * @param {*} params 
     * @param {*} api 
     * @param {*} opts 
     */
    renderDataItem(params, api, opts) {
        let { coordSys: { x, y, width, height } } = params;
        let size = Math.min(parseFloat(width), parseFloat(height)) * 0.5;
        let r = size * 0.80;

        let fontStyle = {
            fill: opts.color,
            font: `${opts.fontSize * 2}px sans-serif`,
            textAlign: 'center',
            textVerticalAlign: 'middle'
        }

        let { fill: color } = api.style();
        if (api.value(0) >= opts.trigger[0].value && api.value(0) < opts.trigger[1].value) {
            color = opts.trigger[0].color;
        } else if (api.value(0) >= opts.trigger[1].value) {
            color = opts.trigger[1].color;
        }

        let valueLine = this.getXYPosition(api.value(0), {
            r,
            rangeMax: opts.rangeMax,
            rangeMin: opts.rangeMin
        });

        // let halfValueLine = this.getXYPosition(api.value(0) * 0.75, {
        //     r,
        //     rangeMax: opts.rangeMax,
        //     rangeMin: opts.rangeMin
        // });

        //计算弧度
        let valueArc = Math.asin((r - valueLine[1]) / r);

        let dataPanel = [{
            type: 'ring',
            position: [x, y],
            shape: {
                cx: width * 0.5,
                cy: height * 0.5,
                r: r * 1.05,
                r0: r,
            },
            style: {
                fill: color
            }
        }, {
            type: 'text',
            position: [x, y],
            style: {
                text: `${api.value(0)}`,
                x: width * 0.5,
                y: height * 0.5,
                ...fontStyle,
                fill: color
            }
        },
        {
            type: 'arc',
            position: [x, y],
            shape: {
                cx: width * 0.5,
                cy: height * 0.5,
                r: r,
                startAngle: Math.PI - valueArc,
                endAngle: valueArc,
                clockwise: false
            },
            style: {
                fill: color,
                stroke: color,
                opacity: 0.5
            }
        },
        //  {
        //     type: 'bezierCurve',
        //     position: [x, y],
        //     shape: {
        //         x1: width * 0.5 - halfValueLine[0],
        //         y1: height * 0.5 + r - halfValueLine[1],
        //         x2: width * 0.5 + halfValueLine[0],
        //         y2: height * 0.5 + r - halfValueLine[1],
        //         cpx1: width * 0.5 - halfValueLine[0] * 0.5,
        //         cpy1: height * 0.5 + r - halfValueLine[1] * 1.5,
        //         cpx2: width * 0.5 + halfValueLine[0] * 0.5,
        //         cpy2: height * 0.5 + r - halfValueLine[1],
        //     },
        //     style: {
        //         fill: color,
        //         stroke: color,
        //         opacity: 0.5
        //     }
        //     }
        ];

        return {
            type: 'group',
            children: dataPanel
        }
    }

    /**
     * 
     * @param {*} opts 
     * @param {*} chartBody 
     */
    getSeries(opts, chartBody) {
        let { axisInfo, trigger, series } = chartBody;
        let { desc, unit, rangeMax, rangeMin, vertical } = axisInfo;
        let { lineWidth, fontSize, color } = opts
        let seriesOption = [{
            type: 'custom',
            renderItem: (params, api) => this.renderAxisItem(params, api, {
                desc,
                unit,
                rangeMax,
                rangeMin,
                vertical,
                trigger,
                lineWidth,
                fontSize,
                color
            }),
            data: [0],
            silent: true,
            z: 10
        }, {
            type: 'custom',
            renderItem: (params, api) => this.renderDataItem(params, api, {
                unit,
                rangeMax,
                rangeMin,
                vertical,
                trigger,
                lineWidth,
                fontSize,
                color
            }),
            data: [{
                value: series[0].dataList,
                itemStyle: {
                    color: series[0].color,
                    opacity: 1,
                }
            }],
        }]

        return seriesOption;
    }
}

export default Sphere;