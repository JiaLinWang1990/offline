import Chart from "./chart";
import { merge, isEmpty, debounce, base64ToArrayBuffer,pathToSvg } from "../utils";
import { common } from "../constants";
/**
 * 音频图谱
 * 暂未实现选择时间播放
 */
class Audio extends Chart {
    constructor(...args) {
        super(...args);
        this.showCount = 480;//显示的数据个数
        this.playing = false;//是否播放
        this.lastPlayTime = 0;//上一次播放结束的时间
        this.prevPlayTime = 0;//上一帧播放的时间
        this.selectTime = 0;//本次已播放的时间
        this.initAudio();
        this.pauseIcon='';
    }
	/**
	 * 绘制音频图谱
	 * @param {*音频数据} data
	 */
    option = async () => {
        let opts = this.opts;
        let chartBody = this.chartBody;
        let { title, series } = chartBody;

        let pauseIcon = pathToSvg(common.pauseIcon, opts.color);
        let playIcon = pathToSvg(common.playIcon, opts.color);
        this.pauseIcon=pauseIcon;

        //获取音频文件字节流
        await this.getBuffer(series[0].audio);

        let chartOption = {
            title: {
                text: title
            },
            tooltip: {
                trigger: 'axis',
                triggerOn: 'none',
                // triggerOn: 'click',
                alwaysShowContent: true,
                axisPointer: {
                    type: 'line',
                },
                position: function (pos, params, dom, rect, size) {
                    // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
                    var obj = { top: 60 };
                    obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                    return obj;
                },
                formatter: (params) => {
                    let { componentType, value } = params[0]
                    let playedTime = 0;
                    if (this.sourceNode && this.sourceNode.buffer) {
                        let { length, duration, sampleRate } = this.sourceNode.buffer;
                        playedTime = (value[0] / length) * duration;
                        //改变播放颜色
                        this.chart.dispatchAction({
                            type: 'selectDataRange',
                            visualMapIndex: 0,
                            selected: [playedTime * sampleRate, length],
                        });
                        // //出现跳帧情况,就是用户点击选择的时间，有问题，会导致快速播放
                        // if (Math.abs(playedTime - this.prevPlayTime) >= (duration / this.showCount) * 5) {
                        //     this.selectTime = playedTime;
                        // }
                        this.prevPlayTime = playedTime;
                    }
                    if (componentType === 'series') {
                        let htmlStr = `<div style="padding:${opts.fontSize * 0.5}px">`;
                        htmlStr += `<span style="font-size:${opts.fontSize * 1.1}px">${playedTime.toFixed(2)}s<span>`;
                        htmlStr += '</div>';
                        return htmlStr;
                    }
                }
            },
            graphic: [{
                type: 'image',
                right: opts.fontSize * 1.5,
                top: opts.fontSize * 0.25,
                style: {
                    image: playIcon,
                    width: opts.fontSize * 1.5,
                    height: opts.fontSize * 1.5,
                },
                onclick: (function (e) {
                    let imageIcon = ''
                    if (this.playing) {
                        imageIcon = playIcon;
                        this.pause();
                    } else {
                        imageIcon = pauseIcon;
                        this.play();
                    }
                    e.target.setStyle({
                        image: imageIcon,
                    })
                }).bind(this)
            }],
            xAxis: [{show: false}],
            yAxis: [{show: false}],
            series: this.getSeries(opts, chartBody),
            dataZoom: [{
                disabled: true
            }],
            visualMap: {
                show: false,
                hoverLink: false,
                seriesIndex: 0,
                dimension: 0,
                min: 0,
                max: this.sourceNode.buffer.length,
                inRange: {
                    color: chartBody.axisInfo.color
                },
                outOfRange: {
                    color: chartBody.axisInfo.playColor
                }
            }
        };
        return merge(chartOption, this.baseOption());
    }

    getSeries = (opts, chartBody) => {
        let audioData = new Float32Array(this.sourceNode.buffer.getChannelData(0));
        let { length, sampleRate } = this.sourceNode.buffer;
        let span = parseInt(length / this.showCount);
        if (span < 1) {
            span = 1;
        }

        let data = [];
        audioData.forEach((item, index) => {
            if (index % span === 0) {
                data.push([index, item]);
            }
        })

        return {
            type: 'bar',
            barCategoryGap: '0%',
            data: data,
        };
    }

    getBuffer = (audio) => {
        let { path, data } = audio;
        if (isEmpty(path) === false) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', path, true);
            xhr.responseType = 'arraybuffer';
            xhr.send();
            return new Promise((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            this.context.decodeAudioData(xhr.response, buffer => {
                                this.sourceNode.buffer = buffer;
                                resolve();
                            });
                        } else {
                            console.error(xhr.statusText);
                        }
                    }
                };
            });
        } else {
            return new Promise((resolve, reject) => {
                let content = data.replace('data:audio/wav;base64,', '');
                this.context.decodeAudioData(base64ToArrayBuffer(content), buffer => {
                    this.sourceNode.buffer = buffer;
                    resolve();
                });
            });
        }
    }


    initAudio = () => {
        let AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        if (!AudioContext) {
            console.warn('Your browser does not support Web Audio API');
        } else {
            this.context = new AudioContext();
            this.context.suspend();
            this.sourceNode = this.context.createBufferSource();
            this.sourceNode.connect(this.context.destination);
            this.sourceNode.loop = true;
            // this.sourceNode.ended = () => { 
            //     this.sourceNode.stop(0)
            // }
        }

    }

    play = () => {
        this.playing = true;
        if (this.sourceNode && this.sourceNode.buffer) {
            if (this.context.state == 'suspended') {
                this.sourceNode.loopStart = this.selectTime;
                this.sourceNode.loopEnd = this.sourceNode.buffer.duration;
                this.context.resume();
            }
            if (this.context.currentTime === 0) {
                this.sourceNode.start(0, this.selectTime);
            }
            this.drawAnimation(this.chart);
        } else {
            console.warn('Audio is not ready');
        }
    }

    pause = () => {
        this.playing = false;
        this.chart.setOption({
            graphic: [{
                style: {
                    image: this.pauseIcon
                },
            }],
        });
        this.context.suspend();
    }

    drawAnimation = (chart) => {
        let { length, duration, sampleRate } = this.sourceNode.buffer;
        let currentTime = this.context.currentTime;
        let playedTime = currentTime - this.lastPlayTime + this.selectTime;
        let span = parseInt(length / this.showCount);
        let dataIndex = parseInt((playedTime * sampleRate) / span);

        if(chart.isDisposed()){
            this.sourceNode.disconnect(this.context.destination);
            this.playing=false;
        }
        
        //进度线条
        chart.dispatchAction({
            type: 'showTip',
            seriesIndex: 0,
            dataIndex: dataIndex,
        })

        if (this.playing) {
            if (playedTime >= duration) {
                this.pause();
                //循环播放，记录本次播放的时间
                this.lastPlayTime = currentTime;
                //重置
                this.selectTime = 0;
            } else {
                cancelAnimationFrame(this.AnimationDraw);
                this.AnimationDraw = null;
            }
            this.AnimationDraw = requestAnimationFrame(debounce(this.drawAnimation.bind(this, chart), 50, true));
        } else {
            cancelAnimationFrame(this.AnimationDraw);
            this.AnimationDraw = null;
        }
    }
}

export default Audio;
