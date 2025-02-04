"use client";
import { type MutableRefObject, useEffect, useState } from "react";
import { type Company } from "~/server/db/company.schema";
import { Input } from "./ui/input";
import { LabeledItem } from "./ui/labeled-item";
import DatePicker from "./ui/date-picker";
import CountrySelect from "./ui/country-select";
import PhoneInput from "./ui/phone-input";
import { Textarea } from "./ui/textarea";
import Image from "next/image";

export type CreateCompanyDetails = Omit<Partial<Company>, "imageUrl"> & {
  imageFile?: { file: string; fileName: string };
};

type Props = {
  predefinedCompany?: Company | null;
  companyDetailsRef: MutableRefObject<CreateCompanyDetails>;
  disabledCallback: (state: CreateCompanyDetails) => boolean;
  setDisabled: (state: boolean) => void;
};

export default function CreateCompanyForm({
  predefinedCompany,
  companyDetailsRef,
  disabledCallback,
  setDisabled,
}: Props) {
  const [companyDetails, setCompanyDetails] = useState<CreateCompanyDetails>(
    {},
  );

  useEffect(() => {
    companyDetailsRef.current = companyDetails;
    if (disabledCallback) {
      const isDisabled = disabledCallback(companyDetails);
      setDisabled(isDisabled);
    }
  }, [companyDetails]);

  useEffect(() => {
    if (predefinedCompany) {
      setCompanyDetails(predefinedCompany);
    }
  }, [predefinedCompany]);

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
        setCompanyDetails((prev) => ({ ...prev, imageFile: parsedFile }));
      };
    }
  };

  return (
    <form className="my-auto grid w-full grid-cols-2 gap-4">
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
        value={companyDetails.email}
        onChange={(e) =>
          setCompanyDetails((prev) => ({
            ...prev,
            email: e.target.value,
          }))
        }
      />
      <Input
        placeholder="Enter name"
        label="Recipient First Name"
        value={companyDetails.firstName}
        onChange={(e) =>
          setCompanyDetails((prev) => ({
            ...prev,
            firstName: e.target.value,
          }))
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
        value={companyDetails.iBan}
        onChange={(e) =>
          setCompanyDetails((prev) => ({
            ...prev,
            iBan: e.target.value,
          }))
        }
      />
      <Input
        placeholder="Enter OKPO"
        label="Company OKPO"
        value={companyDetails.okpo}
        onChange={(e) =>
          setCompanyDetails((prev) => ({ ...prev, okpo: e.target.value }))
        }
      />
      <LabeledItem label="Company Phone Number">
        <PhoneInput
          value={companyDetails.phone}
          onChange={(value) =>
            setCompanyDetails((prev) => ({ ...prev, phone: value }))
          }
          country={companyDetails.country}
        />
      </LabeledItem>
      <Textarea
        placeholder="Enter description"
        label="Company Description"
        value={companyDetails.description ?? ""}
        onChange={(e) =>
          setCompanyDetails((prev) => ({
            ...prev,
            description: e.target.value,
          }))
        }
        wrapperClassName="col-span-2"
      />
      <Input
        type="text"
        label="Company website"
        value={companyDetails.website ?? ""}
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
      {companyDetails.imageFile && (
        <Image
          width={200}
          height={200}
          src={companyDetails.imageFile.file}
          alt="Company Logo"
          className="col-span-2 justify-self-center"
        />
      )}
    </form>
  );
}
