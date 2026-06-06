// utils & constants
function debounce(func, delay) {
    let timer;
    return function(...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            func.call(this, ...args)
        }, delay);
    }
}

function memoiseIt(func) {
    const cache = {};

    return function(...args) {
        const key = JSON.stringify(args);

        if (!cache.hasOwnProperty(key)) cache[key] = func.call(this, ...args);

        return cache[key];
    }
}

function isNumber(str) {
    return isFinite(Number(str)) && str.trim() !== "";
}

function getRandomNo(start, end) {
    return Math.floor(Math.random() * (end - start + 1) + start);
}

// event handlers
