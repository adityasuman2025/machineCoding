import { memo, useState, useRef, useCallback, useMemo, ReactNode, ChangeEvent } from "react";
import "./AutoComplete.scoped.css";

function debounce(func: Function, delay: number) {
    let timer: ReturnType<typeof setTimeout>;

    return function (...args: any) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.call(this, ...args);
        }, delay);
    }
}

interface CacheData {
    data: any,
    tsWhenSet: number, // timestamps when the cache is set
}
function useCache(ttl: number = 60) {
    const cache = useRef<Record<string, CacheData>>({});

    const set = useCallback((key: string, val: any) => {
        cache.current[key] = { data: val, tsWhenSet: Date.now() };
    }, []);

    const get = useCallback((key: string) => {
        if (cache.current.hasOwnProperty(key)) {
            const { data, tsWhenSet } = cache.current[key];
            if (Date.now() <= tsWhenSet + ttl * 1000) return data;

            delete cache.current[key]; // deleting expired one
        }

        return null;
    }, [ttl]);

    return [set, get] as const;
}

interface AutoCompleteProps {
    getSuggestions: (qry: string) => Promise<any[]> | any[],
    suggestionUniqueKey: string,
    suggestionRenderer: (item: any) => ReactNode,
    cachingEnabled: boolean,
    cacheTimeToLive: number,
}
function AutoComplete({
    getSuggestions,
    suggestionUniqueKey,
    suggestionRenderer,
    cachingEnabled = false,
    cacheTimeToLive = 60, // 60 seconds i.e. 1 minute
}: AutoCompleteProps) {
    const [localSuggs, setLocalSuggs] = useState([]);

    const [setInCache, getFromCache] = useCache(cacheTimeToLive);

    const handleChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        const qry = String(e.target.value || "").trim();
        if (!qry) return setLocalSuggs([]);

        if (cachingEnabled) {
            const cachedResult = getFromCache(qry);
            if (cachedResult) {
                console.log("getting from cache", qry)
                setLocalSuggs(cachedResult);
                return;
            }
        }

        const result = await getSuggestions(qry);
        setInCache(qry, result);
        setLocalSuggs(result);
    }, [cachingEnabled, getSuggestions, getFromCache, setInCache]);
    const debouncedHandleChange = useMemo(() => debounce(handleChange, 400), [handleChange]);

    return (
        <section className="autoComplete">
            <input className="inputField" type="text" onChange={debouncedHandleChange} />
            {
                localSuggs?.length ? (
                    <ul className="suggestions">
                        {
                            localSuggs.map(item => (
                                <li key={item[suggestionUniqueKey]}>
                                    {suggestionRenderer(item)}
                                </li>
                            ))
                        }
                    </ul>
                ) : null
            }
        </section>
    )
}

export default memo(AutoComplete);