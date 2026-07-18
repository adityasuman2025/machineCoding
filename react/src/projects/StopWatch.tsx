import { useCallback, useState, useEffect, useRef, memo } from "react";

interface ButtonsProps {
    isRunning: boolean;
    onStartStopClick: () => void;
    onResetClick: () => void;
}
function Buttons({ isRunning, onStartStopClick, onResetClick }: ButtonsProps) {
    return (
        <div>
            <button onClick={onStartStopClick}>{isRunning ? "Stop" : "Start"}</button>
            <button onClick={onResetClick}>Reset</button>
        </div>
    );
}
const MemoisedButtons = memo(Buttons);

export default function Stopwatch() {
    const startTimeRef = useRef(0);
    const timerRef = useRef(null);

    const [isRunning, setIsRunning] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);

    const clearTimer = useCallback(() => {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }, []);

    const runTimer = useCallback(() => {
        timerRef.current = setInterval(() => {
            setTimeElapsed(Date.now() - startTimeRef.current);
        }, 50);
    }, []);

    useEffect(() => {
        return () => clearTimer();
    }, [clearTimer]);

    const handleStartStopClick = useCallback(() => {
        clearTimer();

        if (!isRunning) {
            startTimeRef.current = Date.now() - timeElapsed;
            runTimer();
        }

        setIsRunning((prev) => !prev);
    }, [isRunning, timeElapsed, runTimer, clearTimer]);

    const handleResetClick = useCallback(() => {
        clearTimer();
        setIsRunning(false);
        setTimeElapsed(0);
    }, [clearTimer]);

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
