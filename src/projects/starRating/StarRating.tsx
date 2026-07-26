import { useRef, useState, type MouseEvent, type KeyboardEvent } from "react";
import "./StarRating.scoped.css";

interface StarRatingProps {
    defaultValue?: number;
    disabled?: boolean;
    maxStars?: number;
    onChange?: (rating: number) => void;
}
export default function StarRating({
    defaultValue = 0,
    disabled = false,
    maxStars = 5,
    onChange
}: StarRatingProps) {
    const starRefs = useRef<HTMLElement[]>([]);
    const [rating, setRating] = useState(defaultValue || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const activeRating = hoveredRating > 0 ? hoveredRating : rating;

    function updateRating(_rating: number) {
        setRating(_rating);
        onChange?.(_rating);

        if (starRefs.current[_rating - 1]) starRefs.current[_rating - 1]?.focus()
    }

    function handleRate(e: MouseEvent<HTMLButtonElement>) {
        const _rating = Number(e.currentTarget.dataset.id);
        updateRating(_rating);
    }

    function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
        const key = e.key;

        if (key === "ArrowLeft" || key === "ArrowDown") {
            e.preventDefault();
            updateRating(Math.max(rating - 1, 0));
        } else if (key === "ArrowRight" || key === "ArrowUp") {
            e.preventDefault();
            updateRating(Math.min(rating + 1, maxStars));
        }
    }

    function handleMouseEnter(e: MouseEvent<HTMLElement>) {
        const id = Number(e.currentTarget.dataset.id);
        setHoveredRating(id)
    }

    function handleMouseLeave(e: MouseEvent<HTMLElement>) {
        setHoveredRating(0);
    }

    return (
        <div className="container2">
            <div className="stars" role="radiogroup" aria-label="Star Rating" onMouseLeave={handleMouseLeave} onKeyDown={handleKeyDown}>
                {
                    Array.from({ length: maxStars }, (_, idx) => (
                        <button
                            ref={ref => {
                                if (ref) starRefs.current[idx] = ref;
                            }}
                            key={idx}
                            role="radio"
                            aria-checked={idx + 1 === rating}
                            aria-label={`star ${idx + 1} of ${maxStars} stars`}
                            disabled={disabled}
                            className={`star ${idx + 1 <= activeRating ? "colored" : ""}`}
                            data-id={idx + 1}
                            onClick={handleRate}
                            onMouseEnter={handleMouseEnter}
                            // as we have already implemented arrow key navigation shortcut then tab index is requried only on 1st star or the active star to be focussed on tab click
                            // if we had implemeted arrow key navigation than tabIndex on all stars will be required otherwise user will not be able to move to other stars
                            tabIndex={rating === 0 && idx === 0 ? 0 : idx + 1 === rating ? 0 : -1}
                        >
                            #
                        </button>
                    ))
                }
            </div>
        </div>
    );
}
