import { memo, useState, CSSProperties, useCallback, useMemo } from "react";
import "./ChessBishop.scoped.css";

const DEFAULT_SIZE = 8;

function isCellHighlighted(rowIdx: number, colIdx: number, pointedCell: PointedCellType) {
    if (!pointedCell) return false;

    return Math.abs(pointedCell.rowIdx - rowIdx) === Math.abs(pointedCell.colIdx - colIdx);
}

type PointedCellType = {
    colIdx: number,
    rowIdx: number
}

interface CellProps {
    rowIdx: number,
    colIdx: number,
    isBlack?: boolean,
    isHighlighted?: boolean,
    onMouseOver: (rowIdx: number, colIdx: number) => void
}
function Cell({
    rowIdx,
    colIdx,
    isBlack = true,
    isHighlighted = false,
    onMouseOver,
}: CellProps) {
    function handleMouseOver(e) {
        onMouseOver(rowIdx, colIdx)
    }

    return (
        <div className={`cell ${isHighlighted ? "highlight" : isBlack ? "black" : "white"}`} onMouseOver={handleMouseOver} />
    )
}
const MemoisedCell = memo(Cell);

interface ChessBishopProps {
    size?: number;
}
export default function ChessBishop({ size = DEFAULT_SIZE }: ChessBishopProps) {
    const [pointedCell, setPointedCell] = useState<PointedCellType | undefined>();

    const handleMouseOver = useCallback((rowIdx: number, colIdx: number) => {
        setPointedCell({ rowIdx, colIdx });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setPointedCell(undefined);
    }, []);

    const gridArray = useMemo(() => Array.from({ length: size }), [size]);

    return (
        <section className="grid" style={{ "--size": size } as CSSProperties} onMouseLeave={handleMouseLeave}>
            {
                gridArray.map((_, rowIdx) =>
                    gridArray.map((_, colIdx) => {
                        const isBlack = (rowIdx + colIdx) % 2 === 0;
                        const isHighlighted = isCellHighlighted(rowIdx, colIdx, pointedCell);

                        return (
                            <MemoisedCell
                                key={rowIdx + "_" + colIdx}
                                rowIdx={rowIdx}
                                colIdx={colIdx}
                                isBlack={isBlack}
                                isHighlighted={isHighlighted}
                                onMouseOver={handleMouseOver}
                            />
                        )
                    })
                )
            }
        </section>
    )
}