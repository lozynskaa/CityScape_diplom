"use client";
import Image from "next/image";
import { type MutableRefObject, useEffect, useMemo, useState } from "react";
import { useLoadingDebounce } from "~/hooks/use-debounce";
import { useWritableSearchParams } from "~/hooks/use-writable-search-params";
import { type Event } from "~/server/db/event.schema";
import { api } from "~/trpc/react";

import { skipToken } from "@tanstack/react-query";

import { AutoComplete } from "./autocomplete";
import { ItemSelectBlock } from "./item-select";
import Map, { type Marker } from "./map";
import DatePicker from "./ui/date-picker";
import If from "./ui/if";
import { Input } from "./ui/input";
import { LabeledItem } from "./ui/labeled-item";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import clsx from "clsx";

const eventCategories = [
  {
    name: "Charity",
    id: "Charity",
  },
  {
    name: "Education",
    id: "Education",
  },
  {
    name: "Environment",
    id: "Environment",
  },
  {
    name: "Health",
    id: "Health",
  },
  {
    name: "Volunteering",
    id: "Volunteering",
  },
  {
    name: "Other",
    id: "Other",
  },
];

const currencies = [
  {
    name: "USD",
    id: "USD",
    symbol: "$",
  },
  {
    name: "EUR",
    id: "EUR",
    symbol: "€",
  },
  {
    name: "GBP",
    id: "GBP",
    symbol: "£",
  },
  {
    name: "UAH",
    id: "UAH",
    symbol: "₴",
  },
  {
    name: "PLN",
    id: "PLN",
    symbol: "zł",
  },
];

export type CreateEventDetails = Omit<
  Partial<Event>,
  "imageUrl" | "location"
> & {
  imageFile?: { file: string; fileName: string };
  longitude?: string;
  latitude?: string;
};

type Props = {
  predefinedEvent?: Event;
  eventDetailsRef: MutableRefObject<CreateEventDetails>;
  disabledCallback: (state: CreateEventDetails) => boolean;
  setDisabled: (state: boolean) => void;
};

export default function CreateEventForm({
  predefinedEvent,
  eventDetailsRef,
  disabledCallback,
  setDisabled,
}: Props) {
  const [eventDetails, setEventDetails] = useState<CreateEventDetails>({});
  const { set, searchParams } = useWritableSearchParams();
  const locationValue = searchParams.get("location") ?? "";
  const { pending, debouncedValue: debouncedLocation } = useLoadingDebounce(
    locationValue,
    2000,
  );
  const { data: addressAutosuggestions = [], isLoading } =
    api.event.autosuggestEventAddress.useQuery(
      debouncedLocation
        ? {
            query: debouncedLocation,
          }
        : skipToken,
      {
        refetchOnWindowFocus: false,
      },
    );

  useEffect(() => {
    eventDetailsRef.current = eventDetails;
    if (disabledCallback) {
      const isDisabled = disabledCallback(eventDetails);
      setDisabled(isDisabled);
    }
  }, [eventDetails]);

  useEffect(() => {
    if (predefinedEvent) {
      setEventDetails(predefinedEvent);
    }
  }, [predefinedEvent]);

  const handleChangeLocationValue = (value: string) => {
    set("location", value);
  };

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

  const eventAddressMap = useMemo(
    () =>
      addressAutosuggestions.reduce(
        (acc, event) => {
          acc[event.id] = event;
          return acc;
        },
        {} as Record<string, (typeof addressAutosuggestions)[number]>,
      ),
    [addressAutosuggestions],
  );

  const mapMarkers = useMemo(() => {
    if (!eventDetails.latitude || !eventDetails.longitude) {
      return [];
    }
    return [
      {
        lat: Number(eventDetails.latitude) ?? 0,
        lng: Number(eventDetails.longitude) ?? 0,
        title: eventDetails.name,
      },
    ] as Marker[];
  }, [eventDetails.latitude, eventDetails.longitude, eventDetails.name]);

  return (
    <form className="grid w-full grid-cols-2 gap-5">
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
        items={eventCategories}
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
          placeholder="Pick a start date"
        />
      </LabeledItem>

      <LabeledItem label="Event Location">
        <AutoComplete
          items={addressAutosuggestions}
          isLoading={isLoading || pending}
          searchValue={locationValue}
          selectedValue={eventDetails.locationId ?? ""}
          onSearchValueChange={handleChangeLocationValue}
          onSelectedValueChange={(value) => {
            const location = eventAddressMap[value];
            if (location) {
              set("location", location.label);
              setEventDetails((prev) => ({
                ...prev,
                locationName: location.label,
                locationId: location.value,
                latitude: `${location.position.lat}`,
                longitude: `${location.position.lng}`,
              }));
            }
          }}
        />
      </LabeledItem>

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

      <div
        className={clsx(
          "col-span-2",
          mapMarkers.length === 0 && "invisible h-0",
        )}
      >
        <Map markers={mapMarkers} />
      </div>

      <ItemSelectBlock
        items={currencies}
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
    </form>
  );
}
