"use client";

import { useCallback, useEffect, useRef } from "react";
import Post from "~/app/_components/post-card";
import { FullPageSpinner, Spinner } from "~/app/_components/ui/spinner";
import { useDebounce } from "~/hooks/use-debounce";
import { useWritableSearchParams } from "~/hooks/use-writable-search-params";
import { api } from "~/trpc/react";

export default function PostsListPage() {
  const { searchParams } = useWritableSearchParams();
  const debouncedSearch = useDebounce(searchParams.get("search") ?? "", 500);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const input = {
    search: debouncedSearch ?? "",
    limit: Number(searchParams.get("limit")) || 20,
    companyId: searchParams.get("companyId") ?? "",
    postDate: {
      startDate: searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
    },
  };

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    api.post.getFilteredPosts.useInfiniteQuery(input, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (
        target &&
        target.isIntersecting &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage()
          .then(() => {
            console.log("fetch next page");
          })
          .catch((error) => {
            console.error("Error fetching next page:", error);
          });
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px", // Load data before the user reaches the end
      threshold: 0.1,
    });

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [handleObserver]);

  if (true) {
    return <FullPageSpinner />;
  }

  return (
    <div className="w-full space-y-8 px-12 py-8">
      <div className="grid grid-cols-1 gap-y-6">
        {data?.pages.map((page) =>
          page.posts.map((post) => (
            <Post
              key={post.id}
              images={post.imageUrls}
              title={post.title}
              content={post.content}
            />
          )),
        )}
      </div>
      {hasNextPage && <div ref={observerRef} className="h-10 w-full"></div>}
    </div>
  );
}
