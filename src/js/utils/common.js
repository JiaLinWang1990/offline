import { common, chartType } from '../constants';
/**
 * 在容器内绘制正弦线
 * @param {Number} width 容器宽度
 * @param {Number} wshift 宽度偏移量
 * @param {Number} height 容器高度
 * @param {Number} hshift 高度偏移量
 */
export const sinSerie = (width, wshift, height, hshift, lineWidth, panel) => {
    let data = [];
    for (var i = 0; i <= 360; i++) {
        let x = (width / 360) * i;
        let y = (height / 2) * (Math.sin(i * (2 * Math.PI / 360)) + 1);
        if (panel === 'xoy') {
            data.push([y + hshift, x + wshift, 0]);
        }
        else if (panel === 'yoz') {
            data.push([0, x + wshift, y + hshift]);
        }
        else {
            data.push([x + wshift, y + hshift]);
        }
    }
    return {
        z: 100,
        type: panel === 'xoy' || panel === 'yoz' ? 'line3D' : 'line',
        data: data,
        silent: true,
        showSymbol: false,
        lineStyle: {
            width: lineWidth,
            color: common.sinColor,
            opacity: 0.8
        },
    }
}
/**
 * 获取坐标轴数组
 * @param {Number} range 最大值-最小值
 * @param {Number} pointNum 数据个数/点数
 * @param {Number} precision 精度
 */
export const getAxisData = (range, pointNum, precision = 2) => {
    let rtn = [];
    let interval = range / (pointNum - 1);
    for (let i = 0; i < pointNum; i++) {
        rtn.push((i * interval).toFixed(precision));
    }
    return rtn;
}

/**
 * 获取颜色索引值
 * @param {*} x 
 * @param {*} y 
 * @param {*} x_range 
 * @param {*} y_range 
 * @param {*} point_data 
 */
export const getColorIndex = (x, y, x_range, y_range, point_data) => {
    let chart_width = point_data.length;
    let chart_height = point_data[0].length;
    let iX = parseInt((x / x_range) * chart_width + 0.5);
    let iY = parseInt((y / y_range) * chart_height + 0.5);
    let iSum = 0;
    // 若该点不在图谱区域范围内返回0
    if (iX > chart_width || iY > chart_height) {
        return 0;
    }
    // 防止下标出界
    if (iX == chart_width) {
        iX--;
    }
    // 防止下标出界
    if (iY == chart_height) {
        iY--;
    }
    // 若x坐标大于0，则加上该点后面的颜色大小
    if (iX > 0) {
        iSum += point_data[iX - 1][iY];
    }
    // 若x坐标小于图谱宽度，则加上该点前面的颜色大小
    if (iX < chart_width - 1) {
        iSum += point_data[iX + 1][iY];
    }
    // 若y坐标大于0，则加上该点下面的颜色大小
    if (iY > 0) {
        iSum += point_data[iX][iY - 1];
    }
    // 若y坐标小于高度，则加上该点后面的颜色大小
    if (iY < chart_height - 1) {
        iSum += point_data[iX][iY + 1];
    }
    // 将该点原先的颜色+上下左右颜色的平均值+4的偏移
    let iIndex = point_data[iX][iY] + iSum / 4 + 4;
    if (iIndex > 255) {
        iIndex = 255;
    }
    // 将该点的颜色索引号存入对应的容器中
    point_data[iX][iY] = iIndex;
    return iIndex;
}


/**
 * 分割数组
 * @param {Array} data 原始数组
 * @param {Number} num 单位分割数量
 */
export const splitArr = (data = [], num = 1000) => {
    let rtn = [];
    for (let i = 0, len = data.length; i < len; i += num) {
        rtn.push(data.slice(i, i + num));
    }
    return rtn;
}

/**
 * 按单位区分保留小数
 * @param {String/Number} value 原始数据
 * @param {String} unit 单位
 * @param {Number} toFixedNum 保留小数位（若该单位允许）
 */
export const getFixNumByUnit = (value, unit = 'dB', toFixedNum = 2) => {
    let resultNum = 0;
    switch (unit.toLowerCase()) {
        case 'v':
        case 'mv':
            resultNum = parseFloat(value).toFixed(toFixedNum);
            break;
        default:
            resultNum = parseInt(value);
            break;
    }
    return resultNum;
}


/**
 * 相位偏移
 * @param {Object} option 图谱配置
 * @param {Number} shiftNum 偏移量
 * @param {Number} type 图谱类型
 */
export const pashShift = (option, shiftNum, type) => {
    //prps3d和prpd3d的x,y坐标正好是反着的
    let prp3d = type === chartType.prps3d || type === chartType.prpd3d;
    let xRangeMax = 360;
    if (option.yAxis) {
        xRangeMax = prp3d
            ? option.yAxis[0].max - option.yAxis[0].min
            : option.xAxis[0].max - option.xAxis[0].min;
    }
    if (option.yAxis3D) {
        xRangeMax = prp3d
            ? option.yAxis3D.max - option.yAxis3D.min
            : option.xAxis[0].max - option.xAxis[0].min;
    }

    //取余，避免值过大，进行无意义运算
    shiftNum = shiftNum % xRangeMax;
    //取负值解决滑动条与信号调整方向一致
    let phaseShift = -shiftNum - option.phaseShift;
    if (phaseShift < 0) {
        phaseShift = xRangeMax + phaseShift;
    }

    //相位偏移
    let series = option.series;
    for (let i = 1, slen = series.length; i < slen; i++) {
        let data = series[i].data;
        for (let j = 0, dlen = data.length; j < dlen; j++) {
            let value = data[j].value;
            if (prp3d) {
                value[1] = value[1] - phaseShift;
                if (value[1] < 0) {
                    value[1] = xRangeMax + value[1];
                }
            } else {
                value[0] = value[0] - phaseShift;
                if (value[0] < 0) {
                    value[0] = xRangeMax + value[0];
                }
            }
        }
    }
    option.phaseShift = -shiftNum;
    return option;
};


/**
 * 周期偏移
 * @param {Object} option 图谱配置
 * @param {Number} shiftNum 偏移量
 * @param {Number} type 图谱类型
 */
export const cycleShift = (option, shiftNum, type) => {
    //prps3d和prpd3d的x,y坐标正好是反着的
    let prp3d = type === chartType.prps3d || type === chartType.prpd3d;

    let yRangeMax = prp3d
        ? option.xAxis3D.max - option.xAxis3D.min
        : option.yAxis[0].max - option.yAxis[0].min;
    shiftNum = -shiftNum;
    //取余，避免值过大，进行无意义运算
    shiftNum = shiftNum % yRangeMax;
    let cycleShift = shiftNum - option.cycleShift;
    if (cycleShift < 0) {
        cycleShift = yRangeMax + cycleShift;
    }

    //周期偏移
    let series = option.series;
    for (let i = 1, slen = series.length; i < slen; i++) {
        let data = series[i].data;
        for (let j = 0, dlen = data.length; j < dlen; j++) {
            let value = data[j].value;
            if (prp3d) {
                value[0] = value[0] - cycleShift;
                if (value[0] < 0) {
                    value[0] = yRangeMax + value[0];
                }
            } else {
                value[1] = value[1] - cycleShift;
                if (value[1] < 0) {
                    value[1] = yRangeMax + value[1];
                }
            }
        }
    }
    option.cycleShift = shiftNum;
    return option;
};

/**
 * 阈值过滤
 * @param {Object} option 图谱配置
 * @param {Number} shiftNum 偏移量
 * @param {Number} type 图谱类型
 */
export const thresholdFilter = (option, thresholdArr, type) => {
    let series = option.series;
    for (let i = 1, slen = series.length; i < slen; i++) {
        let data = series[i].data;
        for (let j = 0, dlen = data.length; j < dlen; j++) {
            let {value,itemStyle} = data[j];
           if(value[1]<thresholdArr[0]||value[1]>thresholdArr[1]){
            itemStyle.opacity=0;
           }else{
            itemStyle.opacity=1;
           }
        }
    }
    return option;
};

/**
 * 红外图谱标注功能
 * @param {Document} chart 图谱对象
 * @param {Object} opts 图谱配置
 * @param {Number} ratioX x缩放量
 * @param {Number} ratioY y缩放量
 */
export const infraredShapeBrush = (chart, opts, ratioX, ratioY) => {
    let setOption = (series, data, opts) => {
        series.push({
            type: "scatter",
            zlevel: 1,
            data: data,
            symbolSize: opts.fontSize * 1.5,
            itemStyle: {
                opacity: 0.5
            },
            silent: false
        })
        chart.setOption({
            series: series
        }, false, false);
    }

    //brush选择后的事件处理
    chart.on("brushSelected", params => {
        opts.shapes = [];
        let { areas } = params.batch[0];
        let { series } = chart.getOption();
        series = series.filter(item => item.type !== 'scatter');
        let data = areas.map((item, index) => {
            if (item.panelId.toString().indexOf("grid--") > -1) {
                item.panelId = index + 1;
            }
            let x = 0;
            let y = 0;

            if (item.brushType === "polygon") {
                item.range.map(item => {
                    x += item[0];
                    y += item[1];
                });
                x = x / item.range.length;
                y = y / item.range.length;
            } else if (item.brushType === "rect") {
                x = (item.range[0][1] + item.range[0][0]) / 2;
                y = (item.range[1][1] + item.range[1][0]) / 2;
            }

            opts.shapes.push({
                "label": item.panelId,
                "shape_type": item.brushType,
                "points": item.range
            })

            return {
                value: [x / ratioX, y / ratioY, item.panelId],
                label: {
                    show: true,
                    formatter: '{@[2]}',
                    fontSize: opts.fontSize
                }
            }
        });
        setOption(series, data, opts);

        if (opts.shapeSelected) {
            opts.shapeSelected(opts.shapes.map(item => {
                let { points, ...params } = item;
                return {
                    points: item.points.map(child => {
                        return [child[0] / ratioX, child[1] / ratioY]
                    }),
                    ...params
                }
            }));
        }
    });

    chart.on('click', (param) => {
        let { componentSubType } = param;
        if (componentSubType === 'scatter') {
            let { series } = chart.getOption();
            let scatterSerie = series.find(item => item.type === 'scatter');
            let data = scatterSerie.data.filter(item => item.value[2] !== param.data.value[2]);
            series = series.filter(item => item.type !== 'scatter');
            setOption(series, data, opts);

            //标注块
            let shapes = opts.shapes.filter(item => item.label !== param.data.value[2]);
            chart.dispatchAction({
                type: "brush",
                areas: shapes.map((item, index) => {
                    return {
                        brushType: item["shape_type"],
                        range: item.points,
                        panelId: index + 1
                    };
                })
            });
        }
    })
}
