/**
 * engine.js - Streamlined Client-Side Spreadsheet UI Controller.
 * 
 * Separation of Concerns:
 * 1. Cache & Config initialization
 * 2. Grid Generation (Column A-Z, Row 1-100)
 * 3. Cell Selection & Focus Highlighting
 * 4. Inline Text Editors (Textarea double-clicks)
 * 5. Keyboard Navigation & Resets
 * 6. Worker Gateways & Point-Targeted DOM Patches
 */

const COLUMNS = 26; // A to Z
const ROWS = 100;    // 1 to 100

let selectedCellId = 'A1';
let isEditing = false;
let worker = null;

const localCells = {}; // Local cached states: cellId -> { raw, computed }

document.addEventListener('DOMContentLoaded', () => {
    initGrid();
    initWorker();
    initEvents();
});

// ============================================================================
// 1. Grid Generation
// ============================================================================
function initGrid() {
    const table = document.getElementById('spreadsheet-table');
    table.innerHTML = '';

    // Create column label header row
    const headerRow = document.createElement('tr');
    const cornerHeader = document.createElement('th');
    cornerHeader.className = 'grid-header corner-header';
    headerRow.appendChild(cornerHeader);

    for (let c = 0; c < COLUMNS; c++) {
        const th = document.createElement('th');
        th.className = 'grid-header col-header';
        th.id = `header-col-${getColLetter(c)}`;
        th.textContent = getColLetter(c);
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    // Create grid cells
    for (let r = 0; r < ROWS; r++) {
        const row = document.createElement('tr');

        // Row Index header
        const rowHeader = document.createElement('th');
        rowHeader.className = 'grid-header row-header';
        rowHeader.id = `header-row-${r + 1}`;
        rowHeader.textContent = r + 1;
        row.appendChild(rowHeader);

        for (let c = 0; c < COLUMNS; c++) {
            const cellId = `${getColLetter(c)}${r + 1}`;
            const td = document.createElement('td');
            td.className = 'grid-cell';
            td.id = `cell-${cellId}`;
            td.dataset.cellId = cellId;
            td.dataset.col = getColLetter(c);
            td.dataset.row = r + 1;

            localCells[cellId] = { raw: '', computed: '' };

            row.appendChild(td);
        }
        table.appendChild(row);
    }

    selectCell('A1');
}

function getColLetter(colIndex) {
    return String.fromCharCode(65 + colIndex);
}

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

// ============================================================================
// 2. Cell Selection
// ============================================================================
function selectCell(cellId) {
    if (isEditing && cellId !== selectedCellId) {
        commitCellEdit();
    }

    const prevCell = document.getElementById(`cell-${selectedCellId}`);
    if (prevCell) {
        prevCell.classList.remove('selected');
        document.getElementById(`header-col-${prevCell.dataset.col}`)?.classList.remove('col-active');
        document.getElementById(`header-row-${prevCell.dataset.row}`)?.classList.remove('row-active');
    }

    selectedCellId = cellId;

    const currCell = document.getElementById(`cell-${selectedCellId}`);
    if (currCell) {
        currCell.classList.add('selected');
        document.getElementById(`header-col-${currCell.dataset.col}`)?.classList.add('col-active');
        document.getElementById(`header-row-${currCell.dataset.row}`)?.classList.add('row-active');
        currCell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    document.getElementById('active-cell-id').textContent = selectedCellId;
    document.getElementById('formula-input').value = localCells[selectedCellId]?.raw || '';
}

// ============================================================================
// 3. Inline Text Editing
// ============================================================================
function enterEditMode() {
    if (isEditing) return;
    const td = document.getElementById(`cell-${selectedCellId}`);
    if (!td) return;

    isEditing = true;
    const editor = document.createElement('textarea');
    editor.className = 'cell-editor';
    editor.value = localCells[selectedCellId]?.raw || '';
    td.appendChild(editor);

    editor.focus();
    editor.select();
    editor.addEventListener('blur', commitCellEdit);
}

function commitCellEdit() {
    if (!isEditing) return;
    const td = document.getElementById(`cell-${selectedCellId}`);
    const editor = td?.querySelector('.cell-editor');
    if (editor) {
        const value = editor.value;
        editor.remove();
        isEditing = false;
        sendCellEdit(selectedCellId, value);
    }
}

function cancelCellEdit() {
    if (!isEditing) return;
    document.getElementById(`cell-${selectedCellId}`)?.querySelector('.cell-editor')?.remove();
    isEditing = false;
}

// ============================================================================
// 4. Keyboard Navigation & Event Listeners
// ============================================================================
function initEvents() {
    const table = document.getElementById('spreadsheet-table');
    const formulaInput = document.getElementById('formula-input');

    table.addEventListener('click', (e) => {
        const cell = e.target.closest('.grid-cell');
        if (cell) selectCell(cell.dataset.cellId);
    });

    table.addEventListener('dblclick', (e) => {
        const cell = e.target.closest('.grid-cell');
        if (cell) {
            selectCell(cell.dataset.cellId);
            enterEditMode();
        }
    });

    formulaInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendCellEdit(selectedCellId, formulaInput.value);
            formulaInput.blur();
            table.focus();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (isEditing) {
            if (e.key === 'Enter') { e.preventDefault(); commitCellEdit(); }
            else if (e.key === 'Escape') cancelCellEdit();
            return;
        }

        if (document.activeElement === formulaInput) return;

        const coords = parseCellId(selectedCellId);
        if (!coords) return;

        let col = coords.col;
        let row = coords.row;
        let moved = false;

        if (e.key === 'ArrowUp') { row = Math.max(0, row - 1); moved = true; e.preventDefault(); }
        else if (e.key === 'ArrowDown') { row = Math.min(ROWS - 1, row + 1); moved = true; e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { col = Math.max(0, col - 1); moved = true; e.preventDefault(); }
        else if (e.key === 'ArrowRight' || e.key === 'Tab') { col = Math.min(COLUMNS - 1, col + 1); moved = true; e.preventDefault(); }
        else if (e.key === 'Enter') { enterEditMode(); e.preventDefault(); }

        if (moved) {
            selectCell(`${getColLetter(col)}${row + 1}`);
        }
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
        worker.postMessage({ type: 'resetGrid' });
        document.querySelectorAll('.grid-cell').forEach(td => {
            td.textContent = '';
            td.classList.remove('cell-error');
        });
        for (const cellId of Object.keys(localCells)) {
            localCells[cellId] = { raw: '', computed: '' };
        }
        selectCell('A1');
    });
}

// ============================================================================
// 5. Worker Gates & DOM Patches
// ============================================================================
function initWorker() {
    worker = new Worker('worker.js');

    worker.onmessage = function(e) {
        const { type, payload } = e.data;
        if (type === 'cellUpdates') {
            const { updates } = payload;

            // Atomic Point-Targeted DOM updates
            for (const update of updates) {
                const { cellId, computed, error } = update;
                localCells[cellId].computed = computed;

                // Point-targeted lookup & patch directly by ID
                const td = document.getElementById(`cell-${cellId}`);
                if (td) {
                    td.textContent = computed;
                    if (error) {
                        td.classList.add('cell-error');
                    } else {
                        td.classList.remove('cell-error');
                    }
                }
            }
        }
    };
}

function sendCellEdit(cellId, rawValue) {
    localCells[cellId].raw = rawValue;
    worker.postMessage({
        type: 'editCell',
        payload: { cellId, rawValue }
    });
}
