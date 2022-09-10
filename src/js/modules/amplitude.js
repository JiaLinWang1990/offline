import Chart from './chart';
import {
    stripNum,
    merge
} from '../utils';

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
            let frequecy = '';
            //与手持保持一致，频率成分单位与名称以空格分割，以中括号[]包围
            if (index === 2) {
                frequecy = ` [${axisInfo.frequecy}Hz]`;
            }
            if (index === 3) {
                frequecy = ` [${axisInfo.frequecy * 2}Hz]`;
            }

            grid.push({
                top: (20 * index + 10) + '%',
                left: opts.fontSize * 1.5,
                right: opts.fontSize * 3,
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
                name: item.name + frequecy + ' [' + axisInfo.unit + ']',
                splitLine: {
                    show: false
                },
                axisLabel: {
                    color: opts.color,
                    fontSize: opts.fontSize,
                    formatter: function (value, index) {
                        let rtn = '';
                        if (index === 0) {
                            rtn = min;
                        }
                        if (index === 10) {
                            rtn = max;
                        }
                        return rtn;
                    }
                },
                nameGap: opts.fontSize * 0.8,
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
            };
            xAxis.push(xAxisOpt);

            //Y轴
            yAxis.push({
                type: 'category',
                gridIndex: index,
                data: [item.name],
                axisLine: {
                    lineStyle: {
                        color: opts.color,
                        width: opts.lineWidth
                    },
                },
                axisLabel: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
            });

            //解决背景值为0覆盖有效值的情况
            let bgvalue = item.dataList[0];
            bgvalue = bgvalue > max ? max : bgvalue;
            bgvalue = bgvalue < min ? min : bgvalue;
            if (bgvalue != 0) {
                bgvalue = bgvalue - min;
            }

            let value = item.dataList[1];
            value = value > max ? max : value;
            value = value < min ? min : value;
            value = value - min;

            series.push({
                name: axisInfo.bgValDesc,
                type: 'bar',
                xAxisIndex: index,
                yAxisIndex: index,
                barWidth: opts.fontSize,
                z: 10,
                itemStyle: {
                    color: axisInfo.bgColor
                },
                label: {
                    show: true,
                    position: 'right',
                    color: opts.color,
                    fontSize: opts.fontSize,
                    formatter: function (data) {
                        if (bgvalue > value) {
                            return stripNum(Number(data.value) + min);
                        } else {
                            return '';
                        }
                    }
                },
                data: [bgvalue]
            });
            series.push({
                name: axisInfo.valDesc,
                type: 'bar',
                barGap: '-100%',
                xAxisIndex: index,
                yAxisIndex: index,
                barWidth: opts.fontSize,
                // z: value < bgvalue ? 2 : 1,
                itemStyle: {
                    color: axisInfo.valColor
                },
                label: {
                    show: true,
                    position: 'right',
                    color: opts.color,
                    fontSize: opts.fontSize,
                    formatter: function (data) {
                        if (bgvalue <= value) {
                            return stripNum(Number(data.value) + min);
                        } else {
                            return '';
                        }
                    }
                },
                data: [value]
            });
        });
        let chartOption = {
            title: merge({
                text: title,
            }, opts.title),
            legend: merge({
                data: [axisInfo.bgValDesc, axisInfo.valDesc],
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
                        //为了保证和原来的效果一样，这里自己实现了一个点的效果
                        htmlStr += `<div style="display: flex;align-items: center;"><span style="display:inline-block;width:${opts.fontSize}px;height:${opts.fontSize}px;border-radius:${opts.fontSize * 0.5}px;margin-right:${opts.fontSize * 0.5}px;background-color:${color};"></span>`
                        //这里你可以格式你的数字或者自定义文本内容
                        htmlStr += `${series.seriesName}: ${stripNum(Number(data[series.seriesIndex % 2]))} ${axisInfo.unit}<br/></div>`;
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