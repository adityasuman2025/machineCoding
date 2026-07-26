import React from 'react';

/*
    Machine Coding Problem: Basic Calculator
    Build a fully functional, accessible Calculator component that supports:
    1. Basic operations: Addition (+), Subtraction (-), Multiplication (*), Division (/).
    2. Number input (0-9) and decimal point (.).
    3. Clear (C / AC) and Backspace (⌫) functionality.
    4. Full keyboard support (0-9, +, -, *, /, Enter/=, Escape, Backspace).
    5. Clean display formatting (handling division by zero, overflow, decimal precision).
    6. WAI-ARIA accessibility (semantic HTML, grid/button roles, aria-live region for display).
*/

export default function Calculator() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 select-none">
            <header className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-gray-900">Basic Calculator</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Use mouse clicks or keyboard keys to perform calculations.
                </p>
            </header>
        </main>
    );
}
