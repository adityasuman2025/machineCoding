import { memo, useCallback, useMemo, useSyncExternalStore } from "react";
import Cell from "./Cell";
import { ROWS, COLS, sheetData } from "./sheetStore";;


export default function App() {
    return (
        <section className="grid">
            {
                ROWS.map((_, rowIdx) => {
                    return COLS.map((_, colIdx) => {
                        return (
                            <Cell key={colIdx + "_" + rowIdx} rowIdx={rowIdx} colIdx={colIdx} />
                        )
                    })
                })
            }
        </section>
    )
}