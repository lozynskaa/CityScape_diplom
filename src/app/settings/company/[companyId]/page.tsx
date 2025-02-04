"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/app/_components/ui/avatar";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import DefaultCompanyImage from "~/assets/default-company-bg.png";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { type Company } from "~/server/db//company.schema";
import { Spinner } from "~/app/_components/ui/spinner";
import { useParams } from "next/navigation";
import { LabeledItem } from "~/app/_components/ui/labeled-item";
import DatePicker from "~/app/_components/ui/date-picker";
import PhoneInput from "~/app/_components/ui/phone-input";
import CountrySelect from "~/app/_components/ui/country-select";

const requiredFields = [
  "name",
  "companyEmail",
  "website",
  "description",
  "companyImage",
  "iBan",
  "okpo",
  "phone",
  "dateOfBirth",
  "country",
  "firstName",
  "lastName",
];

export default function Company() {
  const { companyId } = useParams<{ companyId: string }>();

  const [updatedCompanyData, setUpdatedCompanyData] = useState<
    Partial<Company> & { imageFile?: { fileName: string; file: string } }
  >({});
  const { data: currentCompany = null, isFetching } =
    api.company.getPrivateCompany.useQuery({
      id: companyId,
    });
  const { mutateAsync: updateCompany } =
    api.company.updateCompany.useMutation();

  useEffect(() => {
    if (currentCompany) {
      setUpdatedCompanyData({
        name: currentCompany.name,
        email: currentCompany.email,
        description: currentCompany.description,
        website: currentCompany.website,
        imageUrl: currentCompany.imageUrl,
        imageFile: undefined,
        iBan: currentCompany.iBan,
        okpo: currentCompany.okpo,
        phone: currentCompany.phone,
        dateOfBirth: currentCompany.dateOfBirth,
        country: currentCompany.country,
        firstName: currentCompany.firstName,
        lastName: currentCompany.lastName,
      });
    }
  }, [currentCompany]);

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
        setUpdatedCompanyData((prev) => ({ ...prev, imageFile: parsedFile }));
      };
    }
  };

  const handleSave = async () => {
    if (
      currentCompany &&
      updatedCompanyData &&
      requiredFields.every(
        (key) => key in updatedCompanyData || key in currentCompany,
      )
    ) {
      const result = await updateCompany({
        id: currentCompany?.id ?? "",
        name: updatedCompanyData?.name ?? currentCompany?.name,
        companyEmail: updatedCompanyData?.email ?? currentCompany?.email,
        description:
          updatedCompanyData?.description ?? currentCompany?.description ?? "",
        image: updatedCompanyData?.imageFile,
        website: updatedCompanyData?.website ?? currentCompany?.website ?? "",
      });

      if (result) {
        setUpdatedCompanyData(result);
      }
    }
  };

  if (isFetching) {
    return <Spinner />;
  }

  return (
    <div className="w-full space-y-8 px-12 py-8">
      <h1 className="text-2xl font-bold text-gray-950">Company Dashboard</h1>

      <div className="flex flex-row items-center gap-x-4">
        <Avatar className="h-40 w-40 rounded-full object-cover">
          <AvatarImage
            src={currentCompany?.imageUrl ?? DefaultCompanyImage.src}
            alt="@shadcn"
          />
          <AvatarFallback>
            <Avatar className="h-40 w-40 rounded-full object-cover">
              <AvatarImage src={DefaultCompanyImage.src} alt="@shadcn" />
            </Avatar>
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-2xl font-bold">{currentCompany?.name}</h3>
          <p className="text-gray-600">{currentCompany?.description}</p>
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-5 md:flex-row">
        <div className="w-full space-y-2 rounded-lg bg-gray-100 p-4 md:basis-1/3">
          <p className="text-lg font-semibold">Total Raised</p>
          <p className="text-xl font-bold">${currentCompany?.totalRaised}</p>
        </div>
        <div className="w-full space-y-2 rounded-lg bg-gray-100 p-4 md:basis-1/3">
          <p className="text-lg font-semibold">Total Donations</p>
          <p className="text-xl font-bold">${currentCompany?.totalDonations}</p>
        </div>
        <div className="w-full space-y-2 rounded-lg bg-gray-100 p-4 md:basis-1/3">
          <p className="text-lg font-semibold">Total Applicants</p>
          <p className="text-xl font-bold">
            ${currentCompany?.totalApplicants}
          </p>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-950">
          Edit company details
        </h1>

        <Button onClick={handleSave}>Save changes</Button>
      </div>

      <div className="grid w-full grid-cols-2 gap-5">
        <Input
          placeholder="Enter name"
          label="Company Name"
          value={updatedCompanyData.name}
          onChange={(e) =>
            setUpdatedCompanyData((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <Input
          placeholder="Enter email"
          label="Company Email"
          value={updatedCompanyData.email}
          onChange={(e) =>
            setUpdatedCompanyData((prev) => ({
              ...prev,
              companyEmail: e.target.value,
            }))
          }
        />
        <Input
          placeholder="Enter name"
          label="Recipient First Name"
          value={updatedCompanyData.firstName}
          onChange={(e) =>
            setUpdatedCompanyData((prev) => ({
              ...prev,
              firstName: e.target.value,
            }))
          }
        />
        <Input
          placeholder="Enter name"
          label="Recipient Last Name"
          value={updatedCompanyData.lastName}
          onChange={(e) =>
            setUpdatedCompanyData((prev) => ({
              ...prev,
              lastName: e.target.value,
            }))
          }
        />
        <LabeledItem label="Recipient Date of Birth">
          <DatePicker
            onSelect={(date) =>
              setUpdatedCompanyData((prev) => ({
                ...prev,
                dateOfBirth: date,
              }))
            }
            selectedDate={updatedCompanyData.dateOfBirth}
          />
        </LabeledItem>

        <LabeledItem label="Recipient Country" wrapperClassName="relative">
          <div className="flex w-full rounded-md border border-input bg-white">
            <CountrySelect
              onChange={(value) =>
                setUpdatedCompanyData((prev) => ({ ...prev, country: value }))
              }
              value={updatedCompanyData.country}
            />
            <span className="inline-flex items-center">
              {updatedCompanyData.country}
            </span>
          </div>
        </LabeledItem>

        <Input
          placeholder="Enter IBAN"
          label="Company IBAN"
          wrapperClassName="col-span-2"
          value={updatedCompanyData.iBan}
          onChange={(e) =>
            setUpdatedCompanyData((prev) => ({
              ...prev,
              iBan: e.target.value,
            }))
          }
        />
        <Input
          placeholder="Enter OKPO"
          label="Company OKPO"
          value={updatedCompanyData.okpo}
          onChange={(e) =>
            setUpdatedCompanyData((prev) => ({ ...prev, okpo: e.target.value }))
          }
        />
        <LabeledItem label="Company Phone Number">
          <PhoneInput
            value={updatedCompanyData.phone}
            onChange={(value) =>
              setUpdatedCompanyData((prev) => ({ ...prev, phone: value }))
            }
            country={updatedCompanyData.country}
          />
        </LabeledItem>
        <Textarea
          placeholder="Enter description"
          label="Company Description"
          value={updatedCompanyData.description ?? ""}
          onChange={(e) =>
            setUpdatedCompanyData((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          wrapperClassName="col-span-2"
        />
        <Input
          type="text"
          label="Company website"
          value={updatedCompanyData.website ?? ""}
          onChange={(e) =>
            setUpdatedCompanyData((prev) => ({
              ...prev,
              website: e.target.value,
            }))
          }
        />
        <Input
          type="file"
          label="Company Logo"
          accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
          onChange={handleLoadFile}
        />
        {updatedCompanyData?.imageFile && (
          <Image
            width={200}
            height={200}
            src={updatedCompanyData?.imageFile.file}
            alt="Company Logo"
            className="col-span-2 justify-self-center"
          />
        )}
      </div>
    </div>
  );
}
