import { useContext, createContext, ReactNode, useRef, useMemo, useCallback } from "react"

type callbackType = (...args: any[]) => void;

interface PubSubContextType {
    on: (eventName: string, cb: callbackType) => { off: () => void },
    emit: (eventName: string, ...args: unknown[]) => void,
}
const PubSubContext = createContext<PubSubContextType | null>(null);

export default function PubSub({ children }: { children: ReactNode }) {
    const events = useRef<Record<string, Set<callbackType>>>({});

    const on = useCallback((eventName: string, cb: callbackType) => {
        const eventsMap = events.current;
        if (!Object.hasOwn(eventsMap, eventName)) eventsMap[eventName] = new Set();
        eventsMap[eventName].add(cb);

        function off() {
            if (!events.current[eventName]) return;

            events.current?.[eventName]?.delete(cb);
            if (events.current[eventName].size === 0) delete events.current[eventName]; // removing empty keys
        }

        return { off };
    }, []);

    const emit = useCallback((eventName: string, ...args: unknown[]) => {
        const eventCallbacks = [...(events.current?.[eventName]?.values() || [])]
        for (let i = 0; i < eventCallbacks?.length; i++) {
            const currCb = eventCallbacks[i];
            currCb?.(...args);
        }
    }, []);

    const contextValues = useMemo(() => ({ on, emit }), [on, emit]);
    return (
        <PubSubContext.Provider value={contextValues}>
            {children}
        </PubSubContext.Provider>
    )
}

export function usePubSub() {
    const ctx = useContext(PubSubContext);
    if (!ctx) throw new Error("context provider not found");

    return ctx;
}