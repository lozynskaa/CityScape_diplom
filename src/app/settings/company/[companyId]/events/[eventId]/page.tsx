"use client";
import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Progress } from "~/app/_components/ui/progress";
import { api } from "~/trpc/react";
import { Spinner } from "~/app/_components/ui/spinner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/app/_components/ui/carousel";
import DonorItem, { type DonationItemType } from "~/app/_components/donor-item";
import { Button } from "~/app/_components/ui/button";
import ApplicantItem from "~/app/_components/applicant-item";
import CreateEventForm, {
  type CreateEventDetails,
} from "~/app/_components/create-event-form";

const requiredFields = [
  "name",
  "description",
  "goalAmount",
  "currency",
  "purpose",
  "category",
  "location",
  "date",
] as const;

const disabledCallback = (eventDetails: CreateEventDetails) => {
  return !requiredFields.every((field) => eventDetails[field]);
};

export default function EventPage() {
  const { eventId } = useParams<{
    companyId: string;
    eventId: string;
  }>();

  const eventDetailsRef = useRef<CreateEventDetails>({});
  const {
    data: currentEvent = null,
    isFetching,
    isFetched,
  } = api.event.getPrivateEvent.useQuery({
    id: eventId,
  });
  const { mutateAsync: updateEvent } = api.event.updateEvent.useMutation();

  const handleSave = async () => {
    if (currentEvent && !disabledCallback(eventDetailsRef.current)) {
      const result = await updateEvent({
        id: currentEvent?.id ?? "",
        name: eventDetailsRef.current?.name ?? currentEvent?.name,
        description:
          eventDetailsRef.current?.description ??
          currentEvent?.description ??
          "",
        purpose:
          eventDetailsRef.current?.purpose ?? currentEvent?.purpose ?? "",
        image: eventDetailsRef.current?.imageFile,
        goalAmount: +(
          eventDetailsRef.current?.goalAmount ??
          currentEvent?.goalAmount ??
          "0"
        ),
        currency:
          eventDetailsRef.current?.currency ?? currentEvent?.currency ?? "",
        includeDonations: !eventDetailsRef.current?.withoutDonations,
        location:
          eventDetailsRef.current?.location ?? currentEvent?.location ?? "",
        date: eventDetailsRef.current?.date ?? currentEvent?.date ?? new Date(),
        category:
          eventDetailsRef.current?.category ?? currentEvent?.category ?? "",
      });

      if (result) {
        eventDetailsRef.current = result;
      }
    }
  };

  useEffect(() => {
    if (currentEvent && isFetched) {
      eventDetailsRef.current = currentEvent;
    }
  }, [isFetched]);

  if (isFetching || !currentEvent) {
    return <Spinner />;
  }

  return (
    <div className="space-y-8 px-12 py-8">
      <h1 className="text-2xl font-bold text-gray-950">Event Dashboard</h1>

      <div className="space-y-2">
        <p className="text-base font-medium text-gray-950">
          Raised {Math.round(+currentEvent.currentAmount)}{" "}
          {currentEvent.currency} of {Math.round(+currentEvent.goalAmount)}{" "}
          {currentEvent.currency}
        </p>
        <Progress
          value={Math.round(
            (+currentEvent.currentAmount / +currentEvent.goalAmount) * 100,
          )}
        />
        <p className="text-sm text-gray-600">
          By {currentEvent?.donationUsers?.length} peoples
        </p>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-950">
          Latest donations ({currentEvent.donationUsers?.length})
        </h1>

        {currentEvent?.donationUsers?.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              axis: "x",
            }}
            orientation="vertical"
            className="w-full py-4"
          >
            <CarouselContent className="max-h-[300px]">
              {currentEvent.donationUsers.map((userDonation, index) => (
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

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-950">
          Event applicants ({currentEvent.eventUsers?.length})
        </h1>

        {currentEvent?.eventUsers?.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              axis: "x",
            }}
            orientation="vertical"
            className="max-h-[300px] w-full py-4"
          >
            <CarouselContent>
              {currentEvent.eventUsers.map((applicant, index) => (
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

      <div className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-950">Edit Event</h1>

        <Button onClick={handleSave}>Save changes</Button>
      </div>

      <CreateEventForm
        predefinedEvent={currentEvent}
        eventDetailsRef={eventDetailsRef}
        disabledCallback={disabledCallback}
        setDisabled={() => null}
      />
    </div>
  );
}
