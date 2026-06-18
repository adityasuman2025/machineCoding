export const ROWS_C: number = 2, COL_C: number = 2;
export const ROWS = new Array(ROWS_C).fill(0);
export const COLS = new Array(COL_C).fill(0);

interface CellData {
    raw: string;
    computed: string;
    error: boolean
}
const emptyCellData: CellData = { raw: "", computed: "", error: false };
const state: { sheetData: CellData[][] } = {
    sheetData: ROWS.map((_ => COLS.map(_ => ({ ...emptyCellData }))))
};

const listeners = new Set<() => void>();

export const sheetData = {
    get(rowIdx, colIdx) {
        return state.sheetData?.[rowIdx]?.[colIdx]?.computed || "";
    },
    set: function (rowIdx, colIdx, rawVal) {
        state.sheetData[rowIdx][colIdx] = {
            ...state.sheetData[rowIdx][colIdx],
            raw: rawVal,
            computed: rawVal,
        }

        listeners.forEach(cb => cb());
    },
    subscribe: (cb) => {
        listeners.add(cb);
        return () => listeners.delete(cb);
    }
};
