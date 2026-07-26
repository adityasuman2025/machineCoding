import React, { memo, useMemo, useState, type MouseEvent, type KeyboardEvent } from 'react';

/*
    Machine Coding Problem: Area Selector / Drag Box Selection
    Build an interactive Area Selector component that allows users to:
    1. Click and drag on a canvas/grid to draw a selection rectangle (bounding box).
    2. Dynamically highlight elements/cells that intersect with the drawn rectangle.
    3. Support mouse events (mouseDown, mouseMove, mouseUp) & touch events.
    4. Provide clear visual bounding box styling (border, semi-transparent fill).
    5. Maintain performance during active dragging.
*/

interface CellProps {
    rowIdx: number;
    colIdx: number;
    isSelected: boolean;
}
function Cell({ rowIdx, colIdx, isSelected = false }: CellProps) {
    return (
        <div
            role='listitem'
            aria-selected={isSelected}
            aria-label={`cell with row ${rowIdx + 1} & column ${colIdx + 1} ${isSelected ? "is selected" : ""}`}
            tabIndex={rowIdx === 0 && colIdx === 0 ? 0 : -1}
            data-row-idx={rowIdx}
            data-col-idx={colIdx}
            className={`grid-cell-item border-1 box-border ${isSelected ? "bg-red-100" : ""}`}
            style={{ width: BOX_DIMN, height: BOX_DIMN }}
        />
    )
}
const MemoisedCell = memo(Cell);

const BOX_DIMN = 24;
const KEYS = {
    ARROW_LEFT: "ArrowLeft",
    ARROW_RIGHT: "ArrowRight",
    ARROW_UP: "ArrowUp",
    ARROW_DOWN: "ArrowDown",
}
const ALL_KEYS = [KEYS.ARROW_LEFT, KEYS.ARROW_RIGHT, KEYS.ARROW_DOWN, KEYS.ARROW_UP];

interface SelectionData {
    startRowIdx: number,
    startColIdx: number,
    endRowIdx: number,
    endColIdx: number,
}

export default function AreaSelector() {
    const [selection, setSelection] = useState<SelectionData | null>(null);

    const boundary = useMemo(() => {
        if (!selection) return null;

        return {
            minRow: Math.min(selection.startRowIdx, selection.endRowIdx),
            minCol: Math.min(selection.startColIdx, selection.endColIdx),

            maxRow: Math.max(selection.startRowIdx, selection.endRowIdx),
            maxCol: Math.max(selection.startColIdx, selection.endColIdx),
        }
    }, [selection]);

    const columns = Math.floor((window.innerWidth - 200) / BOX_DIMN);
    const rows = Math.floor((window.innerHeight - 200) / BOX_DIMN);
    const totalCells = rows * columns;

    function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
        const key = e.key;
        if (!ALL_KEYS.includes(key)) return;
        e.preventDefault();

        const cellEles = Array.from(document.querySelectorAll<HTMLElement>('.grid-cell-item'));
        if (!cellEles.length) return;

        const activeElement = document.activeElement as HTMLElement;
        const activeElementIdx = cellEles.findIndex(el => el === activeElement || el.contains(activeElement));
        if (activeElementIdx === -1) return cellEles[0]?.focus();

        let newFocusIdx = activeElementIdx;
        if (key === KEYS.ARROW_RIGHT) newFocusIdx = Math.min(activeElementIdx + 1, totalCells - 1);
        else if (key === KEYS.ARROW_LEFT) newFocusIdx = Math.max(activeElementIdx - 1, 0);
        else if (key === KEYS.ARROW_UP) newFocusIdx = Math.max(activeElementIdx - columns, activeElementIdx % columns);
        else if (key === KEYS.ARROW_DOWN) newFocusIdx = Math.min(activeElementIdx + columns, (totalCells - 1));

        cellEles[newFocusIdx]?.focus();
        if (e.shiftKey) {
            const newRowIdx = Math.floor(newFocusIdx / columns), newColIdx = newFocusIdx % columns;
            if (selection) setSelection(prev => ({ ...prev, endRowIdx: newRowIdx, endColIdx: newColIdx }));
            else {
                const startRowIdx = Math.floor(activeElementIdx / columns), startColIdx = activeElementIdx % columns;

                setSelection({ startRowIdx: startRowIdx, startColIdx: startColIdx, endRowIdx: newRowIdx, endColIdx: newColIdx });
            }
        } else reset();
    }

    function handleMouseDown(e: MouseEvent<HTMLTableSectionElement>) {
        const { rowIdx, colIdx } = (e.target as HTMLElement).dataset;
        if (rowIdx === undefined || colIdx === undefined) return;

        const r = Number(rowIdx), c = Number(colIdx);
        setSelection({ startRowIdx: r, startColIdx: c, endRowIdx: r, endColIdx: c });
    }

    function handleMouseMove(e: MouseEvent<HTMLTableSectionElement>) {
        if (!selection) return;

        const { rowIdx, colIdx } = (e.target as HTMLElement).dataset;
        if (rowIdx === undefined || colIdx === undefined) return;

        const r = Number(rowIdx), c = Number(colIdx);
        if (r === selection.endRowIdx && c === selection.endColIdx) return;

        setSelection(prev => ({ ...prev, endRowIdx: r, endColIdx: c }));
    }

    function reset() {
        setSelection(null);
    }

    function isSelected(rowIdx, colIdx) {
        if (!boundary) return false;

        return rowIdx >= boundary.minRow && colIdx >= boundary.minCol && rowIdx <= boundary.maxRow && colIdx <= boundary.maxCol;
    }

    return (
        <main className="flex flex-col items-center min-h-screen bg-gray-50 select-none">
            <header className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-gray-900">Area Selector</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Click and drag to create a selection box over the grid items.
                </p>
            </header>

            <div className='sr-only' aria-live='polite'>
                {boundary
                    ? `Selected area from Row ${boundary.minRow + 1}, Column ${boundary.minCol + 1} to Row ${boundary.maxRow + 1}, Column ${boundary.maxCol + 1}`
                    : ''}
            </div>

            <section
                role='list'
                className={`w-fit grid border-1 box-border`}
                style={{
                    gridTemplateColumns: `repeat(${columns},1fr)`,
                    gridTemplateRows: `repeat(${rows},1fr)`,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={reset}
                onMouseLeave={reset}
                onKeyDown={handleKeyDown}
            >
                {
                    Array.from({ length: rows }, (_, rowIdx) => (
                        Array.from({ length: columns }, (_, colIdx) => (
                            <MemoisedCell
                                key={`${rowIdx}_${colIdx}`}
                                rowIdx={rowIdx} colIdx={colIdx}
                                isSelected={isSelected(rowIdx, colIdx)}
                            />
                        ))
                    ))
                }
            </section>
        </main>
    );
}
