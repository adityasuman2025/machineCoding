function memoizeIt(func) {
    const memo = {};

    return function(...args) {
        const key = JSON.stringify(args);

        if (!memo.hasOwnProperty(key)) memo[key] = func.call(this, ...args);

        return memo[key];
    }
}

function debounce(func, delay) {
    let timer;

    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.call(this, ...args)
        }, delay);
    }
}

function apiCall(apiUrl, method = "get", body) {
    return new Promise(async function(resolve, reject) {
        try {
            const resp = await fetch(apiUrl, {
                method,
                ...(method !== "get" ? { body: JSON.stringify(body) } : {})
            })

            const jsonResp = await resp.json();
            resolve(jsonResp)
        } catch (error) {
            reject(error);
        }
    });
}

export { memoizeIt, debounce, apiCall };