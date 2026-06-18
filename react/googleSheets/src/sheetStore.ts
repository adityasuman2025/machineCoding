import { computeCell, parseFormula, convertRefToCoordinateKey, SheetGraph } from "./utils";

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

// Dependency graph tracking cell relationships to manage update paths and prevent circular references
const sheetGraph = new SheetGraph();

const listeners = new Set<() => void>();
export const sheetData = {
    getComputed(rowIdx, colIdx) {
        return state.sheetData?.[rowIdx]?.[colIdx]?.computed || "";
    },
    getRaw(rowIdx, colIdx) {
        return state.sheetData?.[rowIdx]?.[colIdx]?.raw || "";
    },
    set: function (rowIdx, colIdx, rawVal) {
        /**
         * Main write method called when a cell is updated.
         * FLOW:
         * 1. Get coordinate key (e.g., "0_1") for the target cell.
         * 2. Parse out dependencies (e.g., `=A1+A2` -> ["A1", "A2"] -> ["0_0", "1_0"]).
         * 3. Perform a cycle check on the DAG graph. If a circular reference is found, abort and flag "#REF!".
         * 4. If safe, update the dependency graph (replacing old edges with new ones).
         * 5. Write the raw value into the cell state.
         * 6. Retrieve the topological order of cells that depend on this updated cell.
         * 7. Iterate through the topological order and recompute each cell to propagate the updates.
         * 8. Notify all React component subscribers to update the UI.
        */

        const cellKey = `${rowIdx}_${colIdx}`;

        // Step 1: Extract cell references and map them to coordinate keys (e.g. "A1" -> "0_0")
        const referencedCellsInFormula = parseFormula(rawVal); // [A1]
        const dependencyKeys = referencedCellsInFormula.map(convertRefToCoordinateKey); // "A1" -> "0_0"

        // Step 2: Cycle Detection
        // Prevent circular loops (e.g., A1 = B1 and B1 = A1)
        if (sheetGraph.checkCycle(cellKey, dependencyKeys)) {
            state.sheetData[rowIdx][colIdx] = { raw: rawVal, computed: "#REF!", error: true };
            listeners.forEach(cb => cb());
            return;
        }

        // Step 3: Update DAG edges
        sheetGraph.updateDependencies(cellKey, dependencyKeys);
        state.sheetData[rowIdx][colIdx].raw = rawVal;

        // Step 4: Propagate changes in topological order
        // This guarantees that any cell depending on our updated cell is calculated ONLY after its dependencies have resolved
        const topologicalUpdateOrder = sheetGraph.getTopologicalUpdateOrder(cellKey);
        for (const cellCoordinateKey of topologicalUpdateOrder) {
            const [rowString, colString] = cellCoordinateKey.split("_");
            const targetRowIdx = parseInt(rowString, 10);
            const targetColIdx = parseInt(colString, 10);
            const cell = state.sheetData[targetRowIdx][targetColIdx];

            const { computed, error } = computeCell(cell.raw, state.sheetData);
            state.sheetData[targetRowIdx][targetColIdx] = { ...cell, computed, error };
        }

        listeners.forEach(cb => cb());
    },
    subscribe: (cb) => {
        listeners.add(cb);
        return () => listeners.delete(cb);
    }
};
