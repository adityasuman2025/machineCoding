const ticker = new Worker('timerWorker.js');

const DURATION_INPUT_TYPE_SESSION = "session", DURATION_INPUT_TYPE_BREAK = "break";
const MAX_DURATION = { [DURATION_INPUT_TYPE_SESSION]: 60, [DURATION_INPUT_TYPE_BREAK]: 20 };
const BCKGRND_COLOR = { [DURATION_INPUT_TYPE_SESSION]: "rgb(56, 133, 138)", [DURATION_INPUT_TYPE_BREAK]: "rgb(186, 73, 73)" };


const fieldsEle = document.getElementById("fields");
const playPauseBtnEle = document.getElementById("playPauseBtn");
const contentEle = document.getElementById("content");
const durationTypeEle = document.getElementById("durationType");
contentEle.addEventListener("keyup", handleDurationChange);
contentEle.addEventListener("click", handleContentClick);

let durationType = DURATION_INPUT_TYPE_SESSION; // by default session will run
renderDurationType(durationType);

const durationValues = { [DURATION_INPUT_TYPE_SESSION]: 25, [DURATION_INPUT_TYPE_BREAK]: 5 }; // in mins
renderDurationInput(durationValues, DURATION_INPUT_TYPE_SESSION); // rendering duration input field by default value
renderDurationInput(durationValues, DURATION_INPUT_TYPE_BREAK); // rendering duration input field by default value

let interval;
let timeInSeconds = durationValues[durationType] * 60;
renderTimer(getMMSSFromSeconds(timeInSeconds)); // rendering default session duration
let hasTimerStarted = false;

function handleDurationChange(e) {
    const { type, field } = e?.target?.dataset || {};
    const key = e?.key?.trim();

    if (!type || !field) return;

    // allowing only numbers
    if ((!isNaN(Number(key)) && key) || key === "Backspace") durationValues[field] = e.target.value;
    else e.target.value = durationValues[field];

    // if input value is less than or greater than the range then limitting it
    const maxValue = MAX_DURATION[field];
    if (Number(e.target.value) >= maxValue) {
        e.target.value = maxValue;
        durationValues[field] = maxValue;
    }


    if (!hasTimerStarted && field === DURATION_INPUT_TYPE_SESSION) { // timer duration can be changed if timer has not been started yet
        timeInSeconds = durationValues[field] * 60;
        renderTimer(getMMSSFromSeconds(timeInSeconds));
    }
}

function handleContentClick(e) {
    const { type, field, status } = e?.target?.dataset || {};
    const maxValue = MAX_DURATION[field];

    if (!type) return;

    if (type === "minusActnBtn") {
        if (durationValues[field] - 1 >= 1) durationValues[field] = durationValues[field] - 1;

        renderDurationInput(durationValues, field);
    } else if (type === "plusActnBtn") {
        if (durationValues[field] + 1 <= maxValue) durationValues[field] = durationValues[field] + 1;

        renderDurationInput(durationValues, field);
    } else if (type === "playPauseBtn") {
        if (status === "play") handlePlayBtnClick();
        else if (status === "pause") handlePauseBtnClick();
    }


    if (!hasTimerStarted && field === DURATION_INPUT_TYPE_SESSION) { // timer duration can be changed if timer has not been started yet
        timeInSeconds = durationValues[field] * 60;
        renderTimer(getMMSSFromSeconds(timeInSeconds));
    }
}

function handlePlayBtnClick() {
    hasTimerStarted = true;

    startTimer();

    playPauseBtnEle.dataset.status = "pause";
    playPauseBtnEle.innerText = "Pause";

    fieldsEle.classList.add("disabled"); // disabling duration fields
}

function handlePauseBtnClick() {
    ticker.postMessage('stop');
    // clearInterval(interval);

    playPauseBtnEle.dataset.status = "play";
    playPauseBtnEle.innerText = "Play";

    fieldsEle.classList.remove("disabled"); // enabling duration fields
}

function startTimer() {
    timeInSeconds = timeInSeconds === undefined ? durationValues[durationType] * 60 : timeInSeconds;
    if (timeInSeconds <= 0) return;

    const durationTypeStr = durationType[0].toUpperCase() + durationType.substring(1).toLowerCase();
    showNotification({ msg: durationTypeStr + " has started of " + durationValues[durationType] + " mins" });

    ticker.postMessage('stop');

    /*
        we are using web worker for timer setInterval instead of direct setInterval because when browser is inactive/minimise/tab inactive
        direct setInterval stop working
    */

    // clearInterval(interval);
    // interval = setInterval(() => {
    //     timeInSeconds--;
    //     renderTimer(getMMSSFromSeconds(timeInSeconds));

    //     if (timeInSeconds === 0) {
    //         clearInterval(interval);

    //         toggleDurationType();
    //     }
    // }, 10);

    ticker.postMessage('start'); // starting web-worker timer setInterval
}

ticker.addEventListener('message', async (e) => {
    if (e.data === "tick") {
        timeInSeconds--;
        renderTimer(getMMSSFromSeconds(timeInSeconds));

        if (timeInSeconds === 0) {
            // clearInterval(interval);
            ticker.postMessage('stop');

            toggleDurationType();
        }
    }
});

function toggleDurationType() {
    durationType = durationType === DURATION_INPUT_TYPE_SESSION ? DURATION_INPUT_TYPE_BREAK : DURATION_INPUT_TYPE_SESSION;
    renderDurationType(durationType);

    timeInSeconds = undefined;
    document.body.style.backgroundColor = BCKGRND_COLOR[durationType];

    startTimer() // starting timer for the toggled duration type
}


// renders
function renderDurationInput(durationValues, field) {
    contentEle.querySelector(`.field .input[data-field="${field}"]`).value = durationValues[field];
}

function renderDurationType(durationType) {
    durationTypeEle.innerText = durationType[0].toUpperCase() + durationType.substring(1).toLowerCase();
}

function renderTimer(timerObj) {
    Object.keys(timerObj).forEach(key => {
        contentEle.querySelector(`#timer #${key}`).innerText = timerObj[key].trim();
    });
}


// utils
function getMMSSFromSeconds(seconds) {
    let minute = String(parseInt(seconds / 60));
    let second = String(seconds % 60);

    minute = minute.length < 2 ? "0" + minute : minute; // adding 0 (extra padding) if length is less than 2
    second = second.length < 2 ? "0" + second : second; // adding 0 (extra padding) if length is less than 2

    return { tensMin: minute[0] || "0", min: minute[1] || "0", tensSec: second[0] || "0", sec: second[1] || "0" };
}

function showNotification({ msg }) {
    const notification = new Notification("MNgo Pomodoro", {
        body: msg,
        // icon: "img.jpg"
    });
}


// initializing notification
document.addEventListener("click", handleMouseMove);
function handleMouseMove() {
    if (Notification.permission === "granted") {
        showNotification({ msg: "Welcome to MNgo Pomodoro App" });
    } else if (Notification.permission != "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                showNotification({ msg: "Welcome to MNgo Pomodoro App" });
            }
        });
    }

    document.removeEventListener("click", handleMouseMove);
}


// https://www.reddit.com/r/reactjs/comments/useyq8/setinterval_not_working_in_the_inactive_tab/?rdt=39245