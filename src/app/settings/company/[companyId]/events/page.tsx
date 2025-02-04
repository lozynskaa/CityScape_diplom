"use client";

import { useParams } from "next/navigation";
import NoValues from "~/app/_components/no-values";
import EventCard from "~/app/_components/quick-event-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/app/_components/ui/carousel";
import { Spinner } from "~/app/_components/ui/spinner";
import { api } from "~/trpc/react";

export default function EventSelect() {
  const { companyId } = useParams<{ companyId: string }>();
  const { data: events = [], isFetching } =
    api.event.getEventsByCompany.useQuery({
      id: companyId,
    });

  if (isFetching) {
    return <Spinner />;
  }

  if (events.length === 0) {
    return (
      <NoValues
        title="No events found"
        message="Seems like you don't have any events. You can create one."
        buttonText="Create event"
        redirectUrl={`/settings/company/${companyId}/new-event`}
      />
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-y-4 px-12 py-8">
      <Carousel
        opts={{
          align: "start",
          axis: "x",
        }}
        orientation="vertical"
        className="w-full py-4"
      >
        <CarouselContent className="h-[calc(100vh-10rem)]">
          {events.map((event) => (
            <CarouselItem key={event.id} className="basis-1/5">
              <EventCard event={event} settingsTab />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
