"use client";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { type CompanyInfoState } from "./page";
import Image from "next/image";
import { LabeledItem } from "~/app/_components/ui/labeled-item";
import DatePicker from "~/app/_components/ui/date-picker";
import PhoneInput from "~/app/_components/ui/phone-input";
import CountrySelect from "~/app/_components/ui/country-select";

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
      <LabeledItem label="Recipient Date of Birth">
        <DatePicker
          selectedDate={companyDetails.dateOfBirth}
          onSelect={(date) =>
            setCompanyDetails((prev) => ({ ...prev, dateOfBirth: date }))
          }
        />
      </LabeledItem>
      <LabeledItem label="Recipient Country" wrapperClassName="relative">
        <div className="flex w-full rounded-md border border-input bg-white">
          <CountrySelect
            onChange={(value) =>
              setCompanyDetails((prev) => ({ ...prev, country: value }))
            }
            value={companyDetails.country}
          />
          <span className="inline-flex items-center">
            {companyDetails.country}
          </span>
        </div>
      </LabeledItem>
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
      <LabeledItem label="Company Phone Number">
        <PhoneInput
          value={companyDetails.phoneNumber}
          onChange={(value) =>
            setCompanyDetails((prev) => ({ ...prev, phoneNumber: value }))
          }
          country={companyDetails.country}
        />
      </LabeledItem>
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
