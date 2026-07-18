import { useState, useEffect, useRef } from "react";

function pad(num: number) {
    return String(num).padStart(2, "0");
}

export default function Clock() {
    const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

    const [currTimestamp, setCurrTimestamp] = useState(Date.now());

    useEffect(() => {
        clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setCurrTimestamp(Date.now());
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, []);

    // these variables are all primitives and also they are not passed to any react children component
    // therefore there is no need to create stable reference for them using useMemo
    const date = new Date(currTimestamp);
    const hour = date.getHours();
    const mins = date.getMinutes();
    const sec = date.getSeconds();

    return (
        <div>
            <span>{pad(hour)}</span>:<span>{pad(mins)}</span>:<span>{pad(sec)}</span>
        </div>
    );
}
