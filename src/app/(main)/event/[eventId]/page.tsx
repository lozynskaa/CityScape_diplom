"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ApplicantItem from "~/app/_components/applicant-item";
import DonorItem, { type DonationItemType } from "~/app/_components/donor-item";
import EventBlock from "~/app/_components/event-block";
import Map from "~/app/_components/map";
import { Button } from "~/app/_components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/app/_components/ui/carousel";
import If from "~/app/_components/ui/if";
import { Progress } from "~/app/_components/ui/progress";
import { FullPageSpinner } from "~/app/_components/ui/spinner";
import { currencyMap } from "~/lib/utils";
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

  const chartData = useMemo(() => {
    if (!event) {
      return [];
    }

    const donations = event.donationUsers ?? [];

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
  }, [event]);

  const isCurrentUserApplied = useMemo(
    () =>
      event
        ? event.eventUsers.some((user) => user.id === session?.data?.user?.id)
        : false,
    [event?.eventUsers, session?.data?.user?.id],
  );

  const eventMarkers = useMemo(() => {
    if (!event?.location) {
      return [];
    }
    const [longitude, latitude] = event.location;
    return [
      {
        title: event.name,
        id: event.id,
        lat: latitude,
        lng: longitude,
        loc: event?.location,
      },
    ];
  }, [event?.locationName]);

  if (isLoadingEvent || !event) {
    return <FullPageSpinner />;
  }

  const handleApplyToEvent = () => {
    mutate({ id: event.id });
  };

  const currencySymbol =
    currencyMap[(event.currency as keyof typeof currencyMap) || "USD"]?.symbol;

  return (
    <div className="w-full flex-1 space-y-8 px-12 py-8">
      <EventBlock event={event} />
      <If condition={!event.withoutDonations}>
        <div className="space-y-2">
          <p className="text-base font-medium text-gray-950">
            Raised {Math.round(+event.currentAmount)} {currencySymbol} of{" "}
            {Math.round(+event.goalAmount)} {currencySymbol}
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

        <If condition={!event.withoutDonations}>
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
        </If>

        <Map markers={eventMarkers} />
      </div>
    </div>
  );
}
