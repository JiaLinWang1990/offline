import Chart from './chart';
import Color from '../utils/color';
import { chartType } from '../constants';
import { merge, isEmpty } from '../utils';
import { sinSerie, getFixNumByUnit } from '../utils/common';

/**
 * PRPS图谱类
 */
class PRP3D extends Chart {
    constructor(...args) {
        super(...args);
    }

    /**
     * 生成PRPS3D/PRPD3D图谱配置项
     * @return {*自定义配置} option
     */
    option() {
        let opts = this.opts;
        let chartBody = this.chartBody;
        let { title, axisInfo } = chartBody;
        let { color, dataList } = chartBody.series[0];

        //设置图谱颜色
        if (!isEmpty(color)) {
            color = Color.getColorList(color);
        }

        //最大值
        let subtext = axisInfo.zMaxValue;
        if (!isNaN(Number(subtext))) {
            if (subtext > axisInfo.zRangeMax) {
                subtext = 'Max>'
            } else {
                subtext = 'Max='
            }
            subtext += axisInfo.zMaxValue + axisInfo.zUnit
        }

        let chartOption = {
            backgroundColor: opts.background,
            title: {
                textAlign: "center",
                text: title,
                left: "50%",
                textStyle: {
                    color: opts.color,
                    fontSize: opts.fontSize * 1.2,
                },
                subtext: subtext,
                subtextStyle: {
                    align: "right",
                    color: opts.color,
                    fontSize: opts.fontSize,
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    let htmlStr = `<div style="padding:${opts.fontSize * 0.5}px">`;
                    let color = params.color;//图例颜色
                    htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.yDesc}:${params.value[0]}${axisInfo.yUnit}<span><br/>`;
                    htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.xDesc}:${params.value[1]}${axisInfo.xUnit}<span><br/>`;
                    //为了保证和原来的效果一样，这里自己实现了一个点的效果
                    htmlStr += `<div style="display: flex;align-items: center;"><span style="display:inline-block;width:${opts.fontSize}px;height:${opts.fontSize}px;border-radius:${opts.fontSize * 0.5}px;margin-right:${opts.fontSize * 0.5}px;background-color:${color};"></span>`
                    if (axisInfo.cycleNum > 0 && axisInfo.zSubtitle.length > 0) {
                        htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.zDesc}:${Math.ceil(params.value[2])}<span><br/>`;
                    } else {
                        let dataValue = getFixNumByUnit(params.value[2], axisInfo.zUnit, 1)
                        htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${axisInfo.zDesc}:${dataValue}${axisInfo.zUnit}<span><br/>`;
                    }

                    htmlStr += '</div>';
                    return htmlStr;
                },
            },
            toolbox: {
                right: opts.fontSize,
                feature: {
                    saveAsImage: { show: false },
                    dataView: { show: false },
                    dataZoom: { show: false },
                    magicType: { show: false },
                    brush: { show: false },
                    restore: { show: false }
                },
                iconStyle: {
                    borderColor: opts.color,
                },
            },
            grid3D: {
                top: 'top',
                bottom: 'bottom',
                boxWidth: 100,
                boxHeight: 100,
                boxDepth: 100,
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
                    // color: opts.color,
                    // fontSize: opts.fontSize,
                    margin: opts.fontSize * 0.5,
                    formatter: function (value, index) {
                        if (index === 2) {
                            return '';
                        } else {
                            return value;
                        }
                    },
                },
                splitLine: {
                    lineStyle: {
                        type: 'dotted',
                        color: opts.color,
                        opacity: 0.4,
                        width: opts.lineWidth
                    },
                },
                axisPointer: {
                    show: false,
                },
                viewControl: {
                    zoomSensitivity: 5,
                    distance: 220,
                    minDistance: 180,
                    maxDistance: 220,
                    alpha: 20,
                    minAlpha: 0,
                    maxAlpha: 60,
                    beta: 45,
                    minBeta: 0.1,
                    maxBeta: 90
                }
            },
            xAxis3D: {
                type: 'value',
                name: axisInfo.yDesc + ' [' + axisInfo.yUnit + ']',
                interval: (axisInfo.yRangeMax - axisInfo.yRangeMin) / 4,
                min: axisInfo.yRangeMin,
                max: axisInfo.yRangeMax,
                nameLocation: 'center',
                nameGap: opts.fontSize * 0.5,
                nameTextStyle: {
                    color: "#FF7070",
                    fontSize: opts.fontSize
                },
                axisLabel: {
                    textStyle: {
                        color: "#FF7070",
                        fontSize: opts.fontSize
                    }
                },
            },
            yAxis3D: {
                type: 'value',
                name: axisInfo.xDesc + ' [' + axisInfo.xUnit + ']',
                interval: (axisInfo.xRangeMax - axisInfo.xRangeMin) / 4,
                min: axisInfo.xRangeMin,
                max: axisInfo.xRangeMax,
                nameLocation: 'center',
                nameGap: opts.fontSize * 0.5,
                nameTextStyle: {
                    color: "#5D5DFD",
                    fontSize: opts.fontSize
                },
                axisLabel: {
                    textStyle: {
                        color: "#5D5DFD",
                        fontSize: opts.fontSize
                    }
                },
                splitArea: {
                    show: true,
                    areaStyle: '#DDF4F6'
                },
            },
            zAxis3D: {
                type: 'value',
                name: axisInfo.zDesc + (axisInfo.zUnit.length === 0 ? '' : '\n[' + axisInfo.zUnit + ']'),
                interval: (axisInfo.zRangeMax - axisInfo.zRangeMin) / 4,
                min: Number(axisInfo.cycleNum) === 0 ? axisInfo.zRangeMin : axisInfo.zRangeMin / axisInfo.cycleNum,
                max: Number(axisInfo.cycleNum) === 0 ? axisInfo.zRangeMax : axisInfo.zRangeMax / axisInfo.cycleNum,
                nameLocation: 'center',
                nameGap: opts.fontSize * 0.5,
                nameTextStyle: {
                    color: "#148914",
                    fontSize: opts.fontSize
                },
                axisLabel: {
                    textStyle: {
                        color: "#148914",
                        fontSize: opts.fontSize
                    }
                },
            },
            visualMap: {
                type: 'continuous',
                show: true,
                seriesIndex: 1,
                min: Number(axisInfo.cycleNum) === 0 ? axisInfo.zRangeMin : axisInfo.zRangeMin / axisInfo.cycleNum,
                max: Number(axisInfo.cycleNum) === 0 ? axisInfo.zRangeMax : axisInfo.zRangeMax / axisInfo.cycleNum,
                range: axisInfo.zRange,
                seriesIndex: 1,
                inRange: isEmpty(color)
                    ? {}
                    : {
                        color: color,
                    },
                textStyle: {
                    color: opts.color
                }
            },
            series: this.getSeries(opts, chartBody),
            phaseShift: axisInfo.phaseShift,
            cycleShift: 0,
        };
        return chartOption;
    }

    getSeries(opts, chartBody) {
        let { axisInfo, series } = chartBody;
        let { color, dataList } = series[0]

        //正弦线
        let sinLine = sinSerie(axisInfo.xRangeMax - axisInfo.xRangeMin, axisInfo.xRangeMin, axisInfo.yRangeMax - axisInfo.yRangeMin, axisInfo.yRangeMin, opts.lineWidth, 'xoy');
        if (opts.type === chartType.prps3d) {
            sinLine = sinSerie(axisInfo.xRangeMax - axisInfo.xRangeMin, axisInfo.xRangeMin, axisInfo.zRangeMax - axisInfo.zRangeMin, axisInfo.zRangeMin, opts.lineWidth, 'yoz');
        }
        return [{
            ...sinLine
        }, {
            name: axisInfo.zDesc,
            type: 'bar3D',
            animation: false,
            data: this.getSeriesData(dataList, axisInfo, color),
            shading: 'color',
            symbolOffset: ['50%', '-50%'],
            emphasis: {
                label: {
                    show: false
                }
            }
        }]
    }
    getSeriesData(dataList, axisInfo, color) {
        let data = [];
        dataList.map((item) => {
            let { xRangeMax, xRangeMin, zRangeMin, cycleNum = 0, phaseShift } = axisInfo;
            let value = item.slice(0);
            let xValue = parseFloat(value[0]) - phaseShift;
            let yValue = parseFloat(value[1]);
            let zValue = parseFloat(value[2]) <= zRangeMin ? 0 : parseFloat(value[2]);
            //调整相位偏差
            if (xValue < 0) {
                xValue += xRangeMax - xRangeMin;
            }
            if (cycleNum > 0) {
                zValue = zValue / cycleNum;
            }
            data.push({
                value: [yValue, xValue, zValue],
                itemStyle: isEmpty(color)
                    ? {
                        color: value[3],
                        opacity: zValue === 0 ? 0 : 1,
                    }
                    : {
                        opacity: zValue === 0 ? 0 : 1,
                    }
            });

        });
        return data;
    }
}

export default PRP3D;

