import { useState, useCallback, MouseEvent } from "react";
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
const PREV_BTN = "<", NEXT_BTN = ">";

interface ImageItem {
    src: string;
    alt: string;
}
interface ImageCarouselProps {
    images?: ImageItem[];
}
export default function ImageCarousel({ images = IMAGES }: ImageCarouselProps) {
    const [activeIdx, setActiveIdx] = useState(0);
    const total = images?.length || 0;

    const handleButtonClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        const name = e.currentTarget.name;
        if (name === PREV_BTN) setActiveIdx((prev) => (prev - 1 >= 0 ? prev - 1 : total - 1))
        else if (name === NEXT_BTN) setActiveIdx((prev) => (prev + 1 < total ? prev + 1 : 0))
    }, [total])

    if (total === 0) return null;
    return (
        <div className="carousel">
            <button className="left" name={PREV_BTN} onClick={handleButtonClick} >{PREV_BTN}</button>

            <div
                className="images"
                style={{ transform: "translateX(" + -activeIdx * 100 + "%)" }} >
                {images.map(({ alt, src }, idx) => (
                    <img key={src} alt={alt} src={src} width="100%" loading="lazy" />
                ))}
            </div>

            <button className="right" name={NEXT_BTN} onClick={handleButtonClick} >{NEXT_BTN}</button>
        </div>
    );
}
