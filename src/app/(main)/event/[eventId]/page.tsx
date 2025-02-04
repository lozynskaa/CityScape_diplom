import ApplicantItem from "~/app/_components/applicant-item";
import DonorItem, { type DonationItemType } from "~/app/_components/donor-item";
import EventBlock from "~/app/_components/event-block";
import { Button } from "~/app/_components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/app/_components/ui/carousel";
import { Progress } from "~/app/_components/ui/progress";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

type Props = {
  params: Promise<{ eventId: string }>;
};

export default async function EventPage({ params }: Props) {
  const { eventId } = await params;

  const session = await auth();

  const event = await api.event.getEvent({
    id: eventId,
  });

  const isCurrentUserApplied = event.eventUsers.some(
    (user) => user.id === session?.user.id,
  );

  return (
    <div className="w-full space-y-8 px-12 py-8">
      <EventBlock event={event} />
      {!event.withoutDonations && (
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
      )}

      {!event.withoutDonations && (
        <div className="space-y-2">
          <div className="flex flex-row items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-950">
              Latest donations ({event.donationUsers?.length})
            </h1>
            <Button className="w-22 rounded-full font-bold">
              Donate to this event
            </Button>
          </div>

          {event?.donationUsers?.length > 0 ? (
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
          ) : (
            <p className="text-sm text-gray-600">No recent donations yet.</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-950">
            Event applicants ({event.eventUsers?.length})
          </h1>
          {!!session?.user?.id && (
            <Button
              className="w-22 rounded-full font-bold"
              disabled={isCurrentUserApplied}
            >
              {isCurrentUserApplied ? "Applied" : "Apply to this event"}
            </Button>
          )}
        </div>

        {event?.eventUsers?.length > 0 ? (
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
        ) : (
          <p className="text-sm text-gray-600">
            No users applied to event yet.
          </p>
        )}
      </div>
    </div>
  );
}
