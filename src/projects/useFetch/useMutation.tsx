import { useCallback, useEffect, useRef, useState } from "react";

async function apiCall(url: string, signal: AbortSignal) {
    const resp = await fetch(url, { signal });
    if (!resp.ok) throw new Error(String(resp.status));

    const json = await resp.json();
    return json;
}

export const METHODS = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DELETE",
} as const;

interface useMutationReturnType {
    isLoading: boolean,
    mutate: (body: Record<string, any>) => void,
}
interface useMutationProps {
    url: string,
    method: keyof typeof METHODS,
    onError: (err: any) => void,
    onSuccess: (resp: any) => void,
}
export default function useMutation({
    url,
    method = METHODS.GET,
    onError,
    onSuccess,
}: useMutationProps): useMutationReturnType {
    const controllerRef = useRef<AbortController>(null);
    const onErrorRef = useRef(onError);
    const onSuccessRef = useRef(onSuccess);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        return () => controllerRef.current?.abort();
    }, []);

    useEffect(() => {
        onSuccessRef.current = onSuccess;
    }, [onSuccess]);

    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    const mutate = useCallback(async (body: Record<string, any>) => {
        controllerRef.current?.abort();

        try {
            const controller = new AbortController();
            controllerRef.current = controller;

            setIsLoading(true);

            const resp = await fetch(url, {
                signal: controller.signal,
                method,
                headers: { 'Content-Type': "application/json" },
                ...(method === METHODS.GET ? {} : { body: JSON.stringify(body) })
            });

            if (!resp.ok) {
                onErrorRef.current?.(resp);
                setIsLoading(false);
                return;
            }

            const json = await resp.json();
            onSuccessRef.current?.(json);
            setIsLoading(false);
        } catch (err) {
            if (err.name === "AbortError") return;

            onErrorRef.current?.(err);
            setIsLoading(false);
        }
    }, [url, method]);

    return { isLoading, mutate };
}