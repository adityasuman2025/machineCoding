const winningPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

const turnEle = document.getElementById("turn");
const winTextEle = document.getElementById("winText");
const resetBtnEle = document.getElementById("resetBtn");
const boxesEle = document.getElementById("boxes");
boxesEle.addEventListener("click", handleBoxesClick);
resetBtnEle.addEventListener("click", handleResetClick);

let turn = "x", game = ["", "", "", "", "", "", "", ""];

function handleBoxesClick({ target } = {}) {
    const { id } = target.dataset || {};

    if (id) {
        if (!game[id]) {
            game[id] = turn;
            renderBox();

            const winner = checkWinner();
            if (winner) {
                handleWinner(winner, winner === "draw");
                return;
            }

            turn = turn === "x" ? "o" : "x";
            renderTurn();
        }
    }
}

function checkWinner() {
    for (let i = 0; i < winningPatterns.length; i++) {
        const [x, y, z] = winningPatterns[i];
        if (game[x] && (game[x] === game[y]) && (game[y] === game[z])) return game[x];
    }

    if (!game.includes("")) return "draw";

    return false;
}

function handleWinner(winner, isDraw) {
    if (isDraw) winTextEle.innerText = `its a draw`;
    else winTextEle.innerText = `${winner} wins`;
    boxesEle.removeEventListener("click", handleBoxesClick);
}

function renderBox() {
    let boxEle;
    for (let i = 0; i < 9; i++) {
        boxEle = document.getElementById("box_" + i);
        boxEle.innerHTML = game[i] || ""
    }
}

function renderTurn() {
    turnEle.innerText = `${turn} turn`;
}
renderTurn();

function handleResetClick() {
    turn = "x"; //reset turn
    for (let i = 0; i < game.length; i++) game[i] = ""; //reset game data
    winTextEle.innerText = ``; //reset winner

    renderBox();
    renderTurn();

    boxesEle.addEventListener("click", handleBoxesClick);
}