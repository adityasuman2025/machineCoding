let grid = [
    [1, 1, 1, 1, 0, 1, 1, 0, 0, 1],
    [0, 1, 1, 0, 1],
    [1, 0, 1, 0, 1],
    [0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
];

let activeCells = new Map();

const contentEle = document.getElementById("content");
contentEle.addEventListener("click", handleGridClick);

function renderGrid() {
    const gridEle = document.createElement("div");

    grid.forEach((row, rowIdx) => {
        const gridRow = document.createElement("div");
        gridRow.classList.add("gridRow");

        row.forEach((item, colIdx) => {
            const gridcell = document.createElement("div");
            gridcell.classList.add("gridCell");
            gridcell.dataset.row = rowIdx;
            gridcell.dataset.col = colIdx;
            gridcell.dataset.val = item;

            if (item === 1) gridcell.classList.add("visibleCell");
            if (activeCells.has(rowIdx + "_" + colIdx)) gridcell.classList.add("activeCell");

            gridRow.append(gridcell);
        });

        gridEle.append(gridRow);
    })

    contentEle.innerHTML = gridEle.innerHTML;
}
renderGrid();

function handleGridClick(e) {
    const { row, col, val } = e.target.dataset;

    if (![null, undefined].includes(row) && ![null, undefined].includes(col) && Number(val) === 1) {
        let key = row + "_" + col;
        if (activeCells.has(key)) activeCells.delete(key);
        else activeCells.set(key, 1);

        renderGrid();
    }
}