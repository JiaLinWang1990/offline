import Chart from "./chart";
import { merge } from "../utils";

/**
 * AE时域波形图谱类
 */
class Wave extends Chart {
  constructor(...args) {
    super(...args);
  }

  /**
   * 生成AE时域波形图谱配置项
   * @return {*自定义配置} option
   */
  option() {
    let opts = this.opts;
    let chartBody = this.chartBody;
    let { title, axisInfo, trigger } = chartBody;

    let chartOption = {
      title: {
        text: title
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line"
        },
        formatter: function(param) {
          let htmlStr = `<div style="padding:${opts.fontSize * 0.5}px">`;
          param.map(series => {
            let color = series.color; //图例颜色
            htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${
              axisInfo.xDesc
            }:${series.value[0]}<span><br/>`;
            //为了保证和原来的效果一样，这里自己实现了一个点的效果
            htmlStr += `<div style="display: flex;align-items: center;"><span style="display:inline-block;width:${
              opts.fontSize
            }px;height:${opts.fontSize}px;border-radius:${opts.fontSize *
              0.5}px;margin-right:${opts.fontSize *
              0.5}px;background-color:${color};"></span>`;
            //这里你可以格式你的数字或者自定义文本内容
            htmlStr += `${axisInfo.yDesc}: ${series.value[1]} ${axisInfo.yUnit}<br/></div>`;
          });
          htmlStr += "</div>";
          return htmlStr;
        }
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: "none"
          },
          restore: {},
          saveAsImage: {}
        }
      },
      xAxis: [
        {
          type: "value",
          name: axisInfo.xDesc + " [" + axisInfo.xUnit + "]",
          interval: (axisInfo.xRangeMax - axisInfo.xRangeMin) / 4,
          min: axisInfo.xRangeMin,
          max: axisInfo.xRangeMax
        }
      ],
      yAxis: [
        {
          type: "value",
          name: axisInfo.yDesc + " [" + axisInfo.yUnit + "]",
          min: axisInfo.yRangeMin,
          max: axisInfo.yRangeMax
        }
      ],
      series:this.getSeries(opts, chartBody)
    };
    return merge(chartOption, this.baseOption());
  }

  getSeries(opts, chartBody) {
    let { axisInfo,trigger, series } = chartBody;
    let { dataList, color } = series[0];
    let xRange = axisInfo.xRangeMax - axisInfo.xRangeMin;

    let data = [];
    if (typeof dataList[0] === "number") {
      let interval = xRange / (dataList.length - 1);
      data = dataList.map((item, index) => [(index * interval).toFixed(2), item]);
    } else {
      data = dataList;
    }

    return {
      type: "line",
      showSymbol: false,
      smooth: true,
      data: data,
      lineStyle: {
        normal: {
          color: color,
          width: 1
        }
      },
      markLine: {
        silent: true,
        symbolSize: 0,
        lineStyle: {
          normal: {
            width: 1,
            type: "dashed",
            color: trigger.color
          }
        },
        data: [
          {
            name: trigger.desc,
            yAxis: trigger.value
          }
        ]
      }
    };
  }
}

export default Wave;
