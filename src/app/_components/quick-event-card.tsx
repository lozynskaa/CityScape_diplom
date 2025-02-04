"use client";

import { type Event } from "~/server/db/event.schema";
import DefaultCompanyImage from "~/assets/default-company-bg.png";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Progress } from "./ui/progress";

type Props = {
  event: Event & { isUserApplied?: boolean; paymentEnabled?: boolean | null };
  settingsTab?: boolean;
  handleApplyToEvent?: (id: string) => void;
  userId?: string;
};

export default function EventCard({
  event,
  settingsTab,
  handleApplyToEvent,
  userId,
}: Props) {
  const [localApplied, setLocalApplied] = useState(!!event.isUserApplied);

  const handleApply = () => {
    if (handleApplyToEvent) {
      handleApplyToEvent(event.id);
      setLocalApplied(true);
    }
  };

  const buttonsList = useMemo(() => {
    const baseList = [];

    if (settingsTab) {
      baseList.push(
        <Link
          key={"details"}
          href={`/settings/company/${event.companyId}/events/${event.id}`}
          className="w-30 inline-block h-10"
        >
          <Button
            className="w-30 h-10 rounded-full text-sm font-bold"
            variant="ghost"
          >
            View details
          </Button>
        </Link>,
      );
      return baseList;
    }
    if (userId) {
      baseList.push(
        <Button
          key={"apply"}
          onClick={handleApply}
          className="w-30 h-10 rounded-full text-sm font-bold"
          disabled={localApplied}
        >
          {localApplied ? "Applied" : "Apply to event"}
        </Button>,
      );
    }
    if (event?.paymentEnabled) {
      baseList.push(
        <Link
          key={"donate"}
          href={`/event/${event.id}/quick-donate`}
          className="w-30 inline-block h-10"
        >
          <Button
            disabled={!event.paymentEnabled}
            className="w-30 h-10 rounded-full text-sm font-bold"
            variant="ghost"
          >
            Quick donate
          </Button>
        </Link>,
      );
    }
    baseList.push(
      <Link
        href={`/event/${event.id}`}
        className="w-30 inline-block h-10"
        key={"learn"}
      >
        <Button
          className="w-30 h-10 rounded-full text-sm font-bold"
          variant="ghost"
        >
          Learn More
        </Button>
      </Link>,
    );
    return baseList;
  }, [userId, event, localApplied, settingsTab]);

  return (
    <div className="flex h-full w-full flex-col gap-8 rounded-lg bg-white p-4 shadow-md md:flex-row md:justify-between">
      <div className="flex w-full flex-col gap-y-4">
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          <p className="col-span-2 text-lg font-bold text-gray-950">
            {event.name}
          </p>
          <p className="line-clamp-1 text-base text-gray-950">
            {event.purpose}
          </p>
          <p className="line-clamp-1 text-base text-gray-600">
            {event.description}
          </p>
          <p className="line-clamp-1 text-base text-gray-950">
            Location: {event.locationName}
          </p>
          <p className="line-clamp-1 text-base text-gray-950">
            Date:
            {format(event.date!, "dd/MM/yyyy")}
          </p>
        </div>
        {!event.withoutDonations && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {event.currentAmount}/{event.goalAmount} {event.currency}
            </p>
            <Progress
              value={
                ((event.currentAmount ? +event.currentAmount : 0) /
                  (event.goalAmount ? +event.goalAmount : 0)) *
                100
              }
            />
          </div>
        )}

        <div className="flex flex-row items-center gap-x-2">
          {buttonsList.map((button) => button)}
        </div>
      </div>
      <Image
        src={event.imageUrl ?? DefaultCompanyImage}
        alt={event.name}
        onError={(e) => (e.currentTarget.src = DefaultCompanyImage.src)}
        width={356}
        height={200}
        className="h-auto max-h-[200px] w-full max-w-[356px] rounded-lg object-contain"
      />
    </div>
  );
}
