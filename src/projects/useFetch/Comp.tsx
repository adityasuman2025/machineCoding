import { useEffect, useState } from "react";
import useFetch from "./useFetch";
import useMutation, { METHODS } from "./useMutation";

export default function Comp() {
    const [url, setUrl] = useState('https://dummyjson.com/recipes');

    const mutation = useMutation({
        url: "https://dummyjson.com/products/add", method: METHODS.POST,
        onSuccess: resp => console.log("mutation resp", resp),
        onError: err => console.log("mutation err", err.message)
    });

    const { isLoading, error, data } = useFetch({ url, retries: 0 });
    console.log("data", data)

    // useEffect(() => {
    //     const timer = setTimeout(() => setUrl('https://dummyjson.com/products'), 100);
    //     return () => clearTimeout(timer);
    // }, []);

    return (
        <main>
            useFetch Comp

            <div>
                {isLoading ? "loading..." : error ? error : "data is here"}
            </div>

            <button type="button" onClick={() => mutation.mutate({ title: 'BMW Pencil', })}>
                {mutation.isLoading ? "loading" : "get products"}
            </button>
        </main>
    )
}