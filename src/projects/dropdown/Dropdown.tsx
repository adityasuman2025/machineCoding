import React, { useRef, useEffect, useState, type ChangeEvent, type MouseEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";

/*
    Machine Coding Problem: Accessible Select / Multi-Select Dropdown
    Build an accessible, customizable Dropdown component in React that supports:
    1. Single-select and Multi-select option modes.
    2. Search filtering / query input inside options menu.
    3. Keyboard navigation (ArrowUp / ArrowDown to navigate, Enter to select, Escape to close).
    4. Outside click handler to collapse menu when clicking elsewhere.
    5. WAI-ARIA accessibility (role="combobox", role="listbox", role="option", aria-expanded).
*/

interface SelectProps {
    value: string[],
    onChange: (values: string[]) => void
    multi?: boolean,
    options: string[],
}
function filterOptions(options: string[], query: string): string[] {
    const val = query.trim().toLowerCase();
    if (!val) return options;
    return options.filter(item => item.toLowerCase().includes(val));
}

function Select({
    value,
    onChange,
    multi = false,
    options,
}: SelectProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [results, setResults] = useState<string[]>(options);

    useEffect(() => {
        function handleClickOutside(e: globalThis.MouseEvent) {
            if (!containerRef.current || containerRef.current.contains(e.target as Node)) return;

            setIsDropdownOpen(false);
        }

        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        const key = e.key;

        const optionsEle = Array.from(containerRef.current?.querySelectorAll<HTMLElement>(`[role="option"]`));

        const activeElement = document.activeElement as HTMLElement;
        const activeElementIdx = optionsEle.indexOf(activeElement);

        if (key === "ArrowDown" || key === "ArrowUp") {
            e.preventDefault();

            if (activeElementIdx < 0) return optionsEle[0]?.focus(); // if no option is already focused

            if (key === "ArrowUp") {
                const prev = Math.max(0, activeElementIdx - 1);
                optionsEle[prev]?.focus();
            } else if (key === "ArrowDown") {
                const next = Math.min(optionsEle.length - 1, activeElementIdx + 1);
                optionsEle[next]?.focus();
            }
        } else if (key === "Escape") {
            e.preventDefault();
            setIsDropdownOpen(false);
            containerRef.current?.focus();
        } else if (key === " " || key === "Enter") {
            e.preventDefault();

            if (activeElementIdx < 0) {
                // options drop down is not open
                setIsDropdownOpen(true);
                inputRef.current?.focus();
            } else {
                // options drop down is open
                const val = activeElement?.getAttribute("data-value");
                if (val) handleChooseOption(val);
            }
        }
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        setResults(filterOptions(options, e.target.value));
    }

    function handleOptionClick(e: MouseEvent<HTMLElement>, option: string) {
        e.stopPropagation();
        handleChooseOption(option);
    }

    function handleChooseOption(option: string) {
        if (!multi) {
            setIsDropdownOpen(false);
            containerRef.current?.focus();
            onChange([option]);

            return;
        }

        if (value.includes(option)) onChange(value.filter(i => i !== option))
        else onChange([...value, option]);
    }

    function handleCompClick(e: MouseEvent) {
        e.stopPropagation();

        if (isDropdownOpen && e.target === inputRef.current) return; // if dropdown is already open and clicked element is input then doing nothing

        setIsDropdownOpen(true);
        inputRef.current?.focus();
    }

    return (
        <div
            ref={containerRef}
            tabIndex={0}
            className="flex flex-col w-3xs border-1 rounded-md border-gray-300 min-h-10 focus:ring-1 focus:ring-blue-300"
            role="combobox"
            aria-expanded={isDropdownOpen}
            aria-haspopup={"listbox"}
            aria-controls="options"
            onClick={handleCompClick}
            onKeyDown={handleKeyDown}
        >
            {
                multi ? (
                    <div className="p-1 w-full flex-1 flex items-center gap-1 flex-wrap">
                        {
                            value.map(val => (
                                <div key={val} role="listitem" className="bg-gray-200 text-sm rounded-md px-2 border border-gray-300 flex items-center">
                                    {val}
                                </div>
                            ))
                        }

                        <input
                            aria-label="search for options"
                            ref={inputRef}
                            className="min-w-[4rem] w-0 flex-1 text-sm border-none focus:outline-none"
                            type="text"
                            onChange={handleInputChange}
                            autoFocus={true}
                        />
                    </div>
                ) : isDropdownOpen ? (
                    <input
                        aria-label="search for options"
                        ref={inputRef}
                        defaultValue={value}
                        className="px-1 flex-1 w-full border-none focus:outline-none"
                        type="text"
                        onChange={handleInputChange}
                        autoFocus={true}
                    />
                ) : (
                    <div role="listitem" className={`px-1 flex-1 w-full flex items-center`}>
                        {value}
                    </div>
                )
            }

            <div className="relative w-full">
                {
                    isDropdownOpen ? (
                        <ul id="options" role="listbox" className="absolute shadow-sm w-full bg-white z-1 max-h-60 overflow-y-auto p-2">
                            {
                                results.map((opt, idx) => {
                                    const isSelected = value.includes(opt)
                                    return (
                                        <li
                                            tabIndex={isSelected ? 0 : -1}
                                            role="option"
                                            data-value={opt}
                                            aria-selected={isSelected}
                                            className={`w-full p-2 hover:bg-gray-200 cursor-pointer ${isSelected ? "bg-blue-100" : ""}`}
                                            key={`${opt}_${idx}`}
                                            onClick={(e) => handleOptionClick(e, opt)}
                                        >
                                            {opt}
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    ) : null
                }
            </div>

            <div className="sr-only" aria-live="polite" aria-atomic="true">
                {isDropdownOpen ? `${results.length} options available.` : ""}
            </div>
        </div>
    )
}

const OPTIONS = ["react", "next", "typescript", "javascript", "tailwind css", "html", "css", "node", "express", "mongo db"];

export default function Dropdown() {
    const [selected, setSelected] = useState<string[]>([]);

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <header className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-gray-900">Custom Accessible Dropdown</h1>
            </header>

            <div
                role="region"
                aria-label="dropdown component"
                className="flex flex-col items-center gap-4"
            >
                <p>select you skills</p>
                <Select
                    multi={true}
                    value={selected}
                    onChange={values => setSelected(values)}
                    options={OPTIONS}
                />
            </div>
        </main>
    );
}
