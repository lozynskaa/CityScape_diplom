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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";
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

export default function EventPage() {
  const { eventId } = useParams<{
    companyId: string;
    eventId: string;
  }>();

  const [updatedEventData, setUpdatedEventData] = useState<Partial<Event>>({});
  const {
    data: currentEvent = null,
    isFetching,
    isFetched,
  } = api.event.getEvent.useQuery({
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
    const fileUrl = URL.createObjectURL(file!);
    if (file && fileUrl) {
      setUpdatedEventData((prev) => ({ ...prev, imageUrl: fileUrl }));
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
        imageUrl: updatedEventData?.imageUrl ?? currentEvent?.imageUrl ?? "",
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

      <h1 className="text-2xl font-bold text-gray-950">Latest donations</h1>

      {currentEvent?.donationUsers?.length > 0 ? (
        <Carousel
          opts={{
            align: "start",
            axis: "x",
          }}
          orientation="vertical"
          className="h-[300px] w-full py-4"
        >
          <CarouselContent>
            {currentEvent.donationUsers.map((userDonation, index) => (
              <CarouselItem key={index} className="basis-1/5">
                <DonorItem donation={userDonation as DonationItemType} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : (
        <p className="!mt-2 text-sm text-gray-600">No recent donations yet.</p>
      )}

      <h1 className="text-2xl font-bold text-gray-950">Event applicants</h1>

      {currentEvent?.eventUsers?.length > 0 ? (
        <Carousel
          opts={{
            align: "start",
            axis: "x",
          }}
          orientation="vertical"
          className="h-[300px] w-full py-4"
        >
          <CarouselContent>
            {currentEvent.donationUsers.map((userDonation, index) => (
              <CarouselItem key={index} className="basis-1/5">
                <DonorItem donation={userDonation as DonationItemType} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : (
        <p className="!mt-2 text-sm text-gray-600">
          No users applied to event yet.
        </p>
      )}

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
        <DropdownMenu>
          <LabeledItem label="Main Category">
            <DropdownMenuTrigger asChild>
              <Button className="w-full items-start justify-start bg-white text-gray-950 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100">
                {updatedEventData.category ?? "Select Category"}
              </Button>
            </DropdownMenuTrigger>
          </LabeledItem>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="w-96"
                onClick={() =>
                  setUpdatedEventData((prev) => ({
                    ...prev,
                    category: "Category 1",
                  }))
                }
              >
                Category 1
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
              <Button className="w-full items-start justify-start bg-white text-gray-950 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100">
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

        <DropdownMenu>
          <LabeledItem label="Donation Currency">
            <DropdownMenuTrigger asChild>
              <Button className="w-full items-start justify-start bg-white text-gray-950 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100">
                {updatedEventData.currency ?? "Select Currency"}
              </Button>
            </DropdownMenuTrigger>
          </LabeledItem>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="w-96"
                onClick={() =>
                  setUpdatedEventData((prev) => ({
                    ...prev,
                    currency: "USD",
                  }))
                }
              >
                USD
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          type="file"
          label="Event Logo"
          accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
          onChange={handleLoadFile}
        />
        {updatedEventData.imageUrl && (
          <Image
            width={200}
            height={200}
            className="col-span-2 justify-self-center"
            src={updatedEventData.imageUrl}
            alt="Event Logo"
          />
        )}
      </div>
    </div>
  );
}
