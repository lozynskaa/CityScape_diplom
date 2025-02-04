"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";

const requiredFields = [
  "name",
  "companyEmail",
  "website",
  "description",
  "companyImage",
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
};

export default function NewCompanyPage() {
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    name: "",
    companyEmail: "",
    website: "",
    description: "",
    companyImage: undefined,
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
      name: companyDetails.name,
      companyEmail: companyDetails.companyEmail,
      website: companyDetails.website,
      description: companyDetails.description,
      image: companyDetails.companyImage,
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
