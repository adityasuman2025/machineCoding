import { useEffect, useRef, useState } from "react";

interface useFetchReturnType {
    isLoading: boolean,
    error: string,
    data: unknown
}
interface useFetchProps {
    url: string,
    retries?: number
}
export default function useFetch({ url, retries = 0 }: useFetchProps): useFetchReturnType {
    const retryCount = useRef<number>(retries);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!url) return setIsLoading(false);

        retryCount.current = retries; // resetting retry count when url or retries changes

        const controller = new AbortController();
        async function doApiCall(signal: AbortSignal) {
            setIsLoading(true);
            setError("");
            setData(null);

            try {
                const resp = await fetch(url, { signal });

                if (!resp.ok) {
                    if (resp.status === 500) {
                        if (retryCount.current > 0) {
                            retryCount.current--;

                            setTimeout(() => {
                                if (!signal.aborted) doApiCall(signal);
                            }, 500); // adding a delay of 0.5 seconds b/w retries
                        } else {
                            setIsLoading(false);
                            setError("Something went wrong");
                        }
                    } else {
                        setIsLoading(false);
                        setError(`Error ${resp.status}`)
                    }

                    return;
                }

                const json = await resp.json();
                setData(json);
                setIsLoading(false);
            } catch (err: any) {
                if (err.name === "AbortError") return;

                setIsLoading(false);
                setError(err.message || "Network error");
            }
        }
        doApiCall(controller.signal);

        return () => controller.abort();
    }, [url, retries]);

    return { isLoading, error, data };
}