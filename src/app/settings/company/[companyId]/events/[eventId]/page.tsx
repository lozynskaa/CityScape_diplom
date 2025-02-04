"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Progress } from "~/app/_components/ui/progress";
import { type Event } from "~/server/db/event.schema";
import { api } from "~/trpc/react";
import { Spinner } from "~/app/_components/ui/spinner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/app/_components/ui/carousel";
import DonorItem, { type DonationItemType } from "~/app/_components/donor-item";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { LabeledItem } from "~/app/_components/ui/labeled-item";
import { Textarea } from "~/app/_components/ui/textarea";
import { Switch } from "~/app/_components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/app/_components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "~/app/_components/ui/calendar";
import { format } from "date-fns";
import ApplicantItem from "~/app/_components/applicant-item";
import { ItemSelectBlock } from "~/app/_components/item-select";

export default function EventPage() {
  const { eventId } = useParams<{
    companyId: string;
    eventId: string;
  }>();

  const [updatedEventData, setUpdatedEventData] = useState<
    Partial<Event> & { imageFile?: { file: string; fileName: string } }
  >({});
  const {
    data: currentEvent = null,
    isFetching,
    isFetched,
  } = api.event.getPrivateEvent.useQuery({
    id: eventId,
  });
  const { mutateAsync: updateEvent } = api.event.updateEvent.useMutation();

  useEffect(() => {
    if (currentEvent && isFetched) {
      setUpdatedEventData({
        name: currentEvent.name,
        description: currentEvent.description,
        purpose: currentEvent.purpose,
        goalAmount: currentEvent.goalAmount,
        currency: currentEvent.currency,
        withoutDonations: currentEvent.withoutDonations,
        location: currentEvent.location,
        date: currentEvent.date,
        category: currentEvent.category,
      });
    }
  }, [isFetched]);

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
        setUpdatedEventData((prev) => ({ ...prev, imageFile: parsedFile }));
      };
    }
  };

  const handleSave = async () => {
    const requiredKeys = [
      "name",
      "description",
      "purpose",
      "imageUrl",
      "goalAmount",
      "currency",
      "withoutDonations",
      "location",
      "date",
      "category",
    ];
    if (
      currentEvent &&
      updatedEventData &&
      requiredKeys.every(
        (key) => key in currentEvent || key in updatedEventData,
      )
    ) {
      const result = await updateEvent({
        id: currentEvent?.id ?? "",
        name: updatedEventData?.name ?? currentEvent?.name,
        description:
          updatedEventData?.description ?? currentEvent?.description ?? "",
        purpose: updatedEventData?.purpose ?? currentEvent?.purpose ?? "",
        image: updatedEventData?.imageFile,
        goalAmount: +(
          updatedEventData?.goalAmount ??
          currentEvent?.goalAmount ??
          "0"
        ),
        currency: updatedEventData?.currency ?? currentEvent?.currency ?? "",
        includeDonations: !updatedEventData?.withoutDonations,
        location: updatedEventData?.location ?? currentEvent?.location ?? "",
        date: updatedEventData?.date ?? currentEvent?.date ?? new Date(),
        category: updatedEventData?.category ?? currentEvent?.category ?? "",
      });

      if (result) {
        setUpdatedEventData(result);
      }
    }
  };

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

      <div className="grid w-full grid-cols-2 gap-5">
        <Input
          placeholder="Enter event name"
          label="Event Name"
          value={updatedEventData.name}
          onChange={(e) =>
            setUpdatedEventData((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
        />
        <ItemSelectBlock
          items={[{ id: "Category 1", name: "Category 1" }]}
          set={(id) =>
            setUpdatedEventData((prev) => ({ ...prev, eventCategory: id }))
          }
          title="Select Category"
          label="Event Category"
        />

        <LabeledItem label="Include Donations">
          <Switch
            checked={!updatedEventData.withoutDonations}
            onCheckedChange={(value) =>
              setUpdatedEventData((prev) => ({
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
          disabled={!!updatedEventData.withoutDonations}
          value={updatedEventData.goalAmount}
          onChange={(e) =>
            setUpdatedEventData((prev) => ({
              ...prev,
              goalAmount: e.target.value,
            }))
          }
        />
        <LabeledItem label="Event Date">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="h-9 w-full items-start justify-start"
                variant="outline"
              >
                <CalendarIcon />
                {updatedEventData.date ? (
                  format(updatedEventData.date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={updatedEventData.date ?? undefined}
                onSelect={(date) =>
                  date &&
                  setUpdatedEventData((prev) => ({ ...prev, date: date }))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </LabeledItem>

        <Input
          placeholder="Enter event location"
          label="Event Location"
          value={updatedEventData.location ?? ""}
          onChange={(e) =>
            setUpdatedEventData((prev) => ({
              ...prev,
              location: e.target.value,
            }))
          }
        />

        <Textarea
          placeholder="Enter event description"
          label="Event Description"
          value={updatedEventData.description ?? ""}
          onChange={(e) =>
            setUpdatedEventData((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
        />
        <Textarea
          placeholder="Enter event purpose"
          label="Event Purpose"
          value={updatedEventData.purpose ?? ""}
          onChange={(e) =>
            setUpdatedEventData((prev) => ({
              ...prev,
              purpose: e.target.value,
            }))
          }
        />

        <ItemSelectBlock
          items={[{ id: "USD", name: "USD" }]}
          set={(id) =>
            setUpdatedEventData((prev) => ({ ...prev, currency: id }))
          }
          title="Select Currency"
          label="Donation Currency"
        />

        <Input
          type="file"
          label="Event Logo"
          accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
          onChange={handleLoadFile}
        />
        {updatedEventData.imageFile && (
          <Image
            width={200}
            height={200}
            className="col-span-2 justify-self-center"
            src={updatedEventData.imageFile.file}
            alt="Event Logo"
          />
        )}
      </div>
    </div>
  );
}
