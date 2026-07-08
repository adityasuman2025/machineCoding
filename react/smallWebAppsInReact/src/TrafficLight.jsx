import { useState, useEffect } from "react";

const UPDATE_SEQ = [
    {
        color: "green",
        duration: 4000,
    },
    {
        color: "yellow",
        duration: 500,
    },
    {
        color: "red",
        duration: 3000,
    },
];
const LAYOUT_ORDER = ["red", "yellow", "green"];
export default function TrafficLight() {
    const [activeColorIdx, setActiveColorIdx] = useState(0);

    useEffect(() => {
        const { duration } = UPDATE_SEQ[activeColorIdx];
        const timer = setTimeout(() => {
            setActiveColorIdx((prev) => (prev + 1) % UPDATE_SEQ.length);
        }, duration);

        return () => clearTimeout(timer);
    }, [activeColorIdx]);

    const activeColor = UPDATE_SEQ[activeColorIdx].color;
    return (
        <ul>
            {LAYOUT_ORDER.map(color => (
                <li
                    key={color}
                    className={
                        "light " + (activeColor === color ? color : "")
                    }
                ></li>
            ))}
        </ul>
    );
}
