import { useState, useEffect } from "react";
import "./TrafficLight.scoped.css";

type TrafficColor = string;

interface UpdateSeqItem {
    color: TrafficColor;
    duration: number;
}

const DEFAULT_UPDATE_SEQ: UpdateSeqItem[] = [
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

const DEFAULT_LAYOUT_ORDER: TrafficColor[] = ["red", "yellow", "green"];

interface TrafficLightProps {
    sequence?: UpdateSeqItem[];
    layout?: TrafficColor[];
}
export default function TrafficLight({
    sequence = DEFAULT_UPDATE_SEQ,
    layout = DEFAULT_LAYOUT_ORDER,
}: TrafficLightProps) {
    const [activeColorIdx, setActiveColorIdx] = useState(0);

    useEffect(() => {
        if (sequence.length === 0) return;
        const { duration } = sequence[activeColorIdx] || {};
        const timer = setTimeout(() => {
            setActiveColorIdx((prev) => (prev + 1) % sequence.length);
        }, duration);

        return () => clearTimeout(timer);
    }, [activeColorIdx, sequence]);

    const activeColor = sequence[activeColorIdx]?.color;
    return (
        <ul>
            {layout.map(color => (
                <li
                    key={color}
                    className={`light ${activeColor === color ? color : ""}`}
                ></li>
            ))}
        </ul>
    );
}
