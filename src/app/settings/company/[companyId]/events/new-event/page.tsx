"use client";

import { useRef, useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import { useParams, useRouter } from "next/navigation";
import CreateEventForm, {
  type CreateEventDetails,
} from "~/app/_components/create-event-form";

const requiredFields = [
  "name",
  "description",
  "goalAmount",
  "currency",
  "purpose",
  "imageFile",
  "category",
  "location",
  "date",
] as const;

const disabledCallback = (state: CreateEventDetails) => {
  return !requiredFields.every((field) => state[field]);
};

export default function NewEventPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const [disabled, setDisabled] = useState(true);
  const router = useRouter();
  const eventDetailsRef = useRef<CreateEventDetails>({});

  const { mutateAsync: createEvent } = api.event.createEvent.useMutation();

  const handleCreateEvent = async () => {
    if (!disabledCallback(eventDetailsRef.current)) {
      const filledEventDetails =
        eventDetailsRef.current as Required<CreateEventDetails>;
      const newEvent = await createEvent({
        name: filledEventDetails.name,
        description: filledEventDetails.description ?? "",
        goalAmount: Number(filledEventDetails.goalAmount),
        currency: filledEventDetails.currency ?? "USD",
        purpose: filledEventDetails.purpose ?? "",
        image: filledEventDetails.imageFile,
        companyId,
        category: filledEventDetails.category ?? "",
        includeDonations: !filledEventDetails.withoutDonations,
        location: filledEventDetails.location ?? "",
        date: filledEventDetails.date ?? new Date(),
      });
      router.push(`/settings/company/${companyId}/events/${newEvent.id}`);
    }
  };

  return (
    <div className="h-full space-y-8 px-12 py-8">
      <div className="flex w-full flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">New Event</h1>
        <Button
          className="w-24 rounded-full"
          onClick={handleCreateEvent}
          disabled={disabled}
        >
          Save
        </Button>
      </div>
      <CreateEventForm
        eventDetailsRef={eventDetailsRef}
        setDisabled={setDisabled}
        disabledCallback={disabledCallback}
      />
    </div>
  );
}
