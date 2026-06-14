import { useState, useRef, useEffect } from "react";

function debounce(func, delay) {
    let timer;

    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.call(this, ...args);
        }, delay);
    }
}

export default function AutoComplete({
    autoFocus = true,
    placeholder = "",
    theming: {
        containerClassName = "",
        inputFieldClassName = "",
        suggestionContainerClassName = "",
    } = {},
    loadingRenderer = "loading",
    errorRenderer = (error) => (error || "something went wrong"),
    debounceDuration = 300,

    useCache = true,
    cacheTimeToLive = 60, // in minutes
    totalPaginationPages = 1,

    value,
    getSuggestions = () => { },
    getMoreSuggestions = () => { },
    suggestionItemRenderer,
    onSuggestionItemClick,
}) {
    const cacheTimeToLiveInMSeconds = cacheTimeToLive * 60 * 1000; // in milli seconds

    const autoCompleteSuggestionsRef = useRef(null);
    const observerTarget = useRef(null);
    const inputRef = useRef(null);
    const [suggestionsVisible, setSuggestionsVisible] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [cache, setCache] = useState({});

    const [paginationPage, setPaginationPage] = useState(1);

    useEffect(() => {
        inputRef.current.value = value;
        inputRef.current.focus();
    }, [value]);

    useEffect(() => {
        const intersectionObservor = new IntersectionObserver(function(enteries) {
            const lastElement = enteries[0];;

            if (!lastElement.isIntersecting) return;

            const scrollTop = autoCompleteSuggestionsRef.current.scrollTop;
            if (scrollTop > 0) handleMoreSuggestions(); // is the parent/wrapper/container is scrolled then only calling getMoreSuggestions() function, because observerTarget can be in viewport when there are not enough elements to scroll
        }, {
            root: autoCompleteSuggestionsRef.current, // target element i.e scrollable element (where we want infinite scrolling)
            rootMargin: "5px" // will load next content before 10px of the last element
        });

        if (observerTarget.current) intersectionObservor.observe(observerTarget.current);
    }, []);

    function handleMoreSuggestions() {
        setError("");

        setPaginationPage((prev) => {
            if (prev <= totalPaginationPages) {
                (async function() {
                    try {
                        setIsLoading(true);

                        const filteredData = await getMoreSuggestions(inputRef.current.value, prev);

                        setSuggestions(prev => ([...prev, ...filteredData]));
                    } catch (e) { // any failure in api call can be detected here
                        setError("failed to get suggestions");
                    }

                    setIsLoading(false);
                })();

                return prev + 1;
            } else {
                return prev;
            }
        });
    }

    const optimisedHandleChange = debounce(handleChange, debounceDuration);
    async function handleChange(e) {
        setError("");

        const query = e.target.value.trim();
        if (query) {
            setSuggestionsVisible(true);
            try {
                setIsLoading(true);
                setSuggestions([]);

                await optimisedGetSuggestions(query);
            } catch (e) { // any failure in api call can be detected here
                setError("failed to get suggestions");
            }
        } else {
            setSuggestionsVisible(false);
        }

        setIsLoading(false);
    }

    async function optimisedGetSuggestions(query) {
        const currentTime = (new Date()).getTime();
        const cacheResult = cache?.[query] || {};
        let filteredData = cacheResult?.data || [];
        let lastUsedTime = cacheResult?.lastUsedTime || 0;

        if (useCache) {
            if (!cache.hasOwnProperty(query)) filteredData = await getSuggestions(query); // no cache for that query
            else {
                if (currentTime <= lastUsedTime + cacheTimeToLiveInMSeconds) { // cache exists for that query
                } else filteredData = await getSuggestions(query); // cache exipred for that query
            }

            setCache(prev => ({
                ...prev,
                [query]: { ...(prev[query] || {}), data: filteredData, lastUsedTime: currentTime }
            }));
        } else filteredData = await getSuggestions(query); // caching is disabled

        setPaginationPage(2);
        setSuggestions(filteredData);
    }

    return (
        <div id="autoComplete" className={containerClassName}
            aria-expanded={suggestionsVisible}
            aria-autocomplete="list"
            aria-haspopup={true}
            aria-label="Search"
        >
            <input ref={inputRef} type="text"
                id="autoCompleteInput" className={inputFieldClassName}
                autoFocus={autoFocus} placeholder={placeholder}
                onChange={(e) => optimisedHandleChange(e)}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="off"
                role="combobox"
            />

            <ul id="autoCompleteSuggestions" ref={autoCompleteSuggestionsRef} className={suggestionContainerClassName} aria-live={true}>
                {
                    suggestionsVisible && suggestions.map((sugg, idx) => (
                        <li className="autoCompleteSuggestion" key={idx}
                            onClick={() => {
                                setSuggestionsVisible(false);
                                onSuggestionItemClick && onSuggestionItemClick(sugg)
                            }}
                        >
                            {suggestionItemRenderer(sugg)}
                        </li>
                    ))
                }

                {
                    (isLoading) ? (
                        <div id="loaderOrError">{loadingRenderer}</div>
                    ) : (error) ? (
                        <div id="loaderOrError">{errorRenderer(error)}</div>
                    ) : null
                }
                <div ref={observerTarget}></div>
            </ul>
        </div>
    )
}