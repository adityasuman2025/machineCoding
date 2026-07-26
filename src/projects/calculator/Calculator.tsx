import React, { useState, useEffect, type MouseEvent } from 'react';

const OP = ["+", "-", "/", "*"];
const VALID_KEYS = [...OP, "Backspace", "Escape", "Enter", "=", "c", "C"];

function isNumber(str: string = "") {
    str = str.trim();
    return Number.isFinite(Number(str)) && str !== "";
}

function calculate(expr: string) {
    if (expr[0] === "-") expr = "0" + expr; // converts "-88.10/2" -> "0-88.10/2"

    const sanitised = OP.includes(expr.at(-1)) ? expr.slice(0, -1) : expr;
    if (!sanitised) return "";

    const tokens: string[] = [];
    let acc = "";
    for (let i = 0; i < sanitised.length; i++) {
        const char = sanitised[i];
        if (OP.includes(char)) {
            if (acc) tokens.push(acc);
            tokens.push(char);
            acc = "";
        } else {
            acc += char;
        }
    }
    if (acc) tokens.push(acc);

    if (!tokens.length) return "";

    // performing multiplication and division first
    const pass1 = [];
    let i = 0;
    while (i < tokens.length) {
        const token = tokens[i];
        if (token === "/" || token === "*") {
            const num1 = Number(pass1.pop());
            const num2 = Number(tokens[i + 1]);

            const res = token === "*" ? num1 * num2 : num1 / num2;
            pass1.push(res);
            i += 2;
        } else {
            pass1.push(token);
            i++
        }
    }

    let result = Number(pass1[0]);
    i = 1;
    while (i < pass1.length) {
        const op = pass1[i];
        const num2 = Number(pass1[i + 1]);

        result = op === "+" ? (result + num2) : op === "-" ? (result - num2) : result;
        i += 2;
    }


    return String(result.toFixed(2));
}

export default function Calculator() {
    const [display, setDisplay] = useState<string>("");

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    function handleClick(e: MouseEvent<HTMLDivElement>) {
        const id = (e.target as HTMLElement).dataset.id;
        if (!id) return;

        handleInput(id);
    }

    function handleKeyDown(e: KeyboardEvent) {
        const key = e.key;
        const activeEl = document.activeElement as HTMLElement | null;
        const isCalcButton = activeEl?.tagName === "BUTTON" && activeEl?.dataset?.id !== undefined;

        // If user tabbed onto one of OUR calculator buttons and presses Enter or Space, let native button click handle it
        if (isCalcButton && (key === "Enter" || key === " ")) return;

        if (isNumber(key) || VALID_KEYS.includes(key)) {
            e.preventDefault();
            handleInput(key);
        }
    }

    function handleInput(key: string) {
        if (isNumber(key)) {
            setDisplay(prev => prev + key);
        } else if (OP.includes(key)) {
            setDisplay(prev => {
                if (!prev) return "";

                return (OP.includes(prev.at(-1)) ? prev.slice(0, prev.length - 1) : prev) + key
            });
        } else if (key === "Backspace") {
            setDisplay(prev => prev.slice(0, prev.length - 1));
        } else if (key === "Escape" || key === "C" || key === "c") {
            setDisplay("");
        } else if (key === "=" || key === "Enter") {
            setDisplay(prev => calculate(prev));
        }
    }

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <header className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-gray-900">Basic Calculator</h1>
            </header>

            <div role='status' aria-live="polite" className='w-3xs h-10 border-1 mb-1'>{display}</div>
            <div role='group' aria-label='calculator keypad' className='grid grid-cols-4 gap-1' onClick={handleClick} >
                <button type="button" tabIndex={0} data-id="Backspace" className='px-4 py-1 cursor-pointer bg-yellow-500'>{"<"}</button>
                <button type="button" tabIndex={0} data-id="C" className='px-4 py-1 cursor-pointer bg-yellow-500'>{"C"}</button>
                <button type="button" tabIndex={0} data-id="=" className='px-4 py-1 cursor-pointer bg-yellow-500'>=</button>
                <button type="button" tabIndex={0} data-id="/" className='px-4 py-1 cursor-pointer bg-amber-600'>/</button>

                <button type="button" tabIndex={0} data-id="7" className='px-4 py-1 cursor-pointer bg-yellow-500'>7</button>
                <button type="button" tabIndex={0} data-id="8" className='px-4 py-1 cursor-pointer bg-yellow-500'>8</button>
                <button type="button" tabIndex={0} data-id="9" className='px-4 py-1 cursor-pointer bg-yellow-500'>9</button>
                <button type="button" tabIndex={0} data-id="*" className='px-4 py-1 cursor-pointer bg-amber-600'>x</button>

                <button type="button" tabIndex={0} data-id="4" className='px-4 py-1 cursor-pointer bg-yellow-500'>4</button>
                <button type="button" tabIndex={0} data-id="5" className='px-4 py-1 cursor-pointer bg-yellow-500'>5</button>
                <button type="button" tabIndex={0} data-id="6" className='px-4 py-1 cursor-pointer bg-yellow-500'>6</button>
                <button type="button" tabIndex={0} data-id="-" className='px-4 py-1 cursor-pointer bg-amber-600'>-</button>

                <button type="button" tabIndex={0} data-id="1" className='px-4 py-1 cursor-pointer bg-yellow-500'>1</button>
                <button type="button" tabIndex={0} data-id="2" className='px-4 py-1 cursor-pointer bg-yellow-500'>2</button>
                <button type="button" tabIndex={0} data-id="3" className='px-4 py-1 cursor-pointer bg-yellow-500'>3</button>
                <button type="button" tabIndex={0} data-id="+" className='px-4 py-1 cursor-pointer bg-amber-600'>+</button>

                <button type="button" tabIndex={0} data-id="0" className='px-4 py-1 cursor-pointer bg-yellow-500'>0</button>
            </div>
        </main>
    );
}
