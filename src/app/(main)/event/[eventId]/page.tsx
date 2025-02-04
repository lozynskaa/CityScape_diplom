"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ApplicantItem from "~/app/_components/applicant-item";
import DonorItem, { type DonationItemType } from "~/app/_components/donor-item";
import EventBlock from "~/app/_components/event-block";
import { Button } from "~/app/_components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/app/_components/ui/carousel";
import If from "~/app/_components/ui/if";
import { Progress } from "~/app/_components/ui/progress";
import { FullPageSpinner } from "~/app/_components/ui/spinner";
import { api } from "~/trpc/react";

export default function EventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const session = useSession();

  const {
    data: event,
    isLoading: isLoadingEvent,
    refetch,
  } = api.event.getEvent.useQuery({
    id: eventId,
  });
  const { mutate } = api.event.applyToEvent.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  if (isLoadingEvent || !event) {
    return <FullPageSpinner />;
  }

  const isCurrentUserApplied = event.eventUsers.some(
    (user) => user.id === session?.data?.user?.id,
  );

  const handleApplyToEvent = () => {
    mutate({ id: event.id });
  };

  return (
    <div className="w-full flex-1 space-y-8 px-12 py-8">
      <EventBlock event={event} />
      <If condition={!event.withoutDonations}>
        <div className="space-y-2">
          <p className="text-base font-medium text-gray-950">
            Raised {Math.round(+event.currentAmount)} {event.currency} of{" "}
            {Math.round(+event.goalAmount)} {event.currency}
          </p>
          <Progress
            value={Math.round((+event.currentAmount / +event.goalAmount) * 100)}
          />
          <p className="text-sm text-gray-600">
            By {event?.donationUsers?.length} peoples
          </p>
        </div>
      </If>

      <If condition={!event.withoutDonations}>
        <div className="space-y-2">
          <div className="flex flex-row items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-950">
              Latest donations ({event.donationUsers?.length})
            </h1>
            <Link href={`/event/${eventId}/quick-donate`}>
              <Button className="w-22 rounded-full font-bold">
                Donate to this event
              </Button>
            </Link>
          </div>
          <If condition={event?.donationUsers?.length > 0}>
            <Carousel
              opts={{
                align: "start",
                axis: "x",
              }}
              orientation="vertical"
              className="w-full py-4"
            >
              <CarouselContent className="max-h-[300px]">
                {event.donationUsers.map((userDonation, index) => (
                  <CarouselItem key={index} className="basis-1/5">
                    <DonorItem donation={userDonation as DonationItemType} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </If>
          <If condition={!event.donationUsers?.length}>
            <p className="text-sm text-gray-600">No recent donations yet.</p>
          </If>
        </div>
      </If>

      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-950">
            Event applicants ({event.eventUsers?.length})
          </h1>
          <If condition={!!session?.data?.user?.id}>
            <Button
              type="submit"
              className="w-22 rounded-full font-bold"
              disabled={isCurrentUserApplied}
              onClick={handleApplyToEvent}
            >
              {isCurrentUserApplied ? "Applied" : "Apply to this event"}
            </Button>
          </If>
        </div>

        <If condition={event.eventUsers?.length > 0}>
          <Carousel
            opts={{
              align: "start",
              axis: "x",
            }}
            orientation="vertical"
            className="max-h-[300px] w-full py-4"
          >
            <CarouselContent>
              {event.eventUsers.map((applicant, index) => (
                <CarouselItem key={index} className="basis-1/5">
                  <ApplicantItem applicant={applicant} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </If>

        <If condition={!event.eventUsers?.length}>
          <p className="text-sm text-gray-600">
            No users applied to event yet.
          </p>
        </If>
      </div>
    </div>
  );
}
