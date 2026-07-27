import React, { useRef, useEffect, type KeyboardEvent, useState, memo, useMemo } from "react";

/*
    Machine Coding Problem: Snake Game
    Build a classic 2D Snake Game in React that supports:
    1. Grid-based game board (e.g., 20x20 matrix).
    2. Continuous snake movement loop with direction controls (Arrow Keys / WASD).
    3. Random food spawning on non-snake grid cells.
    4. Snake growth on eating food & score tracking.
    5. Collision detection (wall boundaries & self-collision -> Game Over state).
    6. WAI-ARIA accessibility (role="region", role="grid", aria-live announcements for game status).
*/

function useAutoFocus(autoFocus: boolean = false) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (autoFocus) containerRef.current?.focus();
    }, [autoFocus]);

    return containerRef;
}

function useInterval(callback: () => void, delay: number | null) {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay === null) return;

        const interval = setInterval(() => callbackRef.current(), delay);
        return () => clearInterval(interval);
    }, [delay]);
}

function formatPos(rowIdx: string | number, colIdx: string | number) {
    return `${rowIdx}_${colIdx}`
}

function getInitialSnakePos(boardSize: number) {
    const mid = Math.floor(boardSize / 2);
    return formatPos(mid, mid);
}

function getRandomIdx(start: number, end: number) {
    return Math.floor(Math.random() * (end - start) + start);
}

function getFoodPos(boardSize: number, deniedPos: string[]) {
    let pos = formatPos(getRandomIdx(0, boardSize), getRandomIdx(0, boardSize));

    // food should not appear on the snake
    while (deniedPos.includes(pos)) pos = formatPos(getRandomIdx(0, boardSize), getRandomIdx(0, boardSize));

    return pos;
}

function checkCollision(rowIdx: number, colIdx: number, boardSize: number, snake: string[]) {
    if (rowIdx < 0 || colIdx < 0) return true;
    if (rowIdx >= boardSize || colIdx >= boardSize) return true;
    if (snake.includes(formatPos(rowIdx, colIdx))) return true;

    return false;
}

function GridCell({ rowIdx, colIdx, isSnakeCell, isFoodCell }) {
    console.log("GridCell re-render:", rowIdx, colIdx);

    return (
        <div

            data-row-id={rowIdx} data-col-id={colIdx}
            role="gridcell"
            className={`
                w-5 h-5 
                ${isSnakeCell ? "bg-purple-600" : isFoodCell ? "bg-emerald-500" : "bg-gray-900"}
            `}
        />
    )
}
const MemoisedGridCell = memo(GridCell);

const DRCTN = {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right",
} as const;
type directionType = typeof DRCTN[keyof typeof DRCTN];

interface SnakeGameProps {
    boardSize?: number;
    autoFocus?: boolean;
}
export default function SnakeGame({
    boardSize = 40,
    autoFocus = true,
}: SnakeGameProps) {
    const containerRef = useAutoFocus(autoFocus);

    const prevDirection = useRef<directionType>(null);
    const direction = useRef<directionType>(null);

    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isOver, setIsOver] = useState<boolean>(false);

    const [snake, setSnake] = useState<string[]>([getInitialSnakePos(boardSize)]);
    const [foodPos, setFoodPos] = useState<string>(getFoodPos(boardSize, snake));
    const snakeSet = useMemo(() => new Set(snake), [snake]);

    useInterval(moveSnake, isRunning ? 200 : null);

    function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        const key = e.key;
        if (isOver) return;

        if (key === "ArrowUp" || key === "w" || key === "W") changeDrctn(e, DRCTN.UP)
        else if (key === "ArrowDown" || key === "s" || key === "S") changeDrctn(e, DRCTN.DOWN)
        else if (key === "ArrowLeft" || key === "a" || key === "A") changeDrctn(e, DRCTN.LEFT)
        else if (key === "ArrowRight" || key === "d" || key === "D") changeDrctn(e, DRCTN.RIGHT)
    }

    function changeDrctn(e: KeyboardEvent<HTMLDivElement>, drctn: directionType) {
        e.preventDefault();

        if (prevDirection.current === DRCTN.DOWN && drctn === DRCTN.UP) return;
        else if (prevDirection.current === DRCTN.UP && drctn === DRCTN.DOWN) return;
        else if (prevDirection.current === DRCTN.LEFT && drctn === DRCTN.RIGHT) return;
        else if (prevDirection.current === DRCTN.RIGHT && drctn === DRCTN.LEFT) return;

        direction.current = drctn;
        setIsRunning(true);
    }

    function moveSnake() {
        const drctn = direction.current;
        if (!drctn) return;

        const headPos = snake[0].split("_");
        let rowIdx = Number(headPos[0]), colIdx = Number(headPos[1]);
        if (drctn === DRCTN.UP) rowIdx--;
        else if (drctn === DRCTN.DOWN) rowIdx++;
        else if (drctn === DRCTN.LEFT) colIdx--;
        else if (drctn === DRCTN.RIGHT) colIdx++;

        const newHead = formatPos(rowIdx, colIdx);
        if (checkCollision(rowIdx, colIdx, boardSize, snake)) {
            setIsOver(true);
            setIsRunning(false);
            return;
        }

        if (newHead === foodPos) {
            const newSnake = [newHead, ...snake]
            setSnake(newSnake);
            setFoodPos(getFoodPos(boardSize, newSnake));
        } else {
            setSnake([newHead, ...snake.slice(0, -1)]);
        }

        prevDirection.current = drctn;
    }

    return (
        <main className="flex flex-col items-center justify-center min-h-screen">
            <header className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-gray-900">Snake Game</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Use Arrow Keys or WASD to navigate the snake.
                </p>
            </header>

            <div className="sr-only" aria-live="polite" aria-atomic="true">current food position is at row {foodPos.split("_")[0]} and column {foodPos.split("_")[1]}</div>

            <div
                ref={containerRef}
                className="grid"
                role="grid" aria-label="snake game component"
                tabIndex={0}
                style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)`, gridTemplateRows: `repeat(${boardSize}, 1fr)` }}
                onKeyDown={handleKeyDown}
            >
                {
                    Array.from({ length: boardSize }, (_, rowIdx) => (
                        Array.from({ length: boardSize }, (_, colIdx) => {
                            const pos = formatPos(rowIdx, colIdx);
                            return (
                                <MemoisedGridCell
                                    key={pos}
                                    rowIdx={rowIdx}
                                    colIdx={colIdx}
                                    isSnakeCell={snakeSet.has(pos)}
                                    isFoodCell={foodPos === pos}
                                />
                            )
                        })
                    ))
                }
            </div>

            {
                isOver ? <div role="alert" aria-live="polite" className="text-red-700 text-lg font-bold my-4">Game Over</div> : null
            }
        </main>
    );
}
