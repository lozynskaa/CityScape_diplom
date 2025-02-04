import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../_components/ui/carousel";
import CompanyCard from "../_components/company-card";
import EventCard from "../_components/quick-event-card";
import { api, HydrateClient } from "~/trpc/server";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { type Event } from "~/server/db/event.schema";
import HomeBoard from "../_components/home-board";

const handleSearchEvents = async (formData: FormData) => {
  "use server";
  const search = formData.get("search") as string;
  redirect(`/event?search=${search}`);
};

export default async function Home() {
  const session = await auth();
  const quickCompanies = await api.company.getRandomCompanies({
    limit: 10,
  });

  const quickEvents = await api.event.getRandomEvents({
    limit: 10,
  });

  const handleApplyToEvent = async (id: string) => {
    "use server";
    await api.event.applyToEvent({ id });
    await api.event.getEvent.prefetch({ id });
  };

  return (
    <HydrateClient>
      <div className="my-8 w-full space-y-8 px-10 md:px-20 lg:px-40">
        <HomeBoard handleSearchEvents={handleSearchEvents} />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-950">
            Featured projects
          </h1>
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
                  <CompanyCard company={company} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-950">Featured events</h1>
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
                  <EventCard
                    userId={session?.user?.id}
                    event={event as Event}
                    handleApplyToEvent={handleApplyToEvent}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </HydrateClient>
  );
}
