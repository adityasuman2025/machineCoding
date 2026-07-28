import React, { useRef, useEffect } from "react";

/*
    Machine Coding Problem: Accessible Select / Multi-Select Dropdown
    Build an accessible, customizable Dropdown component in React that supports:
    1. Single-select and Multi-select option modes.
    2. Search filtering / query input inside options menu.
    3. Keyboard navigation (ArrowUp / ArrowDown to navigate, Enter to select, Escape to close).
    4. Outside click handler to collapse menu when clicking elsewhere.
    5. WAI-ARIA accessibility (role="combobox", role="listbox", role="option", aria-expanded).
*/

function useAutoFocus(autoFocus: boolean = false) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (autoFocus) containerRef.current?.focus();
    }, [autoFocus]);

    return containerRef;
}

interface DropdownProps {
    autoFocus?: boolean;
}

export default function Dropdown({ autoFocus = true }: DropdownProps) {
    const containerRef = useAutoFocus(autoFocus);

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <header className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-gray-900">Custom Accessible Dropdown</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Select options with mouse or keyboard navigation.
                </p>
            </header>

            <div
                ref={containerRef}
                tabIndex={0}
                role="region"
                aria-label="dropdown component"
                className="flex flex-col items-center gap-4 outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-6 bg-white shadow-md border border-gray-200 w-full max-w-md"
            >
                {/* Start your implementation here */}
            </div>
        </main>
    );
}
