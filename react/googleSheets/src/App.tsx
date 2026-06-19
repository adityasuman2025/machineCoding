import { useEffect } from "react";
import Cell from "./Cell";
import { sheetData } from "./sheetStore";;
import { getSheetData } from "./apis";
import { ROWS, COLS, SHEET_ID } from "./constants";

export default function App() {
    useEffect(() => {
        (async () => {
            const resp = await getSheetData(SHEET_ID);
            sheetData.setState(resp);
        })();
    }, []);

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