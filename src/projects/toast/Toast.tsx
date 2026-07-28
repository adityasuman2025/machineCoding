import React, { createContext, useContext, useCallback, useMemo, memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const DEFAULT_DURATION: number = 5000;

const TOAST_TYPE = {
    Success: "Success",
    Warning: "Warning",
    Error: "Error",
    Info: "Info",
} as const;
type toastType = typeof TOAST_TYPE[keyof typeof TOAST_TYPE];

interface ToastContextValue {
    success: (message: string, duration?: number) => void,
    warning: (message: string, duration?: number) => void,
    error: (message: string, duration?: number) => void,
    info: (message: string, duration?: number) => void,
}
const ToastContext = createContext<ToastContextValue>(null);

interface ToastData {
    id: string,
    type: toastType,
    message: string,
    duration: number
}

interface ToastProps extends ToastData {
    onClose: (id: string) => void,
}
function Toast({
    id,
    type,
    message,
    duration,
    onClose
}: ToastProps) {
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return;

        const timer = setTimeout(() => {
            onClose(id)
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose, id, isHovered]);

    console.log("Toast re-render", id, message);

    return (
        <div
            role={type === TOAST_TYPE.Error ? "alert" : "status"}
            aria-live={type === TOAST_TYPE.Error ? "assertive" : "polite"}
            className={`
                py-3 px-5 w-xs rounded-lg text-zinc-100 
                ${type === TOAST_TYPE.Success ? "bg-green-500 " : type === TOAST_TYPE.Error ? "bg-red-500" : type === TOAST_TYPE.Info ? "bg-teal-500" : "bg-orange-500"}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex justify-end">
                <button aria-label={`close ${type} toast having message ${message}`} className="bg-red-900 text-zinc-100 rounded-full h-4 w-4" onClick={() => onClose(id)}></button>
            </div>
            {message}
        </div>
    );
}
const MemoisedToast = memo(Toast);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const addToast = useCallback((type: toastType, message: string, duration: number = DEFAULT_DURATION) => {
        setToasts(prev => [...prev, { id: crypto.randomUUID(), message, type, duration }]);
    }, []);

    const success = useCallback((message: string, duration?: number) => addToast(TOAST_TYPE.Success, message, duration), [addToast]);
    const warning = useCallback((message: string, duration?: number) => addToast(TOAST_TYPE.Warning, message, duration), [addToast]);
    const error = useCallback((message: string, duration?: number) => addToast(TOAST_TYPE.Error, message, duration), [addToast]);
    const info = useCallback((message: string, duration?: number) => addToast(TOAST_TYPE.Info, message, duration), [addToast]);

    const handleToastClose = useCallback((id: string) => {
        setToasts(prev => prev.filter(item => item.id !== id));
    }, []);

    const contextValue = useMemo(() => ({ success, warning, error, info }), [success, warning, error, info]);

    console.log("ToastProvider re-render");

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            {
                toasts.length > 0 ? (
                    createPortal((
                        <div
                            role="region" aria-label="notifications"
                            className="fixed top-4 right-4 flex flex-col gap-4 z-50"
                        >
                            {
                                toasts.map(toast => (
                                    <MemoisedToast
                                        key={toast.id}
                                        id={toast.id}
                                        message={toast.message}
                                        type={toast.type}
                                        duration={toast.duration}
                                        onClose={handleToastClose}
                                    />
                                ))
                            }
                        </div>
                    ), document.body)
                ) : null
            }
        </ToastContext.Provider>
    )
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("Toast context is not defined");

    return ctx
}
