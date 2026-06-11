import { memo } from 'react';
import type { SeatGroupType } from '../constants';
import SeatRowSyncExternalStore from './SeatRowSyncExternalStore';

interface SeatGroupSyncExternalStoreProps {
    seatGroupData: SeatGroupType;
}

function SeatGroupSyncExternalStore({ seatGroupData }: SeatGroupSyncExternalStoreProps) {
    console.log("SeatGroupSyncExternalStore render", seatGroupData.title);

    return (
        <section>
            <h3>{seatGroupData.title} - Rs. {seatGroupData.price}</h3>
            <ul>
                {seatGroupData.seatRows.map((seatRow) => (
                    <SeatRowSyncExternalStore
                        key={seatRow.id}
                        currSeatGroup={seatGroupData}
                        seatRowData={seatRow}
                    />
                ))}
            </ul>
        </section>
    );
}

export default memo(SeatGroupSyncExternalStore);
