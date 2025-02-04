"use client";

import { useParams } from "next/navigation";
import JarCard from "~/app/_components/quick-jar-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/app/_components/ui/carousel";
import { Spinner } from "~/app/_components/ui/spinner";
import { api } from "~/trpc/react";

export default function JarSelect() {
  const { companyId } = useParams<{ companyId: string }>();
  const { data: jars = [], isFetching } = api.company.getCompanyJars.useQuery({
    id: companyId,
  });

  if (isFetching) {
    return <Spinner />;
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-y-4 px-12 py-8">
      <Carousel
        opts={{
          align: "start",
          axis: "x",
        }}
        orientation="vertical"
        className="h-[516px] w-full py-4"
      >
        <CarouselContent>
          {jars.map((jar, index) => (
            <CarouselItem key={index} className="basis-1/5">
              <JarCard jar={jar} settingsTab />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
