import { memo } from 'react'
import type { SelectedSeatType } from './App'
import type { SeatGroupType } from './constants'
import SeatRow from './SeatRow'

interface SeatGroupProps {
    seatGroupData: SeatGroupType,
    selectedGroup: SelectedSeatType | null
    setSelectedSeat: (data: any) => any
}
function SeatGroup({ seatGroupData, selectedGroup, setSelectedSeat }: SeatGroupProps) {
    console.log("SeatGroup", seatGroupData)

    return (
        <section key={seatGroupData.id}>
            <h3>{seatGroupData.title} - Rs. {seatGroupData.price}</h3>
            <ul>
                {seatGroupData.seatRows.map((seatRow) => {
                    const isRowSelected = selectedGroup?.rowId === seatRow.id
                    const selectedRowId = isRowSelected ? selectedGroup.seatId : null;
                    return (
                        <SeatRow
                            key={seatRow.id}
                            currSeatGroup={seatGroupData}
                            seatRowData={seatRow}
                            selectedSeatId={selectedRowId}
                            setSelectedSeat={setSelectedSeat}
                        />
                    );
                })}
            </ul>
        </section>
    )
}

export default memo(SeatGroup);