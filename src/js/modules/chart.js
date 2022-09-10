import {
    merge
} from '../utils';
import * as echarts from 'echarts'
let init = {
    title: '',
    axisInfo: {
        valDesc: null, //描述：测量值
        valColor: '#008000', //测量值颜色
        bgValDesc: '', //描述：背景值
        bgColor: '#ff0000', //背静值颜色
        unit: 'mV', //单位
        frequecy: 50, //电网频率
        xDesc: '',
        xRangeMax: 360,
        xRangeMin: 0,
        xUnit: '°',
        yDesc: '',
        yRangeMax: 50,
        yRangeMin: 0,
        yUnit: 'T',
        zDesc: '',
        zRangeMax: 100,
        zRangeMin: 0,
        zUnit: 'mV',
        phaseShift: 0,
        cycleShift: 0,
        thresholdFilter: 0,
        zRange: [0, 100],
        cycleNum: 0,
        mode: 0,
    },
    trigger: {
        desc: '',
        value: 0,
        color: '#ff00ff',
        length: 0
    },
    series: [{
        name: '', //例如：有效值
        min: 0, //最小值
        max: 0, //最大值
        color: '',
        dataList: [],
    }]
};

export default class Chart {
    constructor(opts, targetEl) {
        let {
            data,
            ...opt
        } = opts;
        let yRangeMax = data.axisInfo ? data.axisInfo.yRangeMax : init.axisInfo.yRangeMax;
        data.axisInfo.phaseShift = data.axisInfo.phaseShift ? data.axisInfo.phaseShift : init.axisInfo.phaseShift;
        data.axisInfo.thresholdFilter = data.axisInfo.thresholdFilter ? data.axisInfo.thresholdFilter : init.axisInfo.thresholdFilter;
        this.chartBody = merge(data, init);
        this.opts = {
            yRangeMax: yRangeMax,
            ...opt
        };
        this.chart = echarts.getInstanceByDom(targetEl);
    }
    baseOption() {
        let opts = this.opts;
        let option = {
            backgroundColor: opts.background,
            title: {
                // left: opts.fontSize,
                x: 'center',
                textStyle: {
                    color: opts.color,
                    fontSize: opts.fontSize * 1.2,
                },
                subtextStyle: {
                    color: opts.color,
                    fontSize: opts.fontSize,
                }
            },
            legend: {
                type: 'scroll',
                width: '70%',
                top: opts.fontSize * 1.5,
                right: opts.fontSize * 2,
                textStyle: {
                    color: opts.color,
                    fontSize: opts.fontSize,
                    lineHeight: opts.fontSize * 1.2,
                },
                pageIconColor: opts.color,
                pageIconSize: opts.fontSize * 1.2,
                pageTextStyle: {
                    color: opts.color,
                    fontSize: opts.fontSize * 1.2
                },
                itemGap: opts.fontSize,
                itemWidth: opts.fontSize * 1.5,
                itemHeight: opts.fontSize,
            },
            grid: {
                borderColor: opts.color,
                borderWidth: opts.lineWidth,
                top: opts.fontSize * 4,
                left: opts.fontSize * 4,
                right: opts.fontSize * 3,
                bottom: opts.fontSize * 3,
            },
            tooltip: {
                show: true,
                confine: true, //将 tooltip 框限制在图表的区域内
                axisPointer: {
                    lineStyle: {
                        type: 'dotted',
                        color: opts.color,
                        opacity: 0.6,
                        width: opts.lineWidth
                    },
                },
                textStyle: {
                    color: '#ccc', //opts.color,
                    fontSize: opts.fontSize
                }
            },
            toolbox: {
                right: opts.fontSize,
                feature: {
                    saveAsImage: {
                        show: false
                    },
                    restore: {
                        show: false
                    },
                    dataView: {
                        show: false
                    },
                    dataZoom: {
                        show: false
                    },
                    magicType: {
                        show: false
                    },
                    brush: {
                        show: false
                    }
                },
                iconStyle: {
                    borderColor: opts.color,
                },
                tooltip: {
                    show: true,
                    formatter: function (param) {
                        return '<div>' + param.title + '</div>'; // 自定义的 DOM 结构
                    },
                    backgroundColor: opts.background,
                    textStyle: {
                        fontSize: opts.fontSize
                    },
                    extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);' // 自定义的 CSS 样式
                }
            },
            xAxis: [{
                nameLocation: 'center',
                nameGap: opts.fontSize * 1.8,
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
                    fontSize: opts.fontSize
                },
                splitLine: {
                    lineStyle: {
                        type: 'dotted',
                        color: opts.color,
                        opacity: 0.6,
                        width: opts.lineWidth
                    }
                },
            }],
            yAxis: [{
                nameLocation: 'end',
                nameGap: opts.fontSize * 0.9,
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
            dataZoom: [{
                type: 'inside',
                xAxisIndex: 0,
                minSpan: 1
            }],
            textStyle: {
                fontFamily: 'Arial'
            },
            animation: false,
        }
        return option;
    }
}