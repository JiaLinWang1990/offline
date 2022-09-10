import Chart from './chart';
import { merge } from '../utils';

/**
 * 温度图谱类
 */
class Temperature extends Chart {
    constructor(...args) {
        super(...args);
    }
    /**
     * 温度配置项
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
                        htmlStr += `<span style="display:inline-block;width:${opts.fontSize}px;height:${opts.fontSize}px;border-radius:${opts.fontSize * 0.5}px;margin-right:${opts.fontSize * 0.5}px;background-color:${color};"></span>`
                        htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.desc}:${series[0].dataList[0]}${axisInfo.unit}<span><br/>`;
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
        let fontStyle = {
            fill: opts.color,
            font: `${opts.fontSize * 1.1}px sans-serif`,
            textAlign: 'center',
            textVerticalAlign: 'middle'
        }

        let vertical = opts.mode === 1;//0横向，1纵向
        let lineArray = [];
        for (let i = 0, count = 10; i <= count; i++) {
            lineArray.push({
                type: 'line',
                position: [x, y],
                shape: {
                    x1: vertical
                        ? i % 2 === 0
                            ? width * 0.5 - opts.fontSize * 2
                            : width * 0.5 - opts.fontSize * 1.5
                        : opts.fontSize * 2 + ((width - opts.fontSize * 4) / count) * i,
                    y1: vertical
                        ? opts.fontSize * 2 + ((height - opts.fontSize * 4) * (count - i)) / count
                        : i % 2 === 0
                            ? height * 0.5 - opts.fontSize * 2
                            : height * 0.5 - opts.fontSize * 1.5,
                    x2: vertical
                        ? width * 0.5 - opts.fontSize
                        : opts.fontSize * 2 + ((width - opts.fontSize * 4) / count) * i,
                    y2: vertical
                        ? opts.fontSize * 2 + ((height - opts.fontSize * 4) * (count - i)) / count
                        : height * 0.5 - opts.fontSize,
                },
                style: {
                    stroke: opts.color,
                    lineWidth: opts.lineWidth * 1.5,
                }
            })
            lineArray.push({
                type: 'text',
                position: [x, y],
                style: {
                    text: i % 2 === 0 ? opts.rangeMin + ((opts.rangeMax - opts.rangeMin) / count) * i : '',
                    x: vertical
                        ? width * 0.5 - opts.fontSize * 4
                        : opts.fontSize * 2 + ((width - opts.fontSize * 4) / count) * i,
                    y: vertical
                        ? opts.fontSize * 2 + ((height - opts.fontSize * 4) * (count - i)) / count - opts.fontSize * 0.5
                        : height * 0.5 - opts.fontSize * 3.5,
                    lineWidth: opts.lineWidth * 1.5,
                    ...fontStyle
                }
            })
        }

        let nomalMaxLine = vertical
            ? opts.fontSize * 2 + ((height - opts.fontSize * 4) / (opts.rangeMax - opts.rangeMin)) * (opts.trigger[0].value - opts.rangeMin)
            : opts.fontSize * 2 + ((width - opts.fontSize * 4) / (opts.rangeMax - opts.rangeMin)) * (opts.trigger[0].value - opts.rangeMin);
        let warningMaxLine = vertical
            ? opts.fontSize * 2 + ((height - opts.fontSize * 4) / (opts.rangeMax - opts.rangeMin)) * (opts.trigger[1].value - opts.rangeMin)
            : opts.fontSize * 2 + ((width - opts.fontSize * 4) / (opts.rangeMax - opts.rangeMin)) * (opts.trigger[1].value - opts.rangeMin);

        let axisPanel = [{
            type: 'circle',
            position: [x, y],
            shape: {
                cx: vertical ? width * 0.5 : 0,
                cy: vertical ? height : height * 0.5,
                r: opts.fontSize * 2,
            },
            style: {
                fill: opts.color
            }
        }, {
            type: 'rect',
            position: [x, y],
            shape: {
                x: vertical ? width * 0.5 - opts.fontSize : opts.fontSize * 1.5,
                y: vertical ? opts.fontSize : height * 0.5 - opts.fontSize,
                width: vertical ? opts.fontSize * 2 : width - opts.fontSize * 1.5,
                height: vertical ? height - opts.fontSize * 1.5 : opts.fontSize * 2
            },
            style: {
                fill: opts.color
            }
        }, {
            type: 'circle',
            position: [x, y],
            shape: {
                cx: vertical ? width * 0.5 : width,
                cy: vertical ? opts.fontSize : height * 0.5,
                r: opts.fontSize,
            },
            style: {
                fill: opts.color
            }
        }, {
            type: 'text',
            position: [x, y],
            style: {
                text: `${opts.desc} [${opts.unit}]`,
                x: vertical ? width * 0.5 + opts.fontSize * 4 : opts.fontSize * 4,
                y: vertical ? height - opts.fontSize * 3 : height * 0.55 + opts.fontSize * 2,
                ...fontStyle,
                fill: opts.color,
                lineWidth: opts.lineWidth * 1.5
            }
        }, {
            type: 'line',
            position: [x, y],
            shape: {
                x1: vertical
                    ? width * 0.5 - opts.fontSize
                    : nomalMaxLine,
                y1: vertical
                    ? height - nomalMaxLine
                    : height * 0.5 - opts.fontSize,
                x2: vertical
                    ? width * 0.5 + opts.fontSize
                    : nomalMaxLine,
                y2: vertical
                    ? height - nomalMaxLine
                    : height * 0.5 + opts.fontSize,
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
                x: vertical ? width * 0.5 + opts.fontSize * 3 : nomalMaxLine,
                y: vertical ? height - nomalMaxLine : height * 0.5 + opts.fontSize * 2,
                ...fontStyle,
                fill: opts.trigger[0].color,
                lineWidth: opts.lineWidth * 1.5
            }
        }, {
            type: 'line',
            position: [x, y],
            shape: {
                x1: vertical
                    ? width * 0.5 - opts.fontSize
                    : warningMaxLine,
                y1: vertical
                    ? height - warningMaxLine
                    : height * 0.5 - opts.fontSize,
                x2: vertical
                    ? width * 0.5 + opts.fontSize
                    : warningMaxLine,
                y2: vertical
                    ? height - warningMaxLine
                    : height * 0.5 + opts.fontSize,
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
                x: vertical ? width * 0.5 + opts.fontSize * 3 : warningMaxLine,
                y: vertical ? height - warningMaxLine : height * 0.5 + opts.fontSize * 2,
                ...fontStyle,
                fill: opts.trigger[1].color,
                lineWidth: opts.lineWidth * 1.5
            }
        },];

        return {
            type: 'group',
            children: axisPanel.concat(lineArray)
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
        let vertical = opts.mode === 1;//0横向，1纵向
        let fontStyle = {
            fill: opts.color,
            font: `${opts.fontSize * 1.1}px sans-serif`,
            textAlign: 'center',
            textVerticalAlign: 'middle'
        }
        let value = vertical
            ? opts.fontSize * 2 + ((height - opts.fontSize * 4) / (opts.rangeMax - opts.rangeMin)) * (api.value(0) - opts.rangeMin)
            : opts.fontSize * 2 + ((width - opts.fontSize * 4) / (opts.rangeMax - opts.rangeMin)) * (api.value(0) - opts.rangeMin);
        if (api.value(0) < opts.rangeMin) {
            value = 0;
        } else if (api.value(0) > opts.rangeMax) {
            value = vertical ? height - opts.fontSize : width - opts.fontSize;
        }

        let { fill: color } = api.style();
        if (api.value(0) >= opts.trigger[0].value && api.value(0) < opts.trigger[1].value) {
            color = opts.trigger[0].color;
        } else if (api.value(0) >= opts.trigger[1].value) {
            color = opts.trigger[1].color;
        }

        let dataPanel = [{
            type: 'circle',
            position: [x, y],
            shape: {
                cx: vertical ? width * 0.5 : 0,
                cy: vertical ? height : height * 0.5,
                r: opts.fontSize,
            },
            style: {
                fill: color
            }
        },
        {
            type: 'rect',
            position: [x, y],
            shape: {
                x: vertical ? width * 0.5 - opts.fontSize * 0.5 : 0,
                y: vertical ? height : height * 0.5 - opts.fontSize * 0.5,
                width: vertical ? opts.fontSize : value,
                height: vertical ? -value : opts.fontSize
            },
            style: {
                fill: color
            }
        }, {
            type: 'text',
            position: [x, y],
            origin: vertical ? [width * 0.5, height - value - opts.fontSize * 2] : null,
            rotation: vertical ? Math.PI * 0.5 : 0,
            style: {
                text: `${api.value(0)}`,
                x: vertical ? width * 0.5 : value + opts.fontSize * 2,
                y: vertical ? height - value - opts.fontSize * 2 : height * 0.5,
                ...fontStyle,
                fill: color
            }
        }];

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
        let { desc, unit, rangeMax, rangeMin, mode } = axisInfo;
        let { lineWidth, fontSize, color } = opts
        let seriesOption = [{
            type: 'custom',
            renderItem: (params, api) => this.renderAxisItem(params, api, {
                desc,
                unit,
                rangeMax,
                rangeMin,
                mode,
                trigger,
                lineWidth,
                fontSize,
                color
            }),
            data: [0],
            silent: true
        }, {
            type: 'custom',
            renderItem: (params, api) => this.renderDataItem(params, api, {
                unit,
                rangeMax,
                rangeMin,
                mode,
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

export default Temperature;