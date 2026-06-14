import { useState, useEffect, useSyncExternalStore, useCallback } from 'react'
import RenderItem from "./RenderItem";

const ITEMS = new Array(100).fill(0).map((_, idx) => idx + 1);

function App() {
    const [items, setItems] = useState([...ITEMS]);

    /*
        here RenderItem is exported with wrapper memo
        which prevents component's re-rendering if its props has not changed
        thats why adding new item (101) in items state does not trigger re-rendering of all RenderItem component
    */
    useEffect(() => {
        setTimeout(() => {
            setItems(prev => [...prev, 101]);
        }, 3000)
    }, []);

    return (
        <ul>
            {
                items.map(item => {
                    return <RenderItem key={item} item={item} />
                })
            }
        </ul>
    )
}

export default App
