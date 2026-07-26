import { useState, useEffect, useRef, memo, useCallback, useMemo } from "react";
import "./ProgressBar.scoped.css";

const DEFAULT_STEP = 1;

interface PBarProps {
    step?: number,
    onComplete?: () => void
}
function PBar({ step = DEFAULT_STEP, onComplete }: PBarProps) {
    const widthRef = useRef<number>(0);
    const barRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let rafId: ReturnType<typeof requestAnimationFrame>;

        function tick() {
            if (widthRef.current >= 100) {
                onComplete?.();
                return;
            }

            widthRef.current += step;
            if (barRef.current) barRef.current.style.transform = "scaleX(" + (widthRef.current / 100) + ")";

            rafId = requestAnimationFrame(tick);
        }
        rafId = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(rafId);
    }, [step]);

    return (
        <div className="progress">
            <div className="bar" ref={barRef} />
        </div>
    )
}
const MemoisedPBar = memo(PBar);

export default function ProgressBar() {
    const [count, setCount] = useState(1);

    const handleComplete = useCallback(() => {
        setCount(prev => prev + 1);
    }, []);

    return (
        <div>
            {
                new Array(count).fill("").map((_, idx) => (
                    <MemoisedPBar
                        key={idx}
                        step={Math.min(idx + 1, 5)}
                        onComplete={handleComplete}
                    />
                ))
            }
        </div>
    )
}