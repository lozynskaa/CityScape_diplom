"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef } from "react";
import Post from "~/app/_components/post-card";
import { Button } from "~/app/_components/ui/button";
import If from "~/app/_components/ui/if";
import { FullPageSpinner } from "~/app/_components/ui/spinner";
import { useDebounce } from "~/hooks/use-debounce";
import { useWritableSearchParams } from "~/hooks/use-writable-search-params";
import { api } from "~/trpc/react";

export default function PostsListPage() {
  const session = useSession();
  const { searchParams } = useWritableSearchParams();
  const debouncedSearch = useDebounce(searchParams.get("search") ?? "", 500);
  const router = useRouter();
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

  if (isFetching) {
    return <FullPageSpinner />;
  }

  if (data?.pages?.length && !data.pages.every((page) => page.posts.length)) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <If condition={session.status === "authenticated"}>
          <h1 className="text-2xl font-bold">No posts found</h1>
          <p className="mt-2 text-sm text-gray-600">
            Please create company and post, then try again.
          </p>
          <Button
            className="w-22 mt-4"
            onClick={() => router.push("/settings/company/new-company")}
          >
            Create company
          </Button>
        </If>
        <If condition={session.status === "unauthenticated"}>
          <h1 className="text-2xl font-bold">No posts found</h1>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in, create company and post, then try again.
          </p>
          <Button
            className="w-22 mt-4"
            onClick={() => router.push("/api/auth/sign-in")}
          >
            Sign in
          </Button>
        </If>
      </div>
    );
  }

  return (
    <Suspense>
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
    </Suspense>
  );
}
