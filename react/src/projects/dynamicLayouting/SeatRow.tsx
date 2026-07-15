import { memo, useCallback } from 'react'
import type { SeatRowType, SeatGroupType } from './constants'
import Seat from './Seat'

interface SeatRowProps {
    currSeatGroup: SeatGroupType,
    seatRowData: SeatRowType,
    selectedSeatId: number | null
    setSelectedSeat: (data: any) => any
}
function SeatRow({ currSeatGroup, seatRowData, selectedSeatId, setSelectedSeat }: SeatRowProps) {
    console.log("SeatRow", seatRowData)

    const handleSeatClick = useCallback((seatId: number) => {
        setSelectedSeat({ groupId: currSeatGroup.id, rowId: seatRowData.id, seatId })
    }, [currSeatGroup.id, seatRowData.id, setSelectedSeat]);

    return (
        <li className='seatRow'>
            <p>{seatRowData.title}</p>

            <div className='seats'>
                {seatRowData.items.map((seat) => (
                    <Seat
                        key={seat.id}
                        seatData={seat}
                        isSelected={selectedSeatId === seat.id}
                        onClick={handleSeatClick}
                    />
                ))}
            </div>
        </li>
    )
}

export default memo(SeatRow);