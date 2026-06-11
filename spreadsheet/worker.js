/**
 * worker.js - Background Calculation Engine.
 * 
 * Responsibilities:
 * 1. Maintain in-memory raw/computed values.
 * 2. Parse range/cell dependencies using clean regular expressions.
 * 3. Perform DFS cycle detection to block circular reference loops.
 * 4. Perform Topological Sorting for re-evaluating dependents in correct order.
 * 5. Compute formulas using string replacement and safe arithmetic evaluation.
 */

const cells = {};              // cellId -> { raw: "", computed: "", error: null }
const directDependencies = {}; // cellId -> Set(dependencyCellIds)
const edges = {};              // cellId -> Set(dependentCellIds)

// ============================================================================
// 1. Coordinate Conversions & Range Helpers
// ============================================================================

function parseCellId(cellId) {
    const match = cellId.match(/^([A-Z]+)([0-9]+)$/i);
    if (!match) return null;
    const colStr = match[1].toUpperCase();
    const row = parseInt(match[2], 10) - 1;
    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
        col = col * 26 + (colStr.charCodeAt(i) - 64);
    }
    return { col: col - 1, row };
}

function getLabelFromCoords(col, row) {
    let temp = col + 1;
    let letter = '';
    while (temp > 0) {
        let m = (temp - 1) % 26;
        letter = String.fromCharCode(65 + m) + letter;
        temp = Math.floor((temp - m) / 26);
    }
    return `${letter}${row + 1}`;
}

function expandRange(rangeStr) {
    const [start, end] = rangeStr.split(':');
    const startCoords = parseCellId(start);
    const endCoords = parseCellId(end);
    if (!startCoords || !endCoords) return [];

    const colStart = Math.min(startCoords.col, endCoords.col);
    const colEnd = Math.max(startCoords.col, endCoords.col);
    const rowStart = Math.min(startCoords.row, endCoords.row);
    const rowEnd = Math.max(startCoords.row, endCoords.row);

    const list = [];
    for (let c = colStart; c <= colEnd; c++) {
        for (let r = rowStart; r <= rowEnd; r++) {
            list.push(getLabelFromCoords(c, r));
        }
    }
    return list;
}

// ============================================================================
// 2. Dependency Extraction
// ============================================================================

function parseDependencies(formula) {
    if (!formula.startsWith('=')) return [];
    const expr = formula.substring(1).toUpperCase();
    const cellsSet = new Set();

    // 1. Extract and expand range references (e.g. A1:B3)
    const rangeRegex = /[A-Z]+[0-9]+:[A-Z]+[0-9]+/g;
    const ranges = expr.match(rangeRegex) || [];
    for (const r of ranges) {
        expandRange(r).forEach(c => cellsSet.add(c));
    }

    // 2. Extract single cell references (excluding ranges already processed)
    const cellRegex = /[A-Z]+[0-9]+/g;
    const strippedExpr = expr.replace(rangeRegex, '');
    const cellRefs = strippedExpr.match(cellRegex) || [];
    for (const ref of cellRefs) {
        cellsSet.add(ref);
    }

    return [...cellsSet];
}

// ============================================================================
// 3. Graph Traversal (DFS Cycle Check & Topological Sort)
// ============================================================================

function checkCycle(sourceCellId, dependencies) {
    const visited = new Set();

    function dfs(currCellId) {
        if (currCellId === sourceCellId) return true;
        if (visited.has(currCellId)) return false;

        visited.add(currCellId);
        const dependents = edges[currCellId] || [];
        for (const dep of dependents) {
            if (dfs(dep)) return true;
        }
        return false;
    }

    for (const dep of dependencies) {
        if (dfs(dep)) return true;
    }
    return false;
}

function getTopologicalOrder(startCellId) {
    const visited = new Set();
    const order = [];

    function visit(node) {
        if (!visited.has(node)) {
            visited.add(node);
            const dependents = edges[node] || [];
            for (const dep of dependents) visit(dep);
            order.push(node);
        }
    }

    visit(startCellId);
    return order.reverse();
}

// ============================================================================
// 4. Formula Evaluation
// ============================================================================

function evaluateFormula(formula) {
    let expr = formula.substring(1).toUpperCase();

    // 1. Resolve Range Functions: SUM and AVERAGE
    const rangeFuncRegex = /(SUM|AVERAGE)\(([A-Z]+[0-9]+:[A-Z]+[0-9]+)\)/g;
    expr = expr.replace(rangeFuncRegex, (match, func, rangeStr) => {
        const vals = expandRange(rangeStr).map(c => {
            const val = cells[c]?.computed;
            const num = parseFloat(val);
            return isNaN(num) ? 0 : num;
        });

        if (func === 'SUM') return vals.reduce((sum, v) => sum + v, 0);
        if (func === 'AVERAGE') return vals.length === 0 ? 0 : vals.reduce((sum, v) => sum + v, 0) / vals.length;
        return 0;
    });

    // 2. Resolve Single Cell References
    const cellRefs = expr.match(/[A-Z]+[0-9]+/g) || [];
    // Sort descending by length to handle references like A10 before A1 correctly
    cellRefs.sort((a, b) => b.length - a.length);
    for (const ref of cellRefs) {
        const val = cells[ref]?.computed;
        const num = parseFloat(val);
        const replacement = isNaN(num) ? 0 : num;
        expr = expr.replaceAll(ref, replacement);
    }

    // 3. Mathematical Evaluation
    try {
        const safeExpr = expr.replace(/[^0-9+\-*/().\s]/g, '');
        const result = new Function(`return (${safeExpr})`)();
        return result === undefined ? '' : result;
    } catch (e) {
        return '#VALUE!';
    }
}

// ============================================================================
// 5. Worker Message Handlers
// ============================================================================

self.onmessage = function(e) {
    const { type, payload } = e.data;

    if (type === 'editCell') {
        const { cellId, rawValue } = payload;

        // Remove old dependency edges
        const oldDeps = directDependencies[cellId] || [];
        for (const dep of oldDeps) {
            if (edges[dep]) edges[dep] = edges[dep].filter(id => id !== cellId);
        }

        cells[cellId] = cells[cellId] || { raw: '', computed: '', error: null };
        cells[cellId].raw = rawValue;

        const updates = [];
        const newDeps = parseDependencies(rawValue);

        if (rawValue.startsWith('=') && checkCycle(cellId, newDeps)) {
            // Circular Reference detected
            cells[cellId].computed = '#REF!';
            cells[cellId].error = '#REF!';
            directDependencies[cellId] = [];

            const evalOrder = getTopologicalOrder(cellId);
            for (const evalCellId of evalOrder) {
                if (evalCellId !== cellId) {
                    cells[evalCellId].computed = '#REF!';
                    cells[evalCellId].error = '#REF!';
                }
                updates.push({
                    cellId: evalCellId,
                    computed: cells[evalCellId].computed,
                    error: cells[evalCellId].error
                });
            }
        } else {
            // Valid formula / value
            directDependencies[cellId] = newDeps;
            for (const dep of newDeps) {
                edges[dep] = edges[dep] || [];
                edges[dep].push(cellId);
            }
            cells[cellId].error = null;

            const evalOrder = getTopologicalOrder(cellId);
            for (const evalCellId of evalOrder) {
                const cell = cells[evalCellId];
                if (cell.error === '#REF!') {
                    // Keep loop error state
                } else if (!cell.raw.startsWith('=')) {
                    const num = parseFloat(cell.raw);
                    cell.computed = isNaN(num) ? cell.raw : num;
                } else {
                    cell.computed = evaluateFormula(cell.raw);
                }
                updates.push({
                    cellId: evalCellId,
                    computed: cell.computed,
                    error: cell.error
                });
            }
        }

        self.postMessage({ type: 'cellUpdates', payload: { updates } });
    }

    else if (type === 'resetGrid') {
        for (const id of Object.keys(cells)) delete cells[id];
        for (const id of Object.keys(directDependencies)) delete directDependencies[id];
        for (const id of Object.keys(edges)) delete edges[id];
        self.postMessage({ type: 'cellUpdates', payload: { updates: [] } });
    }
};
