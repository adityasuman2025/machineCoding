import { memo, useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { sheetData } from "./sheetStore";

interface CellProps {
    rowIdx: number,
    colIdx: number
}
function Cell({ rowIdx, colIdx }: CellProps) {
    const inputRef = useRef(null);

    const getSnapshot = useCallback(() => {
        return sheetData.get(rowIdx, colIdx);
    }, [rowIdx, colIdx]);
    const cellData = useSyncExternalStore(sheetData.subscribe, getSnapshot);
    console.log(rowIdx, colIdx, "cellData", cellData)

    useEffect(() => {
        if (inputRef.current) inputRef.current.value = cellData;
    }, [cellData]);

    const setCellValInStore = useCallback(() => {
        const rawVal = inputRef.current.value;
        sheetData.set(rowIdx, colIdx, rawVal)
    }, [rowIdx, colIdx]);

    const handleChange = useCallback((e) => {
        if (e.key === "Enter") inputRef.current.blur(); // blurring will trigger setCellValInStore
    }, [rowIdx, colIdx]);

    return (
        <div data-row-idx={rowIdx} data-col-idx={colIdx} className="cell">
            <input ref={inputRef} type="text" className="input" onKeyUp={handleChange} onBlur={setCellValInStore} />
        </div>
    )
}

export default memo(Cell);