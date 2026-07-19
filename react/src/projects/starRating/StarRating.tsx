import "./StarRating.scoped.css";

interface StarRatingProps {
    maxStars?: number;
    onChange?: (rating: number) => void;
}

export default function StarRating({
    maxStars = 5,
    onChange
}: StarRatingProps) {
    return (
        <div>
            StarRating
        </div>
    );
}
