"use client";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { type CompanyInfoState } from "./page";
import Image from "next/image";
import { LabeledItem } from "~/app/_components/ui/labeled-item";
import { Switch } from "~/app/_components/ui/switch";
import { ItemSelectBlock } from "~/app/_components/item-select";
import DatePicker from "~/app/_components/ui/date-picker";

type Props = {
  companyDetails: CompanyInfoState["event"];
  setCompanyDetails: React.Dispatch<
    React.SetStateAction<CompanyInfoState["event"]>
  >;
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
          set={(id) => setCompanyDetails((prev) => ({ ...prev, category: id }))}
          title={companyDetails.category ?? "Select Category"}
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
        <DatePicker
          selectedDate={companyDetails.eventDate}
          onSelect={(date) =>
            setCompanyDetails((prev) => ({ ...prev, eventDate: date }))
          }
        />
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
          title={companyDetails.currency ?? "Select Currency"}
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
