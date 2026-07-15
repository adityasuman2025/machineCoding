import { useState, useEffect, useCallback } from "react";
import "./ImageCarousel.scoped.css";

const IMAGES = [
    {
        src: 'https://picsum.photos/id/600/600/400',
        alt: 'Forest',
    },
    {
        src: 'https://picsum.photos/id/100/600/400',
        alt: 'Beach',
    },
    {
        src: 'https://picsum.photos/id/200/600/400',
        alt: 'Yak',
    },
    {
        src: 'https://picsum.photos/id/300/600/400',
        alt: 'Hay',
    },
    {
        src: 'https://picsum.photos/id/400/600/400',
        alt: 'Plants',
    },
    {
        src: 'https://picsum.photos/id/500/600/400',
        alt: 'Building',
    },
];

export default function ImageCarousel({
    images = IMAGES,
}) {
    const total = images?.length || 0;

    const [activeIdx, setActiveIdx] = useState(0);

    if (total === 0) return null;
    return (
        <div className="carousel">
            <div
                className="left"
                onClick={() => setActiveIdx((prev) => (prev - 1 >= 0 ? prev - 1 : total - 1))}
            >
                {"<"}
            </div>

            <div
                className="images"
                style={{
                    transform: "translateX(" + -activeIdx * 100 + "%)",
                }}
            >
                {images.map(({ alt, src }, idx) => (
                    <img key={src} alt={alt} src={src} width="100%" loading="lazy" />
                ))}
            </div>

            <div
                className="right"
                onClick={() =>
                    setActiveIdx((prev) => (prev + 1 < total ? prev + 1 : 0))
                }
            >
                {">"}
            </div>
        </div>
    );
}
