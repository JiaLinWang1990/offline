import Chart from "./chart";
import { merge, isEmpty } from "../utils";
import { common } from "../constants";
/**
 * 机械特性相关图谱类
 */
class Pulse extends Chart {
  constructor(...args) {
    super(...args);
  }
  /**
   * 生成机械特性相关图谱配置项
   * @param {*自定义配置} data
   */
  option() {
    let opts = this.opts;
    let chartBody = this.chartBody;
    let { title, axisInfo, series } = chartBody;
    let log = 0;
    if (axisInfo.yRangeMax) {
      // log = Math.ceil(Math.log10(axisInfo.yRangeMax));
    }

    let chartOption = {
      title: {
        text: title
	  },
	  color:['#c23531','#1BA261', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
      legend: {
        data: series.map((item, index) => {
          return isEmpty(item["name"]) ? (index + 1).toString() : item["name"];
        })
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line"
        },
        formatter: function(param) {
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
      brush: {
        xAxisIndex: "all",
        brushLink: "all",
        brushStyle: {
          borderWidth: 1,
          color: "rgba(128, 128, 128, 0.2)",
          borderColor: common.infraredColor
        },
        throttleType: "debounce"
      },
      toolbox: {
        right: 0,
        showTitle: false,
        feature: {
          brush: {
            show: true,
            type: ["lineX", "clear"]
          },
          saveAsImage: {
            show: false
          }
        },
        // x: 'center',
        xAxisIndex: 0,
        top: opts.fontSize * 3.5,
        itemGap: opts.fontSize * 1.5,
        iconStyle: {
          borderColor: opts.color
        },
        orient: "vertical"
      },
      xAxis: [
        {
          type: "value",
          boundaryGap: false,
          name: axisInfo.xDesc + " [" + axisInfo.xUnit + "]",
          min: axisInfo.xRangeMin,
          max: axisInfo.xRangeMax
        }
      ],
      yAxis: [
        axisInfo.valDesc
          ? {
              type: "value",
              name: axisInfo.yDesc,
              axisTick: {
                show: false
              },
              axisLabel: {
                show: false
              },
              max: series.length * 2
            }
          : {
              type: "value",
              name: axisInfo.yDesc + " [" + axisInfo.yUnit + "]",
              name: (function() {
                let name = axisInfo.yDesc + " [" + axisInfo.yUnit + "]";
                if (log > 3) {
                  name =
                    axisInfo.yDesc +
                    " [x" +
                    Math.pow(10, log - 3) +
                    axisInfo.yUnit +
                    "]";
                }
                return name;
              })(),
              axisLabel: {
                formatter: function(value, index) {
                  if (log > 3) {
                    value = value / Math.pow(10, log - 3);
                  }
                  return value;
                }
              }
            }
      ],
      series: this.getSeries(opts, chartBody)
    };
    this.chart.on("brushSelected", params => {
      opts.shapes = [];
      let { areas } = params.batch[0];
      let { series } = this.chart.getOption();
      let text = "";
      if (areas[0]) {
        let [begin, end] = areas[0].coordRange;
        text = [
          `T1：${begin.toFixed(2)}`,
          `T2：${end.toFixed(2)}`,
          `T  ：${(end - begin).toFixed(2)}`,
          ""
        ].join(` ${axisInfo.xUnit}\n`);
      }

      this.chart.setOption({
        graphic: [
          {
            type: "text",
            z: 100,
            right: opts.fontSize * 3.5,
            top: opts.fontSize * 4.5,
            style: {
              fill: opts.color,
              text: text
            }
          }
        ]
      });
    });

    return merge(chartOption, this.baseOption());
  }

  getSeries(opts, chartBody) {
    let seriesOption = [];
    let { axisInfo, series } = chartBody;
    let xRange =
      parseFloat(axisInfo.xRangeMax) - parseFloat(axisInfo.xRangeMin);
    series.map(function(item, index) {
      let data = [];
      if (typeof item.dataList[0] === "number") {
        let interval = xRange / (item.dataList.length - 1);
        item.dataList.map(function(d, i) {
          data.push([(i * interval).toFixed(2), d]);
        });
      } else {
        data = item.dataList;
      }
      let styleOption = {};
      if (isEmpty(item.color)) {
        styleOption = {
          lineStyle: {
            width: opts.lineWidth * 2
          }
        };
      } else {
        styleOption = {
          itemStyle: {
            color: item.color
          },
          lineStyle: {
            color: item.color,
            width: opts.lineWidth * 2
          }
        };
      }

      seriesOption.push({
        type: "line",
        name: isEmpty(item.name) ? (index + 1).toString() : item.name,
        data: data,
        showSymbol: false,
        smooth: true,
        large: true,
        ...styleOption
      });
    });
    return seriesOption;
  }
}
export default Pulse;
