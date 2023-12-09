const TIMER_INPUT_TYPES = ["tensMin", "min", "tensSec", "sec"];

const contentEle = document.getElementById("content");
const startBtnEle = contentEle.querySelector("[data-type='startBtn']");
const stopBtnEle = contentEle.querySelector("[data-type='stopBtn']");
const inputEles = contentEle.querySelectorAll(".input");
contentEle.addEventListener("keyup", handleContentChange);
contentEle.addEventListener("click", handleContentClick);

let interval;

function handleContentChange(e) {
    e.preventDefault();

    const type = e?.target?.dataset?.type;
    if (!TIMER_INPUT_TYPES.includes(type)) return;

    const key = e.key.trim();
    const val = (e.target.value).trim();

    if ((key && !isNaN(Number(key))) || (key === "Backspace")) {
        // tens position of minute and second can't have value greater than 5, as minute/second can be greater than 59
        if ([TIMER_INPUT_TYPES[0], TIMER_INPUT_TYPES[2]].includes(type) && Number(key) > 5) {
            e.target.value = "0";
            e.target.select();
            return;
        }

        e.target.value = key;

        // focusing on next input element
        const thisInputEleIdx = TIMER_INPUT_TYPES.indexOf(type);
        const nextInputElxIdx = thisInputEleIdx + 1;
        if (nextInputElxIdx < TIMER_INPUT_TYPES.length) {
            const nextInputEleQuery = `[data-type="${TIMER_INPUT_TYPES[nextInputElxIdx]}"]`;
            contentEle.querySelector(nextInputEleQuery)?.focus();
        }
    } else {
        e.target.value = "0";
    }
}

function handleContentClick(e) {
    const type = e?.target?.dataset?.type;
    if (TIMER_INPUT_TYPES.includes(type)) e.target.select(); // auto selecting content of the timer input field on click/focus
    else if (type === "startBtn") handleStartBtnClick()
    else if (type === "stopBtn") handleStopBtnClick()
}

function handleStartBtnClick() {
    startBtnEle.setAttribute("disabled", true);
    stopBtnEle.removeAttribute("disabled");

    let timerObj = {};
    for (let i = 0; i < inputEles.length; i++) {
        const type = inputEles?.[i]?.dataset?.type, val = inputEles?.[i]?.value;
        timerObj[type] = val;

        inputEles[i].classList.add("disabled"); // disabling timer input fields
    }
    let timeInSeconds = getTimeInSecondsFromMMSS(timerObj);

    clearInterval(interval); // clearing if any, already present interval
    interval = setInterval(() => {
        timeInSeconds--;

        const timeObj = getMMSSFromSeconds(timeInSeconds);
        renderTimer(timeObj); // re-rendering timer with updated value

        if (timeInSeconds === 0) clearInterval(interval); // if time is 0 then stopping interval
    }, 1000);
}

function handleStopBtnClick() {
    clearInterval(interval);

    stopBtnEle.setAttribute("disabled", true);
    startBtnEle.removeAttribute("disabled");

    for (let i = 0; i < inputEles.length; i++)  inputEles[i].classList.remove("disabled"); // enabling timer input fields
}

function renderTimer(timerObj) {
    Object.keys(timerObj).forEach(type => {
        const timerInputEle = contentEle.querySelector(`[data-type="${type}"]`);
        if (timerInputEle) timerInputEle.value = timerObj[type];
    })
}

function getTimeInSecondsFromMMSS(timerObj) {
    const second = Number(timerObj["tensSec"] + timerObj["sec"]);
    const minute = Number(timerObj["tensMin"] + timerObj["min"]);

    return minute * 60 + second;
}

function getMMSSFromSeconds(seconds) {
    let minute = String(parseInt(seconds / 60));
    let second = String(seconds % 60);

    minute = minute.length < 2 ? "0" + minute : minute; // adding 0 (extra padding) if length is less than 2
    second = second.length < 2 ? "0" + second : second; // adding 0 (extra padding) if length is less than 2

    return { tensMin: minute[0] || "0", min: minute[1] || "0", tensSec: second[0] || "0", sec: second[1] || "0" };
}
