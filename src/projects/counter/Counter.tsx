import React, { ChangeEvent, useEffect, useRef, useState, type KeyboardEvent } from "react";

/*
    Machine Coding Problem: Counter
    Build a fully functional, accessible Counter component that supports:
    1. Increment (+), Decrement (-), and Reset controls.
    2. Custom step value configuration (e.g. 1, 5, 10).
    3. Min and Max threshold boundaries with disabled control states.
    4. Full keyboard accessibility (ArrowUp/ArrowDown, +, -, Escape to reset).
    5. Complete WAI-ARIA accessibility (role="status", aria-live="polite", aria-label).
*/

interface CounterProps {
    initialValue?: number;
    min?: number;
    max?: number;
    defaultStep?: number;
    autoFocus?: boolean;
}
export default function Counter({
    initialValue = 0,
    min = -100,
    max = 100,
    defaultStep = 1,
    autoFocus = true,
}: CounterProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const [step, setStep] = useState<string>(String(defaultStep));
    const [value, setValue] = useState<number>(initialValue);

    useEffect(() => {
        if (autoFocus) containerRef.current?.focus();
    }, [autoFocus]);

    function handleStepChange(e: ChangeEvent<HTMLInputElement>) {
        const val = (e.target.value).trim();
        setStep(val);
    }

    function handleIncValue() {
        setValue(prev => Math.min(prev + Number(step), max));
    }

    function handleDecrValue() {
        setValue(prev => Math.max(prev - Number(step), min));
    }

    function handleReset() {
        setStep(String(defaultStep));
        setValue(initialValue);
    }

    function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        const key = e.key;
        if (key === "+") {
            e.preventDefault();
            handleIncValue();
        } else if (key === "-") {
            e.preventDefault();
            handleDecrValue();
        } else if (key === "Escape") {
            e.preventDefault();
            handleReset();
        } else if (key === "ArrowUp") {
            e.preventDefault();

            setStep(prev => String(Number(prev) + 1));
        } else if (key === "ArrowDown") {
            e.preventDefault();

            setStep(prev => String(Number(prev) - 1));
        }
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-100">
            <div
                ref={containerRef}
                role="region" aria-label="counter component"
                className="flex flex-col items-center gap-6 focus:ring-1 focus:ring-blue-500"
                tabIndex={0}
                onKeyDown={handleKeyDown}
            >
                <header className="mb-6 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Counter</h1>
                </header>

                <div className="flex items-center justify-center gap-4">
                    <button
                        tabIndex={0}
                        aria-label={`decrease ${value} by ${step}`}
                        className="bg-slate-300 rounded-md px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={handleDecrValue}
                        disabled={value <= min}
                    >
                        -
                    </button>

                    <div
                        role="status"
                        aria-live="polite"
                        className="w-3xs h-8 flex items-center justify-center"
                    >
                        {value}
                    </div>

                    <button
                        tabIndex={0}
                        aria-label={`increase ${value} by ${step}`}
                        className="bg-slate-300 rounded-md px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={handleIncValue}
                        disabled={value >= max}
                    >
                        +
                    </button>
                </div>

                <input
                    tabIndex={0}
                    className="w-3xs"
                    type="number"
                    name="step"
                    aria-label="input field for step"
                    value={step}
                    onChange={handleStepChange}
                />

                <button tabIndex={0} className="px-3 px-1 bg-red-300 rounded-md" onClick={handleReset}>reset</button>
            </div>
        </main>
    );
}
