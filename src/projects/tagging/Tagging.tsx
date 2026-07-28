import React, { useRef, useState, type MouseEvent, type SubmitEvent, type KeyboardEvent, useCallback, memo, useEffect } from "react";
import { createPortal } from "react-dom";

/*
    Machine Coding Problem: Pin Tagging Canvas
    Build a customizable, accessible Pin Tagging Canvas component in React that supports:
    1. Click on canvas to spawn floating input & pin tags via Enter key.
    2. Removing tags via click on 'x' button.
    3. Tag whitespace trimming & Escape/Backspace key form dismissal.
    4. WAI-ARIA accessibility (role="region", role="list", role="listitem", aria-label).
*/

interface TagItemProps {
    id: string,
    text: string,
    x: number
    y: number
    onDeleteClick: (id: string) => void
}
function TagItem({
    id,
    text,
    x,
    y,
    onDeleteClick
}: TagItemProps) {
    function handleDeleteClick(e: MouseEvent<HTMLButtonElement>) {
        e.stopPropagation();
        onDeleteClick(id);
    }

    return (
        <div
            className="tagItem absolute text-zinc-100 text-sm bg-gray-900/70 py-1 px-2 rounded-md flex items-center gap-2"
            role="listitem"
            aria-label={`tag of text ${text} at pos top: ${y}, left: ${x}`}
            style={{ top: y, left: x }}
        >
            {text}
            <button aria-label={`delete tag ${text}`} className="w-2.5 h-2.5 border-none rounded-full bg-red-500" onClick={handleDeleteClick} />
        </div>
    )
}
const MemoisedTagItem = memo(TagItem);

interface TagData {
    x: number,
    y: number,
    text: string,
    id: string,
}

interface InputState {
    inputPosX: number;
    inputPosY: number;
    tagPos: { x: number; y: number };
}

function Tagger() {
    const containerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const [tags, setTags] = useState<TagData[]>([]);
    const [inputData, setInputData] = useState<InputState | null>(null);

    useEffect(() => {
        if (!inputData) return;
        else formRef.current?.querySelector("input")?.focus();

        function handleClickOutside(e: globalThis.MouseEvent) {
            if (
                containerRef.current?.contains(e.target as Node) ||
                formRef.current?.contains(e.target as Node)
            ) return;

            setInputData(null);
        }

        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, [inputData]);

    function handleClick(e: MouseEvent<HTMLDivElement>) {
        // if clicked inside the active input form, do nothing
        if (formRef.current?.contains(e.target as Node)) return;

        // if clicked on an existing tag, close any active input form
        if (Array.from((e.target as HTMLElement).classList).includes("tagItem")) return setInputData(null);

        const x = Number(e.nativeEvent.offsetX);
        const y = Number(e.nativeEvent.offsetY);

        const inputPosX = Number(e.nativeEvent.pageX);
        const inputPosY = Number(e.nativeEvent.pageY);

        formRef.current?.reset(); // cleaning any already inputted text
        setInputData({ inputPosX, inputPosY, tagPos: { x, y } });
    }

    function handleInputSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!inputData) return;

        const formData = new FormData(e.currentTarget);
        const tagInput = (formData.get("tagInput") as string).trim();
        if (tagInput) {
            setTags(prev => ([...prev, { x: inputData.tagPos.x, y: inputData.tagPos.y, text: tagInput, id: crypto.randomUUID() }]));
            setInputData(null);
        }
    }

    function handleKeyDown(e: KeyboardEvent<HTMLFormElement>) {
        const key = e.key;
        const tagInput = (e.target as HTMLInputElement).value?.trim();

        if (key === 'Escape' || (key === "Backspace" && tagInput === "")) {
            e.preventDefault();
            setInputData(null);
        }
    }

    const handleDeleteTag = useCallback((id: string) => {
        setTags(prev => prev.filter(item => item.id !== id))
    }, []);

    return (
        <>
            <div
                ref={containerRef}
                role="region"
                aria-label="tagging canvas"
                className="flex flex-col items-center gap-4 w-120 h-120 bg-emerald-300 relative"
                onClick={handleClick}
            >
                <div role="list" aria-label="pinned tags">
                    {
                        tags.map(tag => (
                            <MemoisedTagItem
                                key={tag.id}
                                id={tag.id}
                                x={tag.x}
                                y={tag.y}
                                text={tag.text}
                                onDeleteClick={handleDeleteTag}
                            />
                        ))
                    }
                </div>
            </div>

            {
                inputData ? (
                    createPortal(
                        <form
                            ref={formRef}
                            aria-label="add new tag form"
                            className="fixed z-10"
                            style={{ top: inputData.inputPosY, left: inputData.inputPosX }}
                            onSubmit={handleInputSubmit}
                            onKeyDown={handleKeyDown}
                        >
                            <input aria-label="add new tag input" type="text" className="bg-zinc-100" name="tagInput" autoFocus={true} />
                        </form>
                        , document.body)
                ) : null
            }
        </>
    )
}

export default function Tagging() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <header className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-gray-900">Tag Input (Tagging)</h1>
            </header>

            <Tagger />
        </main>
    );
}
