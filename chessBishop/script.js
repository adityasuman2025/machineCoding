const chessEle = document.getElementById("chess");

const optimisedChessHoverHandler = debounce(handleChessHover, 200);
chessEle.addEventListener("mousemove", optimisedChessHoverHandler);
renderChess();


function renderChess(activeCellRow, activeCellCol) {
    const cellsFragment = document.createElement("div");

    for (let i = 1; i <= 8; i++) {
        let isWhite = i % 2 !== 0;
        for (let j = 1; j <= 8; j++) {
            let cellEle = document.createElement("div");
            cellEle.classList.add("cell");
            cellEle.dataset.row = i, cellEle.dataset.col = j;

            if (isWhite) cellEle.classList.add("whiteCell");
            isWhite = !isWhite;

            if (Math.abs(i - activeCellRow) === Math.abs(j - activeCellCol)) {  // if that cell is diagonal with the active cell
                cellEle.classList.add("activeCell");
            }

            cellsFragment.append(cellEle);
        }
    }

    chessEle.innerHTML = cellsFragment.innerHTML;
}

function handleChessHover(e) {
    const { row, col } = e.target.dataset;
    if (row && col) renderChess(Number(row), Number(col));
}




// utils
function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.call(this, ...args);
        }, delay);
    }
}
