import PubSub from "./PubSub";
import ChildA from "./ChildA";
import ChildB from "./ChildB";
import ChildC from "./ChildC";

export const INCR_COUNT_EVENT = "incr-count-event";
export const DECR_COUNT_EVENT = "decr-count-event";

export default function PubSubParent() {
    return (
        <PubSub>
            <main className="grid grid-cols-3 gap-2 m-2">
                <ChildC />
                <ChildA />
                <ChildB />
            </main>
        </PubSub>
    )
}