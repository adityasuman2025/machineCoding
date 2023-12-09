const DIMN = 30;
const ARROW_UP = "ArrowUp", ARROW_DOWN = "ArrowDown", ARROW_LEFT = "ArrowLeft", ARROW_RIGHT = "ArrowRight";
const KEYS = [ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT];


let score = 1;
let snakeMovementInterval;
let snakeMovementDrctn, snakeCurrPosI = DIMN / 2, snakeCurrPosJ = DIMN / 2;
let snakeBody = [[snakeCurrPosI, snakeCurrPosJ]]; // first element (0th index) - tail , last element (len-1 index) - head

const randomFoodPos = getRandomFoodPosition();
let foodCurrPosI = randomFoodPos[0], foodCurrPosJ = randomFoodPos[1];


const scoreEle = document.getElementById("score");
const boardEle = document.getElementById("board");
const playAgainBtnEle = document.getElementById("playAgainBtn");
document.addEventListener("keyup", handleBoardTyped);
playAgainBtnEle.addEventListener("click", handlePlayAgainClick);


function handleBoardTyped(e) {
    const key = e.key;
    if (KEYS.includes(key)) {
        /*----- snake can't change its direction abruptly upside down ------*/
        if (key === ARROW_UP && snakeMovementDrctn === ARROW_DOWN) return;
        if (key === ARROW_DOWN && snakeMovementDrctn === ARROW_UP) return;
        if (key === ARROW_LEFT && snakeMovementDrctn === ARROW_RIGHT) return;
        if (key === ARROW_RIGHT && snakeMovementDrctn === ARROW_LEFT) return;
        /*----- snake can't change its direction abruptly upside down ------*/

        snakeMovementDrctn = key;

        if (!snakeMovementInterval) startSnakeMovement(); // if snake is not already moving then start movement
    }
}

function startSnakeMovement() {
    snakeMovementInterval = setInterval(() => {
        switch (snakeMovementDrctn) {
            case ARROW_UP: {
                if (snakeCurrPosI - 1 >= 0) snakeCurrPosI--;
                else return handleSnakeDied(); // snake hit the boundary, hence died/game over

                break;
            }
            case ARROW_DOWN: {
                if (snakeCurrPosI + 1 < DIMN) snakeCurrPosI++;
                else return handleSnakeDied(); // snake hit the boundary, hence died/game over

                break;
            }
            case ARROW_LEFT: {
                if (snakeCurrPosJ - 1 >= 0) snakeCurrPosJ--;
                else return handleSnakeDied(); // snake hit the boundary, hence died/game over

                break;
            }
            case ARROW_RIGHT: {
                if (snakeCurrPosJ + 1 < DIMN) snakeCurrPosJ++;
                else return handleSnakeDied(); // snake hit the boundary, hence died/game over

                break;
            }
        }

        // checking if snake collided with itself
        for (let k = 0; k < snakeBody.length; k++) {
            if (snakeCurrPosI === snakeBody[k][0] && snakeCurrPosJ === snakeBody[k][1]) return handleSnakeDied();
        }
        // checking if snake collided with itself

        snakeBody.push([snakeCurrPosI, snakeCurrPosJ]); // after snake's movement, pushing that cell to snake body // it will become snake's new head

        // snake collided with food
        if ((foodCurrPosI === snakeCurrPosI) && (foodCurrPosJ === snakeCurrPosJ)) {
            renderScore(++score); // increasing and rendering the updated score

            // putting food at a new position, as snake ate food at current position
            const randomFoodPos = getRandomFoodPosition();
            foodCurrPosI = randomFoodPos[0], foodCurrPosJ = randomFoodPos[1];

            // if snake collided with food then its size will increase so not removing snake's tail, first element (0th index) of snake's body array
        } else {
            snakeBody.shift(); // otherwise removing tail as the snake has moved one step forward
        }

        renderBoard();
    }, 200);
}

function handleSnakeDied() {
    boardEle.remove();
    scoreEle.innerText = `Game Over \nYour Final Score: ${score}`;

    playAgainBtnEle.style.display = "block";

    clearInterval(snakeMovementInterval);
}

function getRandomFoodPosition() {
    let i = Math.floor(Math.random() * (DIMN - 0 + 1)) + 0;
    let j = Math.floor(Math.random() * (DIMN - 0 + 1)) + 0;

    while ((i === snakeCurrPosI) && (j === snakeCurrPosJ)) { // food can't be at snake's position
        i = Math.floor(Math.random() * (DIMN - 0 + 1)) + 0;
        j = Math.floor(Math.random() * (DIMN - 0 + 1)) + 0;
    }

    return [i, j];
}

function handlePlayAgainClick() {
    window.location.reload();
}

renderBoard();
function renderBoard() {
    const tempEle = document.createElement("div");

    for (let i = 0; i < DIMN; i++) {
        const rowEle = document.createElement("div");
        rowEle.classList.add("row");

        for (let j = 0; j < DIMN; j++) {
            const cellEle = document.createElement("div");
            cellEle.classList.add("cell");

            // snake cells
            for (let k = 0; k < snakeBody.length; k++) {
                if (i === snakeBody[k][0] && j === snakeBody[k][1]) cellEle.classList.add("snake");
            }
            // snake cells

            if (i === foodCurrPosI && j === foodCurrPosJ) cellEle.classList.add("food"); // food cell

            rowEle.append(cellEle);
        }

        tempEle.append(rowEle);
    }

    boardEle.innerHTML = tempEle.innerHTML;
}

renderScore(score);
function renderScore(score) {
    scoreEle.innerText = `Score: ${score}`;
}