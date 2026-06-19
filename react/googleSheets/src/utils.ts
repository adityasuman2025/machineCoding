import { type SheetData } from "./constants";

export function setObjVal(obj, rowIdx, colIdx, data) {
    if (!obj.hasOwnProperty(rowIdx)) obj[rowIdx] = {}
    if (!obj[rowIdx].hasOwnProperty(colIdx)) obj[rowIdx][colIdx] = {}

    obj[rowIdx][colIdx] = { ...obj[rowIdx][colIdx], ...data };
}

/**
 * Parses and evaluates formula expressions (like "=A1+B2").
 * Supports direct reference copying and basic math calculations.
 */
export function evaluateFormula(rawExpression: string, sheetData: SheetData): string {
    if (!rawExpression.startsWith("=")) return rawExpression;

    const sanitizedFormula = rawExpression.slice(1).toUpperCase().replace(/\s+/g, "");

    // If the formula is exactly a single cell reference (e.g., "=A1"), return its value directly
    if (/^[A-Z]+[0-9]+$/.test(sanitizedFormula)) {
        const columnLetters = sanitizedFormula.match(/[A-Z]+/)?.[0] || "";
        const rowNumber = sanitizedFormula.match(/[0-9]+/)?.[0] || "";
        const columnIndex = columnLetters.charCodeAt(0) - 65; // Convert letter (A-Z) to index (0-25)
        const rowIndex = parseInt(rowNumber, 10) - 1;   // Convert 1-based row string to 0-based index

        const cellRawValue = sheetData[rowIndex]?.[columnIndex]?.computed || "";
        // Recursively evaluate if the referenced cell is also a formula
        return cellRawValue.startsWith("=") ? evaluateFormula(cellRawValue, sheetData) : cellRawValue;
    }

    // Replace cell references (e.g., A1, B2) with their evaluated values for math operations
    const evaluatedExpression = sanitizedFormula.replace(/[A-Z]+[0-9]+/g, (cellReference) => {
        const columnLetters = cellReference.match(/[A-Z]+/)?.[0] || "";
        const rowNumber = cellReference.match(/[0-9]+/)?.[0] || "";

        const columnIndex = columnLetters.charCodeAt(0) - 65; // Converts A -> 0, B -> 1
        const rowIndex = parseInt(rowNumber, 10) - 1;

        const cellRawValue = sheetData[rowIndex]?.[columnIndex]?.computed || "";
        const cellComputedValue = cellRawValue.startsWith("=") ? evaluateFormula(cellRawValue, sheetData) : cellRawValue;
        return cellComputedValue || "0"; // Treat empty/non-existent cell references as 0 inside math equations
    });

    try {
        // Safely evaluate the mathematical expression (+, -, *, /) using "use strict" inside Function
        return Function(`"use strict"; return (${evaluatedExpression})`)().toString();
    } catch {
        return "#ERR!";
    }
}

/**
 * High-level evaluator for a cell's raw content.
 * Resolves simple values immediately and processes formula queries via evaluateFormula.
 */
export function computeCell(rawExpression: string, sheetData: SheetData): { computed: string; error: boolean } {
    if (!rawExpression.startsWith("=")) return { computed: rawExpression, error: false };

    try {
        const computedValue = evaluateFormula(rawExpression, sheetData);
        return { computed: computedValue, error: computedValue === "#ERR!" || computedValue === "#REF!" };
    } catch {
        return { computed: "#ERR!", error: true };
    }
}

/**
 * Extracts unique cell reference names (e.g., "A1", "B2") from a formula string.
 * Named parseFormula to match the component diagram.
 */
export function parseFormula(rawExpression: string): string[] {
    if (!rawExpression.startsWith("=")) return [];
    const sanitizedFormula = rawExpression.slice(1).toUpperCase().replace(/\s+/g, "");
    const cellReferences = sanitizedFormula.match(/[A-Z]+[0-9]+/g) || [];
    return Array.from(new Set(cellReferences)); // Deduplicate references
}

/**
 * Converts a cell reference string (e.g., "B2") to an internal coordinate key string matching the diagram's "rowIdx_colIdx" format.
 */
export function convertRefToCoordinateKey(cellReference: string): string {
    const columnLetters = cellReference.match(/[A-Z]+/)?.[0] || "";
    const rowNumber = cellReference.match(/[0-9]+/)?.[0] || "";
    const columnIndex = columnLetters.charCodeAt(0) - 65;
    const rowIndex = parseInt(rowNumber, 10) - 1;
    return `${rowIndex}_${columnIndex}`;
}

/**
 * Directed Acyclic Graph (DAG) manager.
 * Named SheetGraph to match the Data Model diagram.
 */
export class SheetGraph {
    // Maps a dependency cell key to the set of cells that depend on it (downward/forward edges).
    // E.g., if B1 depends on A1, this contains: "0_0" -> Set(["0_1"])
    // USE: Used to get topological order for forward propagation when a dependency cell changes.
    // PERFORMANCE: Allows finding dependent cells in O(1) time without scanning all grid formulas.
    private dependencyToDependentsMap = new Map<string, Set<string>>();

    // Maps a cell key to the set of cells it depends on (upward/backward edges).
    // E.g., if B1 depends on A1, this contains: "0_1" -> Set(["0_0"])
    // USE: Used for cycle detection DFS and to easily find and delete old dependencies when a formula changes.
    // PERFORMANCE: Avoids searching all sets in the dependencyToDependentsMap, keeping edge cleanup O(1).
    private cellToDependenciesMap = new Map<string, Set<string>>();

    /**
     * Updates dependency edges for a node.
     * Clears previous dependencies of the node and applies new ones.
     */
    updateDependencies(cellKey: string, dependencyKeys: string[]) {
        const previousDependencyKeys = this.cellToDependenciesMap.get(cellKey);
        if (previousDependencyKeys) {
            for (const dependencyKey of previousDependencyKeys) {
                this.dependencyToDependentsMap.get(dependencyKey)?.delete(cellKey);
            }
        }

        const newDependencyKeysSet = new Set(dependencyKeys);
        this.cellToDependenciesMap.set(cellKey, newDependencyKeysSet);

        for (const dependencyKey of dependencyKeys) {
            if (!this.dependencyToDependentsMap.has(dependencyKey)) {
                this.dependencyToDependentsMap.set(dependencyKey, new Set());
            }
            this.dependencyToDependentsMap.get(dependencyKey)!.add(cellKey);
        }
    }

    /**
     * Cycle detection checking if proposed dependencies create circular reference loops.
     */
    checkCycle(cellKey: string, dependencyKeys: string[]): boolean {
        const visited = new Set<string>();

        const dfs = (currentCellKey: string): boolean => {
            if (currentCellKey === cellKey) return true; // Reached target node -> Cycle detected!
            if (visited.has(currentCellKey)) return false;
            visited.add(currentCellKey);

            const currentDependencyKeys = this.cellToDependenciesMap.get(currentCellKey);
            if (currentDependencyKeys) {
                for (const dependencyKey of currentDependencyKeys) {
                    if (dfs(dependencyKey)) return true;
                }
            }
            return false;
        };

        for (const dependencyKey of dependencyKeys) {
            if (dfs(dependencyKey)) return true;
        }

        return false;
    }

    /**
     * Generates a topological sort list of cell updates starting from a seed node.
     */
    getTopologicalUpdateOrder(startCellKey: string): string[] {
        const topologicalOrder: string[] = [];
        const visited = new Set<string>();

        const dfs = (currentCellKey: string) => {
            if (visited.has(currentCellKey)) return;
            visited.add(currentCellKey);

            const dependentCellKeys = this.dependencyToDependentsMap.get(currentCellKey);
            if (dependentCellKeys) {
                for (const dependentCellKey of dependentCellKeys) {
                    dfs(dependentCellKey);
                }
            }
            topologicalOrder.push(currentCellKey); // Record in post-order
        };

        dfs(startCellKey);
        return topologicalOrder.reverse(); // Reverse post-order to get topological sorting
    }
}
