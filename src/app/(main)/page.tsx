import HomeBg from "../../assets/home-bg.png";
import { Search } from "lucide-react";
import { Input } from "../_components/ui/input";
import { Button } from "../_components/ui/button";
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

export const revalidate = 60;

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
  };

  return (
    <HydrateClient>
      <div className="my-8 w-full space-y-8 px-10 md:px-20 lg:px-40">
        <div
          className={`flex h-[600px] w-full flex-col items-center justify-center gap-y-4 rounded-2xl bg-cover bg-center bg-no-repeat`}
          style={{
            backgroundImage: `url(${HomeBg.src})`,
          }}
        >
          <h1 className="text-center text-6xl font-extrabold text-white">
            Help out at our latest events
          </h1>
          <p className="text-center text-base text-white">
            Be a part of the change you want to see in your community
          </p>
          <form
            className="mt-8 flex w-2/3 flex-row items-center rounded-xl bg-white px-4 py-2 md:w-1/2 lg:w-1/3"
            action={handleSearchEvents}
          >
            <Search className="h-8 w-8 font-bold text-gray-500" />
            <Input
              name="search"
              className="h-16 flex-1 border-none focus:border-none focus:outline-none focus:ring-offset-0 focus-visible:ring-0"
              placeholder="Search for events"
            />
            <Button
              type="submit"
              className="h-12 w-24 rounded-full text-sm font-bold"
            >
              Search
            </Button>
          </form>
        </div>
        <div className="space-y-4">
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
            <CarouselContent className="px-2 py-4">
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

        <div>
          <h1 className="text-2xl font-bold text-gray-950">Featured events</h1>
          <Carousel
            opts={{
              align: "start",
              axis: "x",
            }}
            orientation="vertical"
            className="w-full py-4"
          >
            <CarouselContent className="h-[calc(100vh-4rem)]">
              {quickEvents.map((event) => (
                <CarouselItem key={event?.id} className="basis-1/3">
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
