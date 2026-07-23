import React, { useState, useEffect, useCallback } from "react";
import "./AutoComplete2.scoped.css";

function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

export default function AutoComplete2() {
    const [searchText, setSearchText] = useState("");
    const [isDropDownOpen, setIsDropDownOpen] = useState(false);
    const debouncedSearchText = useDebounce(searchText.trim(), 300);

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchSearchResults = useCallback(async (value: string, signal: AbortSignal) => {
        setError("");

        if (value.length > 0) {
            setLoading(true);
            setIsDropDownOpen(true);

            try {
                const response = await fetch(`https://dummyjson.com/products/search?q=${value}`, { signal });
                if (!response.ok) throw new Error("Network response was not ok");

                const data = await response.json();
                setSearchResults(data.products);
                setLoading(false);
            } catch (error: any) {
                if (error.name === "AbortError") return;

                console.error("Error retrieving search results:", error);
                setError("Error retrieving search results");
                setLoading(false);
            }
        } else {
            setSearchResults([]);
            setIsDropDownOpen(false);
        }
    }, []);

    useEffect(() => {
        const abortController = new AbortController();

        fetchSearchResults(debouncedSearchText, abortController.signal);

        return () => abortController.abort();
    }, [debouncedSearchText, fetchSearchResults]);

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setSearchText(value);
    }, []);

    const handleApartmentClick = useCallback((e: React.MouseEvent<HTMLParagraphElement>) => {
        const id = e.currentTarget.dataset.id;
        console.log("redirect to particular page with id", id);
        setSearchText("");
        setIsDropDownOpen(false);
    }, []);

    const handleSearchClick = useCallback(() => {
        console.log("search clicked");
        setSearchResults([]);
        setIsDropDownOpen(false);
    }, []);

    return (
        <div className="search-bar">
            <input
                data-testid="search-input"
                type="text"
                className="search-input"
                placeholder="Search for a location"
                value={searchText}
                onChange={handleInputChange}
            />

            <button className="search-button" onClick={handleSearchClick}>
                search
            </button>

            {isDropDownOpen ? (
                <div data-testid="search-div" className="results-dropdown">
                    {error ? error : (
                        loading ? "loading..." : (
                            searchResults.length > 0 ? (
                                searchResults.map((result) => (
                                    <p
                                        key={result.id}
                                        data-id={result.id}
                                        onClick={handleApartmentClick}
                                    >
                                        {result.title}
                                    </p>
                                ))
                            ) : (
                                <p className="no-results">No matching results found</p>
                            )
                        )
                    )}
                </div>
            ) : null}
        </div>
    );
}
