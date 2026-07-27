import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";

/*
    Machine Coding Problem: Infinite Scroll
    Build an accessible, high-performance Infinite Scroll component that supports:
    1. Paginated data fetching on scroll threshold / IntersectionObserver target element.
    2. Loading indicator state during active data fetches.
    3. End of data feed detection & indicator when no more items exist.
    4. WAI-ARIA accessibility (role="region"/"feed", aria-busy, aria-live for loading states).
*/

interface InfiniteScrollerProps {
    hasMore: boolean,
    endMessage?: ReactNode,
    isLoading?: boolean,
    loader?: ReactNode,
    rootMargin?: string,
    children: ReactNode,
    loadMore: () => void
}
function InfiniteScroller({
    hasMore,
    endMessage = "no more items",
    isLoading = false,
    loader = "loading...",
    rootMargin = "0px",
    children,
    loadMore,
}: InfiniteScrollerProps) {
    const sentinelRef = useRef(null);

    useEffect(() => {
        const sentinelEle = sentinelRef.current;
        if (!sentinelEle || !hasMore) return;

        function handleObserve(enteries: IntersectionObserverEntry[]) {
            if (isLoading) return;
            if (enteries[0]?.isIntersecting) loadMore();
        }
        const observer = new IntersectionObserver(handleObserve, { rootMargin });

        observer.observe(sentinelEle);
        return () => observer.unobserve(sentinelEle)
    }, [isLoading, hasMore, rootMargin]);

    return (
        <div role="region" aria-label="infinite scrolling list" aria-busy={isLoading}>
            {children}

            {
                isLoading ? (
                    <div className="flex items-center justify-center py-2" role="status" aria-live="polite">{loader}</div>
                ) : !hasMore ? (
                    <div role="status" aria-live="polite" className="flex items-center justify-center py-2">{endMessage}</div>
                ) : null
            }

            <div ref={sentinelRef} />
        </div>
    )
}

function randomItems() {
    return Array.from({ length: 10 }, () => crypto.randomUUID());
}

export default function InfiniteScroll() {
    const [isLoading, setIsLoading] = useState(false);
    const [items, setItems] = useState<string[]>(randomItems());

    const handleLoadMore = useCallback(() => {
        console.log("handleLoadMore");

        setIsLoading(true);
        setTimeout(() => {
            setItems(prev => ([...prev, ...randomItems()]))
            setIsLoading(false);
        }, 1000);
    }, []);

    return (
        <main >
            <header className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-gray-900">Infinite Scroll</h1>
            </header>

            <InfiniteScroller
                hasMore={items.length < 40}
                endMessage={"no more items"}
                isLoading={isLoading}
                loadMore={handleLoadMore}
                rootMargin="100px"
            >
                {
                    items.map((i, idx) => (
                        <div key={i} className="h-24 flex item-center justify-center bg-zinc-100 my-1">{idx + 1}</div>
                    ))
                }
            </InfiniteScroller>
        </main>
    );
}
