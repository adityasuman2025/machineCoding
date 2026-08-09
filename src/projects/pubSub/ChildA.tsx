import { useEffect, useState } from "react";
import { usePubSub } from "./PubSub";
import { INCR_COUNT_EVENT, DECR_COUNT_EVENT } from "./PubSubParent";

export default function ChildA() {
    const [counter, setCounter] = useState(1);

    const { on } = usePubSub();

    useEffect(() => {
        const incrEvent = on(INCR_COUNT_EVENT, () => setCounter(prev => prev + 1));
        const decrEvent = on(DECR_COUNT_EVENT, () => setCounter(prev => prev - 1));

        return () => {
            incrEvent.off();
            decrEvent.off();
        }
    }, [on]);

    console.log("ChildA re-render");

    return (
        <section className="border-1 flex flex-col items-center justify-center p-2" role="status" aria-live="polite">
            <h1>ChildA</h1>
            <p>count is: {counter}</p>
        </section>
    )
}