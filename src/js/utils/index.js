/**
 * 判断入参是否为对象
 * @param {Object} obj 需校验的参数
 */
const isObject = (obj) => {
    // Avoid a V8 JIT bug in Chrome 19-20.
    // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
    var type = typeof obj;
    return type === 'function' || !!obj && type == 'object';
}

/**
 * 节流函数
 * 短时间内触发多次绑定事件造成性能问题，如 onresize,onscroll等，使用节流函数可确保在指定时间内只触发一次
 * @param {Function} func 方法体
 * @param {Number} wait 延迟时长,ms
 * @param {Boolean} immediate 是否立即执行 
 */
export const throttle = (fn, wait = 100, immediate = false) => {
    let timer, timeStamp = 0;
    let context, args;

    let run = () => {
        timer = setTimeout(() => {
            if (!immediate) {
                fn.apply(context, args);
            }
            clearTimeout(timer);
            timer = null;
        }, wait);
    }

    return function () {
        context = this;
        args = arguments;
        if (!timer) {
            // console.log("throttle, set");
            if (immediate) {
                fn.apply(context, args);
            }
            run();
        } else {
            // console.log("throttle, ignore");
        }
    }

}

/**
 * 防抖函数
 * 强制一个函数在某个连续时间段内只执行一次，哪怕它本来会被调用多次。
 * @param {Function} func 方法体
 * @param {Number} wait 延迟时长,ms
 * @param {Boolean} immediate 是否立即执行 
 */
export const debounce = (fn, wait = 100, immediate = false) => {
    let timer, startTimeStamp = 0;
    let context, args;

    let run = (timerInterval) => {
        timer = setTimeout(() => {
            let now = (new Date()).getTime();
            let interval = now - startTimeStamp
            if (interval < timerInterval) { // the timer start time has been reset，so the interval is less than timerInterval
                // console.log('debounce reset', timerInterval - interval);
                startTimeStamp = now;
                run(timerInterval - interval);  // reset timer for left time 
            } else {
                if (!immediate) {
                    fn.apply(context, args);
                }
                clearTimeout(timer);
                timer = null;
            }

        }, timerInterval);
    }

    return function () {
        context = this;
        args = arguments;
        let now = (new Date()).getTime();
        startTimeStamp = now; // set timer start time

        if (!timer) {
            console.log('debounce set', wait);
            if (immediate) {
                fn.apply(context, args);
            }
            run(wait);    // last timer alreay executed, set a new timer
        }

    }
}


/**
 * 多维数组初始化
 * initDimArr( 3, true )  => [true,true,true]
 * initDimArr( 3,3,"x" )  => [['x','x','x'],['x','x','x'],['x','x','x']]
 */
export function initDimArr() {
    var len = arguments.length;
    var args = Array.prototype.slice.call(arguments, 0, len - 1);
    var content = arguments[len - 1];
    var result = [];
    var traverse = function foo(from, deep) {
        var arg = args[deep];
        if (deep < args.length - 1) {
            for (var i = 0; i < arg; i++) {
                var array = [];
                from.push(array);
                foo(array, deep + 1);
            }
        }
        else {
            for (var i = 0; i < arg; i++) {
                if (typeof content === "function") {
                    from.push(content());
                }
                else {
                    from.push(content);
                }
            }
        }
    };
    traverse(result, 0);
    return result;
}

/**
 * 处理浮点数字小数点问题
 * @param {Number} num 待处理浮点数字
 * @param {Number} precision 保留数字个数
 */
export const stripNum = (num = 0, precision = 12) => {
    return parseFloat(num.toPrecision(precision));
}


/**
 * 判断参数是否为空
 * @param {Object} obj 需校验的参数
 */
export const isEmpty = (obj) => {
    if (obj === null || obj === undefined) {
        return true;
    } else if (typeof (obj) === 'number') {
        return false;
    } else {
        if (obj === '') {
            return true;
        }

        let arr = Array.isArray(obj);
        if (arr && arr.length === 0) {
            return true;
        }

        let keys = Object.keys(obj);
        if (keys && keys.length === 0) {
            return true;
        }
    }
    return false;
};

/**
 * 对象深拷贝
 * @param {Object} obj
 */
export const deepClone = (obj) => {
    if (!isObject(obj) || !isObject(obj)) {
        return obj;
    }
    // 判断复制的目标是数组还是对象
    const targetObj = obj.constructor === Array ? [] : {};
    for (let keys in obj) { // 遍历目标
        if (obj.hasOwnProperty(keys)) {
            if (obj[keys] && typeof obj[keys] === 'object') {
                // 如果值是对象，就递归一下
                targetObj[keys] = obj[keys].constructor === Array ? [] : {};
                targetObj[keys] = deepClone(obj[keys]);
            } else {
                // 如果不是，就直接赋值
                targetObj[keys] = obj[keys];
            }
        }
    }
    return targetObj;
};

/**
 * 
 * @param {Object} target 目标对象
 * @param {Object} source 源对象
 * @param {Boolean} overwrite 是否覆盖
 */
export const merge = (target, source, overwrite = false) => {
    if (!isObject(source) || !isObject(target)) {
        return overwrite ? deepClone(source) : target;
    }
    for (let key in source) {
        if (source.hasOwnProperty(key)) {
            let targetProp = target[key];
            let sourceProp = source[key];

            if (isObject(sourceProp) && isObject(targetProp)) {
                // 如果需要递归覆盖，就递归调用merge
                merge(targetProp, sourceProp, overwrite);
            } else if (overwrite || !(key in target)) {
                // 否则只处理overwrite为true，或者在目标对象中没有此属性的情况
                // NOTE，在 target[key] 不存在的时候也是直接覆盖
                target[key] = deepClone(source[key]);
            }
        }
    }
    return target;
}

/**
 * 获取当前@media基准html的实际px，即当前1rem的值
 * @return float px 值
 */
export const getBaseRem = () => {
    let rem = 16;
    let html = document.getElementsByTagName('html')[0];
    let style = window.getComputedStyle(html)
    if (html && style) {
        rem = parseFloat(style.fontSize.replace('px', ''));
    }
    return rem;
};

/**
 * 获取字符串编码数
 * @param {String} text 字符串
 */
export const getStringCode = (text = '') => {
    let code = 0;
    text = text.toString();
    for (let i = 0; i < text.length; i++) {
        code = code + text.codePointAt(i);
    }
    return code;
}


export const base64ToArrayBuffer = (base64) => {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

export const pathToSvg = (path, color) => {
    let svgStr = `data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Ctitle%3E%3C/title%3E%3Cpath d='${path}' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E`;
    return 'data:image/svg+xml;' + svgStr;
}
