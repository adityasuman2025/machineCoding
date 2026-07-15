import { useState } from 'react';
import SeatGroup from './SeatGroup';
import { DATA } from './constants';

export type SelectedSeatType = {
    groupId: string,
    rowId: string,
    seatId: number
}

function App() {
    const [groupData] = useState([...DATA]);
    const [selectedSeat, setSelectedSeat] = useState<SelectedSeatType | undefined>();

    return (
        <section className="center">
            {
                groupData?.map((seatGroup) => {
                    const selectedGroup = selectedSeat?.groupId === seatGroup.id ? selectedSeat : null
                    return (
                        <SeatGroup
                            key={seatGroup.id}
                            seatGroupData={seatGroup}
                            selectedGroup={selectedGroup}
                            setSelectedSeat={setSelectedSeat}
                        />
                    )
                })
            }

            {selectedSeat && <section className='selection'>
                selected seat -
                {JSON.stringify(selectedSeat)}
            </section>}
        </section>
    )
}

export default App
