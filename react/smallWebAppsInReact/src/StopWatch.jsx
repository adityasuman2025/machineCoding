import { useCallback, useState, useEffect, useRef, memo } from "react";

function Buttons({ isRunning, onStartStopClick, onResetClick }) {
    return (
        <div>
            <button onClick={onStartStopClick}>{isRunning ? "Stop" : "Start"}</button>
            <button onClick={onResetClick}>Reset</button>
        </div>
    );
}
const MemoisedButtons = memo(Buttons);

export default function Stopwatch() {
    const timerRef = useRef(null);

    const [isRunning, setIsRunning] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);

    const clearTimer = useCallback(() => {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }, []);

    const runTimer = useCallback(() => {
        clearTimer();
        const startTime = Math.floor(Date.now() - timeElapsed);

        timerRef.current = setInterval(() => {
            setTimeElapsed(Date.now() - startTime);
        }, 50);
    }, [timeElapsed]);

    useEffect(() => {
        if (isRunning) runTimer();
        else clearTimer();

        return () => clearTimer();
    }, [isRunning, runTimer]);

    const handleStartStopClick = useCallback(() => {
        setIsRunning((prev) => !prev);
    }, []);

    const handleResetClick = useCallback(() => {
        setIsRunning(false);
        setTimeElapsed(0);
    }, []);

    const milliS = Math.floor((timeElapsed % 1000) / 10);
    const seconds = Math.floor((timeElapsed / 1000) % 60);
    const mins = Math.floor(timeElapsed / (1000 * 60));

    return (
        <div>
            <p>
                {mins ? <b>{mins}m </b> : null}
                <b>{seconds}s </b>
                <span>{milliS}ms</span>
            </p>

            <MemoisedButtons
                isRunning={isRunning}
                onStartStopClick={handleStartStopClick}
                onResetClick={handleResetClick}
            />
        </div>
    );
}
