import Chart from './chart';
import {
    stripNum,
    merge
} from '../utils';
import Color from '../utils/color';

/**
 * AE幅值图谱类
 */
class Amplitude extends Chart {
    constructor(...args) {
        super(...args);
    }
    /**
     * 生成AE幅值图谱配置项
     * @return {*自定义配置} option
     */
    option() {
        let opts = this.opts;
        let {
            title,
            axisInfo,
            series: dataList
        } = this.chartBody;
        let {
            xAxis: xAxisOpt
        } = this.baseOption();

        let grid = [];
        let xAxis = [];
        let yAxis = [];
        let series = [];
        dataList.map((item, index) => {
            let min = Number(item.min);
            let max = Number(item.max);
            let interval = (max - min) / 10;

            grid.push({
                top: (22 * index + 20) + '%',
                left: opts.fontSize * 2,
                right: opts.fontSize * 2,
                height: '10%'
            });
            //X轴
            xAxisOpt = {
                type: 'value',
                gridIndex: index,
                min: 0,
                max: max - min,
                interval: interval,
                nameLocation: 'center',
                name: item.name,
                splitLine: {
                    show: false
                },
                position: "top",
                showMaxLabel: true,
                showMinLabel: true,
                axisLabel: {
                    margin: 0,
                    color: opts.color,
                    fontSize: opts.fontSize,
                    formatter: function (value, index) {
                        let rtn = '';
                        if (index === 1) {
                            rtn = min + axisInfo.unit;
                        }
                        if (index === 9) {
                            rtn = max + axisInfo.unit;
                        }
                        return rtn;
                    }
                },
                nameGap: opts.fontSize * 0.8,
                nameTextStyle: {
                    color: opts.color,
                    fontSize: opts.fontSize
                },
                axisLine: {
                    show: false,
                    lineStyle: {
                        color: opts.color,
                        width: opts.lineWidth
                    },
                },
                axisTick: {
                    show: false,
                    lineStyle: {
                        color: opts.color,
                        width: opts.lineWidth
                    },
                },
            };
            xAxis.push(xAxisOpt);

            //Y轴
            yAxis.push({
                type: 'category',
                gridIndex: index,
                data: [item.name],
                axisLine: {
                    show: false,
                },
                axisLabel: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
            });



            let { name, value, color } = item.dataList[0];
            value = value > max ? max : value;
            value = value < min ? min : value;
            value = value - min;

            if (color === "jet") {
                let colorList = Color.getColorList(color);
                let colorIndex = Math.floor((value / (max - min)) * colorList.length);
                color = colorList[colorIndex];
            }

            series.push({
                name: name,
                type: 'bar',
                barGap: '-100%',
                xAxisIndex: index,
                yAxisIndex: index,
                barWidth: opts.fontSize * 1.8,
                // z: value < bgvalue ? 2 : 1,
                itemStyle: {
                    color: color,
                    barBorderRadius: 5,
                },
                label: {
                    show: true,
                    position: 'right',
                    color: opts.color,
                    fontSize: opts.fontSize,
                    formatter: function (data) {
                        let bgVal = item.dataList[1] ? item.dataList[1].value : min;
                        if (bgVal <= value) {
                            return stripNum(Number(data.value) + min) + axisInfo.unit;
                        } else {
                            return '';
                        }
                    }
                },
                data: [value],
                showBackground: true,
                backgroundStyle: {
                    color: '#FFFFFF'
                }
            });
            if (item.dataList[1]) {
                //解决背景值为0覆盖有效值的情况
                let { name: bgName, value: bgvalue, color: bgColor } = item.dataList[1];
                bgvalue = bgvalue > max ? max : bgvalue;
                bgvalue = bgvalue < min ? min : bgvalue;
                if (bgvalue != 0) {
                    bgvalue = bgvalue - min;
                }

                series.push({
                    name: bgName,
                    type: 'bar',
                    barGap: '-100%',
                    xAxisIndex: index,
                    yAxisIndex: index,
                    barWidth: opts.fontSize * 1.8,
                    z: 10,
                    itemStyle: {
                        color: bgColor,
                        barBorderRadius: [4, 0, 0, 4],
                    },
                    label: {
                        position: 'right',
                        color: opts.color,
                        fontSize: opts.fontSize,
                        formatter: function (data) {
                            if (bgvalue > value) {
                                return stripNum(Number(data.value) + min) + axisInfo.unit;;
                            } else {
                                return '';
                            }
                        }
                    },
                    data: [bgvalue]
                });
            }
            series.push({
                name: "bg",
                type: 'bar',
                xAxisIndex: index,
                yAxisIndex: index,
                barWidth: opts.fontSize * 1.8,
                z: 10,
                itemStyle: {
                    color: "transparent",
                    barBorderRadius: 5,
                    borderColor: "#177DDC",
                    borderWidth: 1
                },
                data: [max - min]
            });

        });
        let chartOption = {
            title: merge({
                text: title,
            }, opts.title),
            legend: merge({
                show: false,
            }, opts.legend),
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function (param) {
                    let htmlStr = `<div style="padding:${opts.fontSize * 0.5}px"><span style="font-size:${opts.fontSize * 1.1}px">${param[0].name}<span><br/>`;
                    param.map((series, index) => {
                        let color = series.color; //图例颜色
                        let min = dataList[series.axisIndex].min;
                        let data = dataList[series.axisIndex].dataList;
                        if (series.seriesName != 'bg') {
                            //为了保证和原来的效果一样，这里自己实现了一个点的效果
                            htmlStr += `<div style="display: flex;align-items: center;"><span style="display:inline-block;width:${opts.fontSize}px;height:${opts.fontSize}px;border-radius:${opts.fontSize * 0.5}px;margin-right:${opts.fontSize * 0.5}px;background-color:${color};"></span>`
                            //这里你可以格式你的数字或者自定义文本内容
                            htmlStr += `${series.seriesName}: ${stripNum(Number(data[index].value))} ${axisInfo.unit}<br/></div>`;
                        }
                    });
                    htmlStr += '</div>';
                    return htmlStr;
                }
            },
            grid: grid,
            xAxis: xAxis,
            yAxis: yAxis,
            series: series
        };
        return merge(chartOption, this.baseOption());
    }
}

export default Amplitude;