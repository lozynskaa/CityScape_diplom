"use client";

import { api } from "~/trpc/react";
import { useEffect, useMemo, useState } from "react";
import { skipToken } from "@tanstack/react-query";
import { DEFAULT_LOCATION } from "~/lib/location";
import Map from "../_components/map";

type UserLocation = {
  latitude: string;
  longitude: string;
};

export default function ClosestEventsList() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const { data: closestEvents } = api.event.getClosestEvents.useQuery(
    location?.latitude && location?.longitude
      ? {
          limit: 10,
          latitude: location?.latitude,
          longitude: location?.longitude,
        }
      : skipToken,
  );

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setLocation({
          latitude: `${position.coords.latitude}`,
          longitude: `${position.coords.longitude}`,
        }),
      () =>
        setLocation({
          latitude: `${DEFAULT_LOCATION.latitude}`,
          longitude: `${DEFAULT_LOCATION.longitude}`,
        }),
    );
  }, []);

  const eventMarkers = useMemo(() => {
    if (!closestEvents) {
      return [];
    }

    return closestEvents.map((event) => {
      const [longitude, latitude] = event.location;

      return {
        title: event.name,
        id: event?.id,
        lat: latitude,
        lng: longitude,
      };
    });
  }, [closestEvents]);

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold text-gray-950">Closest events</h1>
      <Map markers={eventMarkers} />
    </div>
  );
}
