import { memo } from 'react';
import type { SeatRowType, SeatGroupType } from '../constants';
import SeatSyncExternalStore from './SeatSyncExternalStore';
import '../index.scoped.css';

interface SeatRowSyncExternalStoreProps {
    currSeatGroup: SeatGroupType;
    seatRowData: SeatRowType;
}

function SeatRowSyncExternalStore({ currSeatGroup, seatRowData }: SeatRowSyncExternalStoreProps) {
    console.log("SeatRowSyncExternalStore render", seatRowData.title);

    return (
        <li className="seatRow">
            <p>{seatRowData.title}</p>
            <div className="seats">
                {seatRowData.items.map((seat) => (
                    <SeatSyncExternalStore
                        key={seat.id}
                        groupId={currSeatGroup.id}
                        rowId={seatRowData.id}
                        seatData={seat}
                    />
                ))}
            </div>
        </li>
    );
}

export default memo(SeatRowSyncExternalStore);
