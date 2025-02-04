"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import { LabeledItem } from "~/app/_components/ui/labeled-item";
import DatePicker from "~/app/_components/ui/date-picker";
import PhoneInput from "~/app/_components/ui/phone-input";
import CountrySelect from "~/app/_components/ui/country-select";

const defaultBirthday = new Date();
defaultBirthday.setFullYear(defaultBirthday.getFullYear() - 22);

const requiredFields = [
  "name",
  "companyEmail",
  "website",
  "description",
  "companyImage",
  "companyIBAN",
  "okpo",
  "phoneNumber",
  "dateOfBirth",
  "country",
  "firstName",
  "lastName",
];

type CompanyDetails = {
  name: string;
  companyEmail: string;
  website: string;
  description: string;
  companyImage?: {
    file: string;
    fileName: string;
  };
  companyIBAN: string;
  okpo: string;
  phoneNumber: string;
  dateOfBirth: Date;
  country: string;
  firstName: string;
  lastName: string;
};

export default function NewCompanyPage() {
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    name: "",
    companyEmail: "",
    website: "",
    description: "",
    companyImage: undefined,
    companyIBAN: "",
    okpo: "",
    phoneNumber: "",
    dateOfBirth: defaultBirthday,
    country: "",
    firstName: "",
    lastName: "",
  });

  const { mutate: createCompany } = api.company.createCompany.useMutation();

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
        setCompanyDetails((prev) => ({ ...prev, companyImage: parsedFile }));
      };
    }
  };
  const handleCreateCompany = async () => {
    createCompany({
      company: {
        name: companyDetails.name,
        companyEmail: companyDetails.companyEmail,
        website: companyDetails.website,
        description: companyDetails.description,
        image: companyDetails.companyImage,
        companyIBAN: companyDetails.companyIBAN,
        okpo: companyDetails.okpo,
        phoneNumber: companyDetails.phoneNumber,
        dateOfBirth: companyDetails.dateOfBirth,
        country: companyDetails.country,
        firstName: companyDetails.firstName,
        lastName: companyDetails.lastName,
      },
    });
  };

  return (
    <div className="h-full space-y-8 px-12 py-8">
      <div className="flex w-full flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">New Company</h1>
        <Button
          className="w-24 rounded-full"
          onClick={handleCreateCompany}
          disabled={requiredFields.some(
            (field) => !companyDetails[field as keyof typeof companyDetails],
          )}
        >
          Save
        </Button>
      </div>
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
          value={companyDetails.companyIBAN}
          onChange={(e) =>
            setCompanyDetails((prev) => ({
              ...prev,
              companyIBAN: e.target.value,
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
          value={companyDetails.description}
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
            src={companyDetails.companyImage.file}
            alt="Company Logo"
            className="col-span-2"
          />
        )}
      </form>
    </div>
  );
}
