import { api, HydrateClient } from "~/trpc/server";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import HomeBoard from "../_components/home-board";
import CompaniesList from "./companies-list";
import EventsList from "./events-list";

const handleSearchEvents = async (formData: FormData) => {
  "use server";
  const search = formData.get("search") as string;
  redirect(`/event?search=${search}`);
};

export default async function Home() {
  const session = await auth();
  void api.company.getRandomCompanies.prefetch({
    limit: 10,
  });
  void api.event.getRandomEvents.prefetch({
    limit: 10,
  });

  const handleApplyToEvent = async (id: string) => {
    "use server";
    await api.event.applyToEvent({ id });
  };

  return (
    <HydrateClient>
      <div className="my-8 w-full space-y-8 px-10 md:px-20 lg:px-40">
        <HomeBoard handleSearchEvents={handleSearchEvents} />
        <CompaniesList />

        <EventsList
          userId={session?.user.id}
          handleApplyToEvent={handleApplyToEvent}
        />
      </div>
    </HydrateClient>
  );
}
