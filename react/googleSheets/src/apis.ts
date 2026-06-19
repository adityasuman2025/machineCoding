import { type CellData, type SheetData } from "./constants";

export function getSheetDataAPI(sheetId: string): Promise<SheetData> {
    return new Promise((resolve) => {
        const resp = JSON.parse(localStorage.getItem(sheetId) || "{}");
        setTimeout(() => resolve(resp), 100);
    });
}

export function updateSheetDataAPI(sheetId: string, rowIdx: number, colIdx: number, cellData: CellData) {
    return new Promise((resolve) => {
        const sheetData = JSON.parse(localStorage.getItem(sheetId) || "{}");
        if (!sheetData[rowIdx]) sheetData[rowIdx] = {};
        sheetData[rowIdx][colIdx] = cellData;

        localStorage.setItem(sheetId, JSON.stringify(sheetData));

        setTimeout(() => resolve(true), 100);
    });
}