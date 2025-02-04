"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { type Event } from "~/server/db/event.schema";
import { format } from "date-fns";

type Props = {
  event: Event;
};

export default function EventBlock({ event }: Props) {
  const { name, description, imageUrl, locationName, date, purpose, category } =
    event;

  return (
    <div className="space-y-2">
      <div className="flex flex-row items-center gap-x-4">
        <Avatar className="h-36 w-36 cursor-pointer rounded-full">
          <AvatarImage src={imageUrl ?? ""} alt="@shadcn" />
          <AvatarFallback className="text-5xl font-bold uppercase">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <h3 className="text-2xl font-bold">{name}</h3>
          <p className="text-sm text-gray-600">{category}</p>
          <p className="block text-sm text-gray-600 hover:text-gray-500">
            Location: {locationName}. Date: {format(date!, "dd/MM/yyyy")}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-600">Purpose: {purpose}</p>
      <p className="text-sm text-gray-600">Description: {description}</p>
    </div>
  );
}
