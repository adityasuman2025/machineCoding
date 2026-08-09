import { usePubSub } from "./PubSub";
import { DECR_COUNT_EVENT } from "./PubSubParent";

export default function ChildC() {
    const { emit } = usePubSub();

    function handleDecrClick() {
        emit(DECR_COUNT_EVENT)
    }

    console.log("ChildC re-render");

    return (
        <section className="border-1 flex flex-col items-center justify-center p-2">
            <h1>ChildC</h1>
            <button tabIndex={0} type="button" className="px-1 bg-red-100" onClick={handleDecrClick}>Decrease Counter</button>
        </section>
    )
}