import React, { useEffect, useState, useRef, type RefObject, type SyntheticEvent } from 'react';

const FOCUSABLE_SELECTORS = "button, input, select, textarea, [href], [tabindex]";

export function useFocusTrap(
    containerRef: RefObject<HTMLElement | null>,
    isOpen: boolean,
    onCancel: () => void
) {
    useEffect(() => {
        if (!isOpen) return;

        const previouslyFocusedEle = document.activeElement as HTMLElement;

        const container = containerRef.current;
        if (!container) return;

        const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
        if (focusableElements.length) focusableElements[0].focus(); // focussing the first focusable element by default

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                e.preventDefault();
                onCancel();
                return;
            }

            if (e.key === "Tab") {
                const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
                if (!focusableElements.length) return e.preventDefault();

                const firstFocusableEle = focusableElements[0];
                const lastFocusableEle = focusableElements[focusableElements.length - 1];

                // if focus escaped or is outside the container, pull it back to the first element
                if (!container.contains(document.activeElement)) {
                    e.preventDefault();
                    firstFocusableEle.focus();
                    return;
                }

                if (e.shiftKey && document.activeElement === firstFocusableEle) {
                    // first element is already focused and shift + tab is pressed -> moving focus to last element
                    e.preventDefault();
                    lastFocusableEle.focus();
                } else if (!e.shiftKey && document.activeElement === lastFocusableEle) {
                    // if last element is clicked and tab is pressed -> moving focus to first element
                    e.preventDefault();
                    firstFocusableEle.focus();
                }
                // tab focus for rest of the middle elements are automatically handled by browser
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previouslyFocusedEle?.focus(); // retruning focus back to the element which was focused before the modal open
        };
    }, [containerRef, isOpen, onCancel]);
}

type ConfirmDialogProps = {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const backdropRef = useRef<HTMLDivElement | null>(null);

    useFocusTrap(dialogRef, isOpen, onCancel);

    function handleBackdropClick(e: SyntheticEvent<HTMLDivElement>) {
        const target = e.target;
        if (target === backdropRef.current) onCancel();
    }

    if (!isOpen) return null;
    return (
        <div
            className='absolute top-0 right-0 flex md:items-center md:justify-center items-end bg-slate-300/50 min-h-screen w-full'
            onClick={handleBackdropClick}
            ref={backdropRef}
        >
            <div
                className='bg-white rounded-md p-4 w-full md:w-fit'
                role='dialog'
                aria-modal="true"
                aria-labelledby='modal-title'
                aria-describedby='modal-desc'
                ref={dialogRef}
            >
                <h2 id='modal-title'>{title}</h2>
                <p id='modal-desc'>{message}</p>

                <div className='flex items-center justify-between mt-4'>
                    <button className='bg-red-100 py-1 px-2' tabIndex={0} onClick={onCancel}>Cancel</button>
                    <button className='bg-red-100 py-1 px-2' tabIndex={0} onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    );
}

export default function ModalWithFocusTrap() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div>
            ModalWithFocusTrap
            <ConfirmDialog
                isOpen={isOpen}
                title="r u sure?"
                message="do you want to delete it?"
                onConfirm={() => {
                    console.log("confirm clicked");
                    setIsOpen(false);
                }}
                onCancel={() => setIsOpen(false)}
            />
        </div>
    );
}
