import Image from "next/image";
import { auth } from "~/server/auth";
// import { HydrateClient } from "~/trpc/server";

import HomeBg from "../../assets/home-bg.png";
import { Search } from "lucide-react";
import { Input } from "../_components/ui/input";
import { Button } from "../_components/ui/button";

export default async function Home() {
  const session = await auth();

  return (
    // <HydrateClient>
    <div className="w-full space-y-8 px-40 pt-8">
      <div
        className={`flex h-[600px] w-full flex-col items-center justify-center gap-y-4 rounded-2xl bg-cover bg-center bg-no-repeat`}
        style={{
          backgroundImage: `url(${HomeBg.src})`,
        }}
      >
        <h1 className="text-6xl font-extrabold text-white">
          Help out at our latest events
        </h1>
        <p className="text-base text-white">
          Be a part of the change you want to see in your community
        </p>
        <div className="mt-8 flex w-1/3 flex-row items-center rounded-xl bg-white px-4 py-2">
          <Search className="h-8 w-8 font-bold text-gray-500" />
          <Input
            className="h-16 flex-1 border-none focus:border-none focus:outline-none focus:ring-offset-0 focus-visible:ring-0"
            placeholder="Search for events"
          />
          <Button className="h-12 w-24 rounded-full text-sm font-bold">
            Search
          </Button>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-950">Featured projects</h1>
      </div>
    </div>
    // </HydrateClient>
  );
}
