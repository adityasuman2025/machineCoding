import { usePubSub } from "./PubSub";
import { INCR_COUNT_EVENT } from "./PubSubParent";

export default function ChildB() {
    const { emit } = usePubSub();

    function handleIncrClick() {
        emit(INCR_COUNT_EVENT)
    }

    console.log("ChildB re-render");

    return (
        <section className="border-1 flex flex-col items-center justify-center p-2">
            <h1>ChildB</h1>
            <button tabIndex={0} type="button" className="px-1 bg-green-100" onClick={handleIncrClick}>Increase Counter</button>
        </section>
    )
}