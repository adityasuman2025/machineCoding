import { useState, useCallback, memo, SyntheticEvent } from "react";
import "./DiceRoll.scoped.css";

function getRandomNo(start, end) {
    return Math.floor(Math.random() * (end - start + 1) + start);
}

const DOT_POS: Record<number, number[]> = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
};
const CELLS: string[] = new Array(9).fill("");

function Dice({ num }) {
    const dotPositionsForNum = DOT_POS[num];

    return (
        <div className="dice">
            {
                CELLS.map((_, idx) => (
                    <div key={idx} className={dotPositionsForNum.includes(idx + 1) ? "dot" : "dummy"} />
                ))
            }
        </div>
    );
}
const MemoisedDice = memo(Dice);

export default function DiceRoll() {
    const [dices, setDices] = useState<number[]>([]);

    const handleSubmit = useCallback((e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const count = Number(formData.get("diceCount"));

        setDices(new Array(count).fill("").map(i => getRandomNo(1, 6)));
    }, []);

    return (
        <section className="container">
            <form onSubmit={handleSubmit}>
                <p>Number of dice</p>
                <input name="diceCount" type="number" min={1} max={12} required={true} />
                <button>roll</button>
            </form>

            {dices.length ? (
                <section className="wrapper">
                    {dices.map((num, idx) => <MemoisedDice key={idx} num={num} />)}
                </section>
            ) : null}
        </section>
    );
}
