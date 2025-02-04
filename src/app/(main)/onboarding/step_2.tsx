"use client";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { type CompanyInfoState } from "./page";
import Image from "next/image";
import { LabeledItem } from "~/app/_components/ui/labeled-item";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/app/_components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "~/app/_components/ui/calendar";
import { format } from "date-fns";
import { Switch } from "~/app/_components/ui/switch";
import { ItemSelectBlock } from "~/app/_components/item-select";

type Props = {
  companyDetails: CompanyInfoState;
  setCompanyDetails: React.Dispatch<React.SetStateAction<CompanyInfoState>>;
  handleLoadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function SecondStep({
  companyDetails,
  setCompanyDetails,
  handleLoadFile,
}: Props) {
  return (
    <div className="grid grid-cols-1 flex-col items-center gap-4 md:grid-cols-2">
      <Input
        placeholder="Enter event name"
        label="Event Name"
        value={companyDetails.eventName}
        onChange={(e) =>
          setCompanyDetails((prev) => ({ ...prev, eventName: e.target.value }))
        }
      />
      <div className="w-96">
        <ItemSelectBlock
          items={[{ id: "Category 1", name: "Category 1" }]}
          set={(id) =>
            setCompanyDetails((prev) => ({ ...prev, eventCategory: id }))
          }
          title="Select Category"
          label="Event Category"
        />
      </div>
      <LabeledItem label="Include Donations">
        <Switch
          checked={companyDetails.includeDonations}
          onCheckedChange={(value) =>
            setCompanyDetails((prev) => ({ ...prev, includeDonations: value }))
          }
        />
      </LabeledItem>
      <Input
        placeholder="Enter event goal"
        type="number"
        label="Event Goal"
        disabled={!companyDetails.includeDonations}
        value={companyDetails.goalAmount}
        onChange={(e) =>
          setCompanyDetails((prev) => ({
            ...prev,
            goalAmount: +e.target.value ? +e.target.value : 0,
          }))
        }
      />
      <LabeledItem label="Event Date">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="h-9 w-96 items-start justify-start"
              variant="outline"
            >
              <CalendarIcon />
              {companyDetails.eventDate ? (
                format(companyDetails.eventDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={companyDetails.eventDate}
              onSelect={(date) =>
                date &&
                setCompanyDetails((prev) => ({ ...prev, eventDate: date }))
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </LabeledItem>

      <Input
        placeholder="Enter event location"
        label="Event Location"
        value={companyDetails.eventLocation}
        onChange={(e) =>
          setCompanyDetails((prev) => ({
            ...prev,
            eventLocation: e.target.value,
          }))
        }
      />

      <Textarea
        placeholder="Enter event description"
        label="Event Description"
        value={companyDetails.eventDescription}
        onChange={(e) =>
          setCompanyDetails((prev) => ({
            ...prev,
            eventDescription: e.target.value,
          }))
        }
      />
      <Textarea
        placeholder="Enter event purpose"
        label="Event Purpose"
        value={companyDetails.eventPurpose}
        onChange={(e) =>
          setCompanyDetails((prev) => ({
            ...prev,
            eventPurpose: e.target.value,
          }))
        }
      />
      <div className="w-96">
        <ItemSelectBlock
          items={[{ id: "USD", name: "USD" }]}
          set={(id) => setCompanyDetails((prev) => ({ ...prev, currency: id }))}
          title="Select Currency"
          label="Donation Currency"
        />
      </div>

      <Input
        type="file"
        label="Event Logo"
        accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
        onChange={handleLoadFile}
      />
      {companyDetails.eventImage && (
        <Image
          width={200}
          height={200}
          className="col-span-2 justify-self-center"
          src={companyDetails.eventImage.file}
          alt="Event Logo"
        />
      )}
    </div>
  );
}
