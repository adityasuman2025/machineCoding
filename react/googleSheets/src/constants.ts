export const ROWS_C: number = 2, COL_C: number = 2;
export const ROWS = new Array(ROWS_C).fill(0);
export const COLS = new Array(COL_C).fill(0);
export const SHEET_ID = "sheetBittu";

export const EMPTY_CELL_DATA: CellData = { raw: "", computed: "", error: false };
export interface CellData {
    raw: string;
    computed: string;
    error: boolean
}

export interface SheetData { [rowIdx: number]: { [colIdx: number]: CellData } };
