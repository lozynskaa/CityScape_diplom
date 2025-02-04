"use client";

import { Suspense } from "react";
import CategoryBadge from "~/app/_components/category-badge";
import DynamicPagination from "~/app/_components/dynamic-pagination";
import ExploreCard from "~/app/_components/explore-card";
import DatePicker from "~/app/_components/ui/date-picker";
import If from "~/app/_components/ui/if";
import { Input } from "~/app/_components/ui/input";
import { LabeledItem } from "~/app/_components/ui/labeled-item";
import { Spinner } from "~/app/_components/ui/spinner";
import { useDebounce } from "~/hooks/use-debounce";
import { useWritableSearchParams } from "~/hooks/use-writable-search-params";
import { api } from "~/trpc/react";

const categories = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "My applies", value: "my_applies" },
];

export default function EventsListPage() {
  const { set, searchParams } = useWritableSearchParams();
  const debouncedSearch = useDebounce(searchParams.get("search") ?? "", 500);
  const debouncedLocation = useDebounce(
    searchParams.get("location") ?? "",
    500,
  );

  const input = {
    search: debouncedSearch ?? "",
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
    companyId: searchParams.get("companyId") ?? "",
    category: (searchParams.get("category") ?? "all") as
      | "all"
      | "new"
      | "my_applies",
    eventCategory: searchParams.get("eventCategory") ?? "",
    eventLocation: debouncedLocation ?? "",
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

  const { data: categoriesData = [] } = api.event.getCategories.useQuery();

  const handleChangeFilter = (
    type:
      | "startDate"
      | "endDate"
      | "eventLocation"
      | "eventCategory"
      | "category"
      | "search"
      | "page"
      | "limit",
    value: string,
  ) => set(type, value);

  const { events, eventsCount } = data;

  return (
    <Suspense>
      <div className="w-full flex-1 space-y-8 px-12 py-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Explore events</h1>
          <div className="flex flex-row items-center gap-x-4">
            {categories.map(({ label, value }) => (
              <CategoryBadge
                selected={value === input.category}
                key={value}
                category={label}
                onClick={() => handleChangeFilter("category", value)}
              />
            ))}
          </div>
          <LabeledItem label={categoriesData?.length ? "Event Category" : ""}>
            <div className="flex flex-row items-center gap-x-4">
              {categoriesData.map((category) => (
                <CategoryBadge
                  selected={category === input.eventCategory}
                  key={category}
                  category={category}
                  onClick={() => handleChangeFilter("eventCategory", category)}
                />
              ))}
            </div>
          </LabeledItem>

          <div className="flex flex-row items-center gap-x-4">
            <Input
              label="Event Location"
              placeholder="Enter location"
              defaultValue={input.eventLocation}
              onChange={(e) =>
                handleChangeFilter("eventLocation", e.target.value)
              }
            />
            <LabeledItem label="Start Date">
              <DatePicker
                placeholder="Pick a start date"
                selectedDate={input.eventDate.startDate}
                onSelect={(date) => set("startDate", date.toISOString())}
              />
            </LabeledItem>
            <LabeledItem label="End Date">
              <DatePicker
                placeholder="Pick an end date"
                selectedDate={input.eventDate.endDate}
                onSelect={(date) => set("endDate", date.toISOString())}
              />
            </LabeledItem>
          </div>
        </div>
        <Input
          className="h-12 flex-1 placeholder:text-gray-400"
          placeholder="Search for events by name"
          defaultValue={input.search}
          onChange={(e) => handleChangeFilter("search", e.target.value)}
        />
        <If condition={isFetching}>
          <Spinner />
        </If>
        <If condition={!isFetching}>
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
        </If>
      </div>
    </Suspense>
  );
}
