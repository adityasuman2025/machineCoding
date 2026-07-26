import { useEffect } from "react";
import Cell from "./Cell";
import { sheetData } from "./sheetStore";;
import { getSheetDataAPI } from "./apis";
import { ROWS, COLS, SHEET_ID } from "./constants";
import "./index.scoped.css";

export default function App() {
    useEffect(() => {
        (async () => {
            const resp = await getSheetDataAPI(SHEET_ID);
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