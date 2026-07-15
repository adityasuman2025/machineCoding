import { useState, useSyncExternalStore, useCallback } from 'react';
import { seatStore } from './seatStore';
import counterStore from './counterStore';
import SeatGroupSyncExternalStore from './SeatGroupSyncExternalStore';
import { DATA } from '../constants';
import '../index.scoped.css';

function Counter() {
    const getSnapshot = useCallback(() => {
        return counterStore.getState().counter;
    }, []);

    const counterValue = useSyncExternalStore(counterStore.subscribe, getSnapshot);

    function handleIncreaseClick() {
        counterStore.setState();
    }

    return (
        <section>
            {counterValue}
            <button onClick={handleIncreaseClick}>increase</button>
        </section>
    )
}

function AppSyncExternalStore() {
    const [groupData] = useState([...DATA]);

    const getSnapshot = useCallback(() => {
        return seatStore.getSeat();
    }, []); // must be sorrounded by useCallback

    const selectedSeat = useSyncExternalStore(seatStore.subscribe, getSnapshot);

    return (
        <section className="center">
            {groupData?.map((seatGroup) => (
                <SeatGroupSyncExternalStore
                    key={seatGroup.id}
                    seatGroupData={seatGroup}
                />
            ))}

            {selectedSeat && <section className="selection">
                selected seat -
                {JSON.stringify(selectedSeat)}
            </section>}
            <Counter />
        </section>
    );
}

export default AppSyncExternalStore;
