import { memo, useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { sheetData } from "./sheetStore";
import "./index.scoped.css";

interface CellProps {
    rowIdx: number,
    colIdx: number
}
function Cell({ rowIdx, colIdx }: CellProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const getSnapshot = useCallback(() => {
        return sheetData.getComputed(rowIdx, colIdx);
    }, [rowIdx, colIdx]);
    const cellData = useSyncExternalStore(sheetData.subscribe, getSnapshot);
    console.log(rowIdx, colIdx, "Cell Re-rendered", cellData)

    useEffect(() => {
        if (inputRef.current) inputRef.current.value = cellData;
    }, [cellData]); // if cellData changes then updating the input element value

    const setCellValInStore = useCallback(() => {
        const rawVal = inputRef.current ? inputRef.current.value : "";
        sheetData.set(rowIdx, colIdx, rawVal);

        // on blurring input (when focus is removed) then again displaying computed value
        if (inputRef.current) inputRef.current.value = sheetData.getComputed(rowIdx, colIdx);
    }, [rowIdx, colIdx]);

    const handleChange = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputRef.current) inputRef.current.blur(); // blurring will trigger setCellValInStore
    }, []);

    const handleFocus = useCallback(() => {
        if (inputRef.current) inputRef.current.value = sheetData.getRaw(rowIdx, colIdx);
    }, [rowIdx, colIdx]); // if we click/focus on any shell then showing its raw value so that we can see the formula

    return (
        <div data-row-idx={rowIdx} data-col-idx={colIdx} className="cell">
            <input
                ref={inputRef}
                type="text"
                className="input"
                onKeyUp={handleChange}
                onBlur={setCellValInStore}
                onFocus={handleFocus}
            />
        </div>
    )
}

export default memo(Cell);