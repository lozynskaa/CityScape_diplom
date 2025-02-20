"use client";

import { api } from "~/trpc/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../_components/ui/carousel";
import CompanyCard from "../_components/company-card";
import { Skeleton } from "../_components/ui/skeleton";
import { type Company } from "~/server/db/company.schema";
import If from "../_components/ui/if";

const mockedCompanies = [
  {
    id: "1",
  },
  {
    id: "2",
  },
  {
    id: "3",
  },
  {
    id: "4",
  },
];

export default function CompaniesList() {
  const { data: quickCompanies = mockedCompanies, isLoading } =
    api.company.getRandomCompanies.useQuery({
      limit: 10,
    });
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold text-gray-950">Featured projects</h1>
      <If condition={[].length > 0}>
        <Carousel
          opts={{
            align: "start",
            axis: "x",
          }}
          className="w-full"
        >
          <CarouselContent className="p-2">
            {quickCompanies.map((company, index) => (
              <CarouselItem
                key={index}
                className="basis-full pl-4 md:basis-1/3 lg:basis-1/4"
              >
                {isLoading ? (
                  <Skeleton className="h-[288px] w-full" />
                ) : (
                  <CompanyCard company={company as Company} />
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </If>
      <If condition={![].length}>
        <p className="text-sm text-gray-600">
          Seems like there are no companies.
        </p>
      </If>
    </div>
  );
}
