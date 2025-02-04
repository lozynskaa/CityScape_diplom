"use client";
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
import { Button } from "~/app/_components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "~/app/_components/ui/calendar";
import { format } from "date-fns/format";

type Props = {
  companyDetails: CompanyInfoState["company"];
  setCompanyDetails: React.Dispatch<
    React.SetStateAction<CompanyInfoState["company"]>
  >;
  handleLoadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function FirstStep({
  companyDetails,
  setCompanyDetails,
  handleLoadFile,
}: Props) {
  return (
    <div className="grid grid-cols-1 flex-col items-center gap-4 md:grid-cols-2">
      <Input
        placeholder="Enter name"
        label="Company Name"
        value={companyDetails.name}
        onChange={(e) =>
          setCompanyDetails((prev) => ({ ...prev, name: e.target.value }))
        }
      />
      <Input
        placeholder="Enter email"
        label="Company Email"
        value={companyDetails.companyEmail}
        onChange={(e) =>
          setCompanyDetails((prev) => ({
            ...prev,
            companyEmail: e.target.value,
          }))
        }
      />
      <Input
        placeholder="Enter name"
        label="Recipient First Name"
        value={companyDetails.firstName}
        onChange={(e) =>
          setCompanyDetails((prev) => ({ ...prev, firstName: e.target.value }))
        }
      />
      <Input
        placeholder="Enter name"
        label="Recipient Last Name"
        value={companyDetails.lastName}
        onChange={(e) =>
          setCompanyDetails((prev) => ({ ...prev, lastName: e.target.value }))
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
              {companyDetails.dateOfBirth ? (
                format(companyDetails.dateOfBirth, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={companyDetails.dateOfBirth}
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
        placeholder="Enter country code"
        label="Recipient Country Code"
        value={companyDetails.country}
        onChange={(e) =>
          e.target.value.length <= 3 &&
          setCompanyDetails((prev) => ({ ...prev, country: e.target.value }))
        }
      />
      <Input
        placeholder="Enter IBAN"
        label="Company IBAN"
        wrapperClassName="col-span-2"
        value={companyDetails.companyIBAN}
        onChange={(e) =>
          setCompanyDetails((prev) => ({
            ...prev,
            companyIBAN: e.target.value,
          }))
        }
      />
      <Input
        placeholder="Enter Company OKPO"
        label="Company OKPO"
        value={companyDetails.okpo}
        onChange={(e) =>
          setCompanyDetails((prev) => ({
            ...prev,
            okpo: e.target.value,
          }))
        }
      />
      <Input
        placeholder="Enter company phone"
        label="Company Phone"
        value={companyDetails.phoneNumber}
        type="number"
        onChange={(e) =>
          setCompanyDetails((prev) => ({
            ...prev,
            phoneNumber: e.target.value,
          }))
        }
      />
      <Textarea
        placeholder="Enter description"
        label="Company Description"
        wrapperClassName="col-span-2"
        value={companyDetails.description}
        onChange={(e) =>
          setCompanyDetails((prev) => ({
            ...prev,
            description: e.target.value,
          }))
        }
      />
      <Input
        type="text"
        label="Company website"
        onChange={(e) =>
          setCompanyDetails((prev) => ({ ...prev, website: e.target.value }))
        }
      />
      <Input
        type="file"
        label="Company Logo"
        accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
        onChange={handleLoadFile}
      />
      {companyDetails.companyImage && (
        <Image
          width={200}
          height={200}
          className="col-span-2 justify-self-center"
          src={companyDetails.companyImage.file}
          alt="Company Logo"
        />
      )}
    </div>
  );
}
