import { memo, useSyncExternalStore, useCallback } from 'react';
import type { SeatType } from '../constants';
import { seatStore } from './seatStore';
import '../index.scoped.css';

interface SeatSyncExternalStoreProps {
    groupId: string;
    rowId: string;
    seatData: SeatType;
}

function SeatSyncExternalStore({ groupId, rowId, seatData }: SeatSyncExternalStoreProps) {
    console.log("SeatSyncExternalStore render", groupId, rowId, seatData.id);

    const getSnapshot = useCallback(() => {
        const active = seatStore.getSeat();
        return active?.groupId === groupId && active?.rowId === rowId && active?.seatId === seatData.id;
    }, [groupId, rowId, seatData.id]);

    const isSelected = useSyncExternalStore(seatStore.subscribe, getSnapshot);

    function handleOnClick() {
        seatStore.selectSeat({ groupId, rowId, seatId: seatData.id });
    }

    return (
        <div
            className={'seat seat_' + (seatData.type) + (isSelected ? " active" : "")}
            onClick={handleOnClick}
            tabIndex={0}
        >
            {seatData.id}
        </div>
    );
}

export default memo(SeatSyncExternalStore);
