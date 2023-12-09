let fruits;

const inputEle = document.getElementById("input");
const suggestionsEle = document.getElementById("suggestions");
suggestionsEle.addEventListener("click", handleSuggestionClick);
inputEle.addEventListener("keyup", debounce(handleOnInputChange, 150));

function handleSuggestionClick({ target } = {}) {
    const { id } = target.dataset || {};

    if (id) {
        inputEle.value = id;
        suggestionsEle.classList.add("hidden"); // hiding suggestion container
    }
}

const memoisedGetSuggestions = memoiseIt(getSuggestions);
async function getSuggestions(query) {
    if (!fruits) fruits = await apiCall("https://jsonblob.com/api/1145157285227388928"); //api call will happen only once

    return fruits.filter(i => i.toLowerCase().includes(query.toLowerCase()));
}

async function handleOnInputChange(e) {
    const target = e.target;
    const { value } = target || {};

    if (value.trim()) {
        const suggestions = await memoisedGetSuggestions(value);
        renderSuggestion(suggestions);

        suggestionsEle.classList.remove("hidden"); // displaying suggestion container
    } else {
        suggestionsEle.classList.add("hidden"); // hiding suggestion container
    }
}

function renderSuggestion(suggestions) {
    const suggItemsEle = document.createElement("div");
    suggestions.forEach(i => {
        const suggItemEle = document.createElement("div");
        suggItemEle.classList.add("suggestion")
        suggItemEle.innerText = i;
        suggItemEle.dataset.id = i;

        suggItemsEle.appendChild(suggItemEle);
    });

    suggestionsEle.innerHTML = suggItemsEle.innerHTML;
}


// utils
function memoiseIt(func) {
    let cache = {};

    return async function(...args) {
        const key = JSON.stringify(args);

        if (!cache.hasOwnProperty(key)) cache[key] = await func.call(this, ...args)

        return cache[key];
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