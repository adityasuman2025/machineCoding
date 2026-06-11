import { memo } from 'react'
import type { SeatType } from './constants'

interface SeatProps {
    seatData: SeatType,
    isSelected: boolean
    onClick: (seatId: number) => void
}
function Seat({ seatData, isSelected, onClick }: SeatProps) {
    console.log("Seat", seatData)

    return (<div className={'seat seat_' + (seatData.type) + (isSelected ? " active" : "")} onClick={() => onClick(seatData.id)} tabIndex={0}>{seatData.id}</div>)
}

export default memo(Seat);