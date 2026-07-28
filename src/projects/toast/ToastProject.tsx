import React, { useRef, useEffect } from "react";
import { ToastProvider, useToast } from "./Toast"

/*
    Machine Coding Problem: Toast Notification System
    Build an accessible, configurable Toast Notification library/component that supports:
    1. Multiple notification variants (success, error, warning, info).
    2. Auto-dismiss timer with configurable duration (e.g. 3000ms) & manual close button.
    3. Stacking
    4. Imperative API or Context Provider (e.g., toast.success("Message"), toast.error("Error")).
    5. Clean unmount timers & pause auto-dismiss on hover.
    6. WAI-ARIA accessibility (role="status" / role="alert", aria-live="polite" / "assertive").
*/

function useAutoFocus(autoFocus: boolean = false) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (autoFocus) containerRef.current?.focus();
    }, [autoFocus])

    return containerRef;
}

function Buttons() {
    const toast = useToast();

    console.log("Buttons re-rendered")

    return (
        <div role="group" className="flex gap-10">
            <button tabIndex={0} className="bg-green-400 px-3 py-1" onClick={() => toast.success("ho gaya", 500)}>create success toast</button>

            <button tabIndex={0} className="bg-teal-400 px-3 py-1" onClick={() => toast.info("pata hai tumko")}>create info toast</button>

            <button tabIndex={0} className="bg-orange-400 px-3 py-1" onClick={() => toast.warning("kuch dikkat hai")}>create warning toast</button>

            <button tabIndex={0} className="bg-red-400 px-3 py-1" onClick={() => toast.error("fatt gaya")}>create error toast</button>
        </div>
    )
}

export default function ToastProject({ autoFocus = true }: { autoFocus?: boolean }) {
    const containerRef = useAutoFocus(autoFocus);

    return (
        <ToastProvider>
            <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <header className="mb-6 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Toast Notification System</h1>
                </header>

                <div
                    ref={containerRef}
                    tabIndex={0}
                    role="region"
                    aria-label="toast creation component"
                    className="flex flex-col items-center gap-4 outline-none focus:ring-2 focus:ring-blue-500 p-10"
                >
                    <Buttons />
                </div>
            </main>
        </ToastProvider>
    );
}
