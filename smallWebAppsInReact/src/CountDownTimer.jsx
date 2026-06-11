import React, { useState, Fragment } from 'react';

let interval;

function getSeconds(timeObj) {
    let { minutes, seconds } = timeObj || {};

    return (Number(minutes) * 60) + Number(seconds);
}

function getCounterTimeObj(timeInSeconds) {
    let minutes = addPrefixZero(parseInt(timeInSeconds / 60));
    let seconds = addPrefixZero(timeInSeconds % 60);

    return { minutes, seconds };
}

function addPrefixZero(number) {
    if (number < 10) return "0" + number;

    return number;
}

function CountDownTimer() {
    const [inputData, setInputData] = useState({ minutes: "0", seconds: "0" });
    const [counterTime, setCounterTime] = useState({ minutes: "00", seconds: "00" });
    const [isPaused, setIsPaused] = useState(false);

    function handleInputChange(e, type) {
        setInputData(prev => ({ ...prev, [type]: e.target.value }));
    }

    function handleStartButtonClick() {
        setIsPaused(false);

        setCounterTime(getCounterTimeObj(getSeconds(inputData)));

        startCounter(getSeconds(inputData));
    }

    function startCounter(timeInSeconds) {
        clearInterval(interval);

        let leftSeconds = timeInSeconds;
        interval = setInterval(() => {
            leftSeconds--;
            setCounterTime(getCounterTimeObj(leftSeconds));

            if (leftSeconds <= 0) clearInterval(interval);
        }, 1000);
    }

    function togglePause() {
        if (isPaused) {
            startCounter(getSeconds(counterTime));
        } else {
            clearInterval(interval);
        }

        setIsPaused(prev => !prev)
    }

    function handleResetClick() {
        clearInterval(interval);

        setInputData({ minutes: "0", seconds: "0" })
        setCounterTime({ minutes: "00", seconds: "00" });
        setIsPaused(false);
    }

    return (
        <Fragment>
            <label>
                <input type="number" value={inputData.minutes} onChange={(e) => handleInputChange(e, "minutes")} />
                Minutes
            </label>
            <label>
                <input type="number" value={inputData.seconds} onChange={(e) => handleInputChange(e, "seconds")} />
                Seconds
            </label>

            <button onClick={handleStartButtonClick}>START</button>
            <button onClick={togglePause}>PAUSE / RESUME</button>
            <button onClick={handleResetClick}>RESET</button>

            <h1 data-testid="running-clock">{counterTime.minutes}:{counterTime.seconds}</h1>
        </Fragment>
    );
}

export default CountDownTimer;
