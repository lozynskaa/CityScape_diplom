"use client";

import CategoryBadge from "~/app/_components/category-badge";
import DynamicPagination from "~/app/_components/dynamic-pagination";
import ExploreCard from "~/app/_components/explore-card";
import { Input } from "~/app/_components/ui/input";
import { Spinner } from "~/app/_components/ui/spinner";
import { useDebounce } from "~/hooks/use-debounce";
import { useWritableSearchParams } from "~/hooks/use-writable-search-params";
import { api } from "~/trpc/react";

const categories = ["All", "Featured", "New", "Trending"];

//TODO: Add event category filter and event location filter input
export default function EventsListPage() {
  const { set, searchParams } = useWritableSearchParams();
  const debouncedSearch = useDebounce(searchParams.get("search") ?? "", 500);

  const input = {
    search: debouncedSearch ?? "",
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
    companyId: searchParams.get("companyId") ?? "",
    category: (searchParams.get("category") ?? "All") as
      | "Featured"
      | "New"
      | "Trending"
      | "All",
    eventCategory: searchParams.get("eventCategory") ?? "",
    eventDate: {
      startDate: searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
    },
  };

  const { data = { events: [], eventsCount: 0 }, isFetching } =
    api.event.getEventsWithFilters.useQuery(input);

  const handleChangeFilter = (
    type: "category" | "search" | "page" | "limit",
    value: string,
  ) => set(type, value);

  const { events, eventsCount } = data;

  return (
    <div className="w-full space-y-8 px-12 py-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Explore events</h1>
        <div className="flex flex-row items-center gap-x-4">
          {categories.map((category) => (
            <CategoryBadge
              selected={category === input.category}
              key={category}
              category={category}
              onClick={() => handleChangeFilter("category", category)}
            />
          ))}
        </div>
      </div>
      <Input
        className="h-12 flex-1 placeholder:text-gray-400"
        placeholder="Search for events by name"
        defaultValue={input.search}
        onChange={(e) => handleChangeFilter("search", e.target.value)}
      />
      {isFetching ? (
        <div className="flex w-full flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-5 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {events.map((event) => (
              <ExploreCard
                key={event.id}
                imageUrl={event.imageUrl ?? ""}
                link={`/event/${event.id}`}
                name={event.name}
                description={event.category ?? "No category"}
              />
            ))}
          </div>
          <DynamicPagination
            totalElements={eventsCount}
            currentPage={input.page}
            onPageChange={(page) => handleChangeFilter("page", page.toString())}
            elementsPerPage={input.limit}
            pagesToSeen={5}
          />
        </>
      )}
    </div>
  );
}
