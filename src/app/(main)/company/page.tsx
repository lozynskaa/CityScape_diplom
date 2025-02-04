"use client";

import { Suspense } from "react";
import CategoryBadge from "~/app/_components/category-badge";
import DynamicPagination from "~/app/_components/dynamic-pagination";
import ExploreCard from "~/app/_components/explore-card";
import If from "~/app/_components/ui/if";
import { Input } from "~/app/_components/ui/input";
import { Spinner } from "~/app/_components/ui/spinner";
import { useDebounce } from "~/hooks/use-debounce";
import { useWritableSearchParams } from "~/hooks/use-writable-search-params";
import { api } from "~/trpc/react";

const categories = ["All", "Featured", "New", "Trending"];

export default function CompanyListPage() {
  const { set, searchParams } = useWritableSearchParams();
  const debouncedSearch = useDebounce(searchParams.get("search") ?? "", 500);

  const input = {
    search: debouncedSearch ?? "",
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
    category: (searchParams.get("category") ?? "All") as
      | "Featured"
      | "New"
      | "Trending"
      | "All",
  };

  const { data = { companies: [], companiesCount: 0 }, isFetching } =
    api.company.getCompaniesWithFilters.useQuery(input);

  const handleChangeFilter = (
    type: "category" | "search" | "page" | "limit",
    value: string,
  ) => set(type, value);

  const { companies, companiesCount } = data;

  return (
    <Suspense>
      <div className="w-full flex-1 space-y-8 px-12 py-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Explore companies</h1>
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
          placeholder="Search for companies by name"
          defaultValue={input.search}
          onChange={(e) => handleChangeFilter("search", e.target.value)}
        />
        <If condition={isFetching}>
          <Spinner />
        </If>
        <If condition={!isFetching}>
          <div className="grid grid-cols-5 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {companies.map((company) => (
              <ExploreCard
                key={company.id}
                imageUrl={company.imageUrl ?? ""}
                link={`/company/${company.id}`}
                name={company.name}
                description={company.description ?? "No description"}
              />
            ))}
          </div>
          <DynamicPagination
            totalElements={companiesCount}
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
