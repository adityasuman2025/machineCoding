import { useState, memo, useCallback } from "react";

const SIZE = 3,
    X_TURN = "X",
    O_TURN = "O";
const X_WINNER = new Array(SIZE).fill(X_TURN).join("");
const O_WINNER = new Array(SIZE).fill(O_TURN).join("");
const WINNERS = [X_WINNER, O_WINNER];

function getTurn(gridData) {
    const xCount = gridData.flat().filter(i => i === X_TURN).length;
    const oCount = gridData.flat().filter(i => i === O_TURN).length;
    return xCount === oCount ? X_TURN : O_TURN;
}

function checkWinner(gridData) {
    // check rows
    const hasRowWinner = gridData.some((row) => WINNERS.includes(row.join("")));
    if (hasRowWinner) return true;

    // check diagonals and columns
    let diagonal1 = "",
        diagonal2 = "";
    const cols = new Array(SIZE).fill("");
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            const val = gridData[i][j];
            if (i === j) diagonal1 += val;
            if (i + j === SIZE - 1) diagonal2 += val;

            cols[j] = cols[j] + val;
        }
    }

    if (WINNERS.includes(diagonal1) || WINNERS.includes(diagonal2)) return true;
    if (cols.includes(X_WINNER) || cols.includes(O_WINNER)) return true;

    return false;
}

function checkDraw(hasWinner, gridData) {
    if (hasWinner) return false;
    const isBoardFull = gridData.flat().every(i => i !== "");
    return isBoardFull
}

const Cell = memo(function({ rowIdx, colIdx, val, onClick }) {
    // console.log("cell re-render:", rowIdx, colIdx, val);

    const handleClick = useCallback(() => {
        if (!val) onClick(rowIdx, colIdx);
    }, [rowIdx, colIdx, val, onClick]);

    return (
        <div className="tttBox" onClick={handleClick}>
            {val}
        </div>
    );
});

export default function TicTacToe() {
    const [gridData, setGridData] = useState(new Array(SIZE).fill(0).map((_) => new Array(3).fill("")));
    const turn = getTurn(gridData);
    const hasWinner = checkWinner(gridData);
    const isDraw = checkDraw(hasWinner, gridData);

    const handleCellClick = useCallback((rowIdx, colIdx) => {
        setGridData((prev) => {
            if (checkWinner(prev)) return prev;

            const turn = getTurn(prev);
            return prev.map((row, _rowIdx) => _rowIdx === rowIdx ? row.map((oldVal, _colIdx) => _colIdx === colIdx ? turn : oldVal,) : row)
        });
    }, []);

    const handleResetClick = useCallback(() => {
        setGridData(new Array(SIZE).fill(0).map((_) => new Array(3).fill("")));
    }, []);

    return (
        <section>
            <div>
                {
                    hasWinner ? (
                        <>Player {turn === X_TURN ? O_TURN : X_TURN} wins!</>
                    ) : isDraw ? (
                        "Its a draw"
                    ) : <>Player {turn} {hasWinner ? "wins!" : "turn"}</>
                }
            </div>

            <div className="tttGrid">
                {gridData.map((row, rowIdx) =>
                    row.map((col, colIdx) => (
                        <Cell
                            key={rowIdx + "_" + colIdx}
                            rowIdx={rowIdx}
                            colIdx={colIdx}
                            onClick={handleCellClick}
                            val={col}
                        />
                    )),
                )}
            </div>

            <button onClick={handleResetClick}>Reset</button>
        </section>
    );
}
