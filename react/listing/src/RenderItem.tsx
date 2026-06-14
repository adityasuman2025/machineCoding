import { useSyncExternalStore, useCallback, memo } from 'react'
import store from "./store";

function RenderItem({ item }: { item: number }) {
    console.log("item", item)

    const getSnapshot = useCallback(() => {
        return store.get() === item;
    }, []);
    const isActive = useSyncExternalStore(store.subsribe, getSnapshot)

    function handleClick() {
        store.set(item);
    }

    return <li className={isActive ? "active" : ""} onClick={handleClick}>item no: {item}</li>
}

export default memo(RenderItem);