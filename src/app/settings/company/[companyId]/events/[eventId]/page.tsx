"use client";
import { useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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
import { currencyMap } from "~/lib/utils";

const requiredFields = [
  "name",
  "description",
  "goalAmount",
  "currency",
  "purpose",
  "category",
  "date",
  "locationName",
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
    refetch,
  } = api.event.getPrivateEvent.useQuery({
    id: eventId,
  });
  const { mutateAsync: updateEvent } = api.event.updateEvent.useMutation();

  const handleSave = async () => {
    if (currentEvent && !disabledCallback(eventDetailsRef.current)) {
      const [currentLongitude, currentLatitude] = currentEvent.location;
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
        locationName:
          eventDetailsRef.current?.locationName ??
          currentEvent?.locationName ??
          "",
        locationId:
          eventDetailsRef.current?.locationId ?? currentEvent?.locationId ?? "",
        date: eventDetailsRef.current?.date ?? currentEvent?.date ?? new Date(),
        category:
          eventDetailsRef.current?.category ?? currentEvent?.category ?? "",
        latitude:
          eventDetailsRef.current?.latitude ?? `${currentLatitude}` ?? "0",
        longitude:
          eventDetailsRef.current?.longitude ?? `${currentLongitude}` ?? "0",
      });

      if (result) {
        eventDetailsRef.current = result;
        await refetch();
      }
    }
  };

  const chartData = useMemo(() => {
    if (!currentEvent) {
      return [];
    }

    const donations = currentEvent.donationUsers ?? [];

    const data = donations.reduce(
      (acc, donation) => {
        if (!donation.donationAmount || !donation.donationDate) return acc;
        const date = new Date(donation.donationDate)
          .toISOString()
          .split("T")[0];
        const existing = acc.find((item) => item.date === date);
        if (existing) {
          existing.amount += Number(donation.donationAmount);
          existing.count += 1;
        } else if (date) {
          acc.push({
            date,
            amount: Number(donation.donationAmount),
            count: 1,
          });
        }
        return acc;
      },
      [] as { date: string; amount: number; count: number }[],
    );

    data.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return data;
  }, [currentEvent]);

  const currencySymbol =
    currencyMap[(currentEvent?.currency as keyof typeof currencyMap) || "USD"]
      ?.symbol;

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
          Raised {Math.round(+currentEvent.currentAmount)} {currencySymbol} of{" "}
          {Math.round(+currentEvent.goalAmount)} {currencySymbol}
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

      <div className="h-[300px] w-full">
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#82ca9d"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
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
