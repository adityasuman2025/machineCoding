import { useState, useEffect, useCallback, ChangeEvent, useRef } from "react";
import "./Countdown.scoped.css";

const MINUTES_TENS = "minutesTens";
const MINUTES_UNITS = "minutesUnits";
const SECONDS_TENS = "secondsTens";
const SECONDS_UNITS = "secondsUnits";

function validateInput(val: string, isTensPosition: boolean = false) {
    if (val === "") return "";

    const num = Number(val);
    if (Number.isFinite(num) && val !== "") {
        if (isTensPosition && num > 5) return 5;
        return num % 10;
    } else return "";
}

function getTotalSeconds(time: timeData) {
    return 60 * (Number(time[MINUTES_TENS]) * 10 + Number(time[MINUTES_UNITS])) + Number(time[SECONDS_TENS]) * 10 + Number(time[SECONDS_UNITS])
}

function getTimeFromSeconds(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
        [MINUTES_TENS]: Math.floor(minutes / 10),
        [MINUTES_UNITS]: minutes % 10,
        [SECONDS_TENS]: Math.floor(seconds / 10),
        [SECONDS_UNITS]: seconds % 10
    }
}

interface timeData {
    [MINUTES_TENS]: number | "",
    [MINUTES_UNITS]: number | "",
    [SECONDS_TENS]: number | "",
    [SECONDS_UNITS]: number | "",
}
export default function Countdown() {
    let intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [time, setTime] = useState<timeData>({
        [MINUTES_TENS]: 0,
        [MINUTES_UNITS]: 0,
        [SECONDS_TENS]: 5,
        [SECONDS_UNITS]: 9
    })
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        return () => clearInterval(intervalRef.current);
    }, []);

    const clear = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);
    }, []);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const { value, name } = e.target;
        const val = validateInput(value, [SECONDS_TENS, MINUTES_TENS].includes(name));

        setTime((prev) => ({ ...prev, [name]: val }));
    }, []);

    const handleStartStopClick = useCallback(() => {
        if (isRunning) clear();
        else {
            let totalSeconds = getTotalSeconds(time);
            if (totalSeconds <= 0) return;

            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsRunning(true);

            setTime(getTimeFromSeconds(totalSeconds--));

            intervalRef.current = setInterval(() => {
                if (totalSeconds < 0) return clear();

                setTime(getTimeFromSeconds(totalSeconds--));
            }, 1000);
        }
    }, [isRunning, time, clear]);

    const handleResetClick = useCallback(() => {
        clear();
        setTime({
            [MINUTES_TENS]: 0,
            [MINUTES_UNITS]: 0,
            [SECONDS_TENS]: 5,
            [SECONDS_UNITS]: 9
        })
    }, [clear]);

    return (
        <section className="content">
            <h2>Please enter a valid time in MM:SS</h2>

            <section className="box">
                <input
                    type="text"
                    className={"input " + (isRunning ? "disabled" : "")}
                    maxLength={1}
                    name={MINUTES_TENS}
                    value={time[MINUTES_TENS]}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    className={"input " + (isRunning ? "disabled" : "")}
                    maxLength={1}
                    name={MINUTES_UNITS}
                    value={time[MINUTES_UNITS]}
                    onChange={handleChange}
                />
                :
                <input
                    type="text"
                    className={"input " + (isRunning ? "disabled" : "")}
                    maxLength={1}
                    name={SECONDS_TENS}
                    value={time[SECONDS_TENS]}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    className={"input " + (isRunning ? "disabled" : "")}
                    maxLength={1}
                    name={SECONDS_UNITS}
                    value={time[SECONDS_UNITS]}
                    onChange={handleChange}
                />
            </section>
            <br />

            <section className="box">
                <button onClick={handleStartStopClick}>{isRunning ? "stop" : "start"}</button>
                <button onClick={handleResetClick}>reset</button>
            </section>
        </section>
    )
}