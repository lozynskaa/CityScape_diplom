"use client";

import { type Event } from "~/server/db/event.schema";
import DefaultCompanyImage from "~/assets/default-company-bg.png";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";

type Props = {
  event: Event & { isUserApplied?: boolean };
  settingsTab?: boolean;
  handleApplyToEvent?: (id: string) => void;
};

export default function EventCard({
  event,
  settingsTab,
  handleApplyToEvent,
}: Props) {
  const [localApplied, setLocalApplied] = useState(!!event.isUserApplied);

  const handleApply = () => {
    if (handleApplyToEvent) {
      handleApplyToEvent(event.id);
      setLocalApplied(true);
    }
  };
  return (
    <div className="flex h-full w-full flex-row justify-between gap-x-8 rounded-lg bg-white py-4">
      <div className="flex w-full flex-col gap-y-4">
        <div>
          <p className="text-lg font-bold text-gray-950">{event.name}</p>
          <p className="line-clamp-1 text-base text-gray-600">
            {event.purpose ?? event.description}
          </p>
          <p className="line-clamp-2 text-base text-gray-950">
            Location: {event.location}
            <br />
            Date:
            {format(event.date!, "dd/MM/yyyy")}
          </p>
        </div>
        {!event.withoutDonations && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {event.currentAmount}/{event.goalAmount} {event.currency}
            </p>
            <div className="h-3 w-full rounded-full bg-gray-100">
              <div
                className="h-3 rounded-full bg-emerald-400"
                style={{
                  width: `${((event.currentAmount ? +event.currentAmount : 0) / (event.goalAmount ? +event.goalAmount : 0)) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
        {settingsTab ? (
          <Link
            href={`/settings/company/${event.companyId}/events/${event.id}`}
            className="w-30 inline-block h-10"
          >
            <Button
              className="w-30 h-10 rounded-full text-sm font-bold"
              variant="ghost"
            >
              View details
            </Button>
          </Link>
        ) : (
          <div className="flex flex-row items-center gap-x-2">
            <Button
              onClick={handleApply}
              className="w-30 h-10 rounded-full text-sm font-bold"
              disabled={localApplied}
            >
              {localApplied ? "Applied" : "Apply to event"}
            </Button>
            <Link
              href={`/company/${event.companyId}/events/${event.id}`}
              className="w-30 inline-block h-10"
            >
              <Button
                className="w-30 h-10 rounded-full text-sm font-bold"
                variant="ghost"
              >
                Quick donate
              </Button>
            </Link>
          </div>
        )}
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
