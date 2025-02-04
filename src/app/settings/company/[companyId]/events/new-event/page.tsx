"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { LabeledItem } from "~/app/_components/ui/labeled-item";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import { type Event } from "~/server/db/event.schema";
import { useParams } from "next/navigation";
import { ItemSelectBlock } from "~/app/_components/item-select";
import DatePicker from "~/app/_components/ui/date-picker";
import { Switch } from "~/app/_components/ui/switch";

const requiredFields = [
  "name",
  "description",
  "goalAmount",
  "currency",
  "purpose",
  "imageUrl",
  "category",
  "withoutDonations",
  "location",
  "date",
];

export default function NewEventPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const [eventDetails, setEventDetails] = useState<
    Omit<Partial<Event>, "id" | "imageUrl"> & {
      imageFile?: { file: string; fileName: string };
    }
  >({
    name: "",
    description: "",
    goalAmount: "",
    currency: "",
    purpose: "",
    category: "",
    withoutDonations: true,
    location: "",
    date: undefined,
  });

  const { mutate: createEvent } = api.event.createEvent.useMutation();

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const base64Data = reader.result as string; // e.g., "data:image/png;base64,..."

        const parsedFile = {
          file: base64Data,
          fileName: file.name,
        };
        setEventDetails((prev) => ({ ...prev, imageFile: parsedFile }));
      };
    }
  };

  const handleCreateEvent = () => {
    if (
      !requiredFields.every(
        (field) => eventDetails[field as keyof typeof eventDetails],
      )
    )
      return;
    createEvent({
      name: eventDetails.name!,
      description: eventDetails.description!,
      goalAmount:
        eventDetails.goalAmount && +eventDetails.goalAmount
          ? +eventDetails.goalAmount
          : 0,
      currency: eventDetails.currency!,
      purpose: eventDetails.purpose!,
      image: eventDetails.imageFile!,
      companyId,
      category: eventDetails.category!,
      includeDonations: !!eventDetails.withoutDonations,
      location: eventDetails.location!,
      date: eventDetails.date!,
    });
  };

  return (
    <div className="h-full space-y-8 px-12 py-8">
      <div className="flex w-full flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">New Event</h1>
        <Button
          className="w-24 rounded-full"
          onClick={handleCreateEvent}
          disabled={requiredFields.some(
            (field) => !eventDetails[field as keyof typeof eventDetails],
          )}
        >
          Save
        </Button>
      </div>
      <div className="grid w-full grid-cols-2 gap-5">
        <Input
          placeholder="Enter event name"
          label="Event Name"
          value={eventDetails.name}
          onChange={(e) =>
            setEventDetails((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
        />
        <ItemSelectBlock
          items={[{ id: "Category 1", name: "Category 1" }]}
          set={(id) => setEventDetails((prev) => ({ ...prev, category: id }))}
          title={eventDetails.category ?? "Select Category"}
          label="Event Category"
        />
        <LabeledItem label="Include Donations">
          <Switch
            checked={!eventDetails.withoutDonations}
            onCheckedChange={(value) =>
              setEventDetails((prev) => ({
                ...prev,
                withoutDonations: !value,
              }))
            }
          />
        </LabeledItem>

        <Input
          placeholder="Enter event goal"
          type="number"
          label="Event Goal"
          disabled={!!eventDetails.withoutDonations}
          value={eventDetails.goalAmount}
          onChange={(e) =>
            setEventDetails((prev) => ({
              ...prev,
              goalAmount: e.target.value,
            }))
          }
        />
        <LabeledItem label="Event Date">
          <DatePicker
            selectedDate={eventDetails.date}
            onSelect={(date) =>
              setEventDetails((prev) => ({ ...prev, date: date }))
            }
          />
        </LabeledItem>

        <Input
          placeholder="Enter event location"
          label="Event Location"
          value={eventDetails.location ?? ""}
          onChange={(e) =>
            setEventDetails((prev) => ({
              ...prev,
              location: e.target.value,
            }))
          }
        />

        <Textarea
          placeholder="Enter event description"
          label="Event Description"
          value={eventDetails.description ?? ""}
          onChange={(e) =>
            setEventDetails((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
        />
        <Textarea
          placeholder="Enter event purpose"
          label="Event Purpose"
          value={eventDetails.purpose ?? ""}
          onChange={(e) =>
            setEventDetails((prev) => ({
              ...prev,
              purpose: e.target.value,
            }))
          }
        />

        <ItemSelectBlock
          items={[{ id: "USD", name: "USD" }]}
          set={(id) => setEventDetails((prev) => ({ ...prev, currency: id }))}
          title={eventDetails.currency ?? "Select Currency"}
          label="Donation Currency"
        />

        <Input
          type="file"
          label="Event Logo"
          accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
          onChange={handleLoadFile}
        />
        {eventDetails.imageFile && (
          <Image
            width={200}
            height={200}
            className="col-span-2 justify-self-center"
            src={eventDetails.imageFile.file}
            alt="Event Logo"
          />
        )}
      </div>
    </div>
  );
}
