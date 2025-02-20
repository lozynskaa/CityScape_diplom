"use client";

import { api } from "~/trpc/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../_components/ui/carousel";
import EventCard from "../_components/quick-event-card";
import { type Event } from "~/server/db/event.schema";
import { Skeleton } from "../_components/ui/skeleton";
import If from "../_components/ui/if";
import NoValues from "../_components/no-values";

type Props = {
  userId: string | undefined;
  handleApplyToEvent: (id: string) => void | Promise<void>;
};

const mockedEvents = [
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

export default function EventsList({ userId, handleApplyToEvent }: Props) {
  const { data: quickEvents = mockedEvents, isLoading } =
    api.event.getRandomEvents.useQuery({
      limit: 10,
    });

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold text-gray-950">Featured events</h1>
      <If condition={quickEvents.length > 0}>
        <Carousel
          opts={{
            align: "start",
            axis: "x",
          }}
          orientation="vertical"
          className="w-full"
        >
          <CarouselContent className="h-[420px] p-2 md:h-[250px]">
            {quickEvents.map((event) => (
              <CarouselItem key={event?.id} className="basis-1 py-2">
                {isLoading ? (
                  <Skeleton className="h-[232px] w-full" />
                ) : (
                  <EventCard
                    userId={userId}
                    event={event as Event}
                    handleApplyToEvent={handleApplyToEvent}
                  />
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </If>
      <If condition={!quickEvents.length}>
        <NoValues
          title="No events found"
          message="Seems like there is no events."
        />
      </If>
    </div>
  );
}
