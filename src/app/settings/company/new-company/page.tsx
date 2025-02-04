"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";
import { LabeledItem } from "~/app/_components/ui/labeled-item";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";

const requiredFields = [
  "name",
  "companyEmail",
  "website",
  "description",
  "category",
  "companyImage",
];

export default function NewCompanyPage() {
  const [companyDetails, setCompanyDetails] = useState({
    name: "",
    companyEmail: "",
    website: "",
    description: "",
    category: "",
    companyImage: "",
  });

  const { mutate: createCompany } = api.company.createCompany.useMutation();

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fileUrl = URL.createObjectURL(file!);
    if (file && fileUrl) {
      setCompanyDetails((prev) => ({ ...prev, companyImage: fileUrl }));
    }
  };

  const handleCreateCompany = () => {
    createCompany({
      name: companyDetails.name,
      companyEmail: companyDetails.companyEmail,
      website: companyDetails.website,
      description: companyDetails.description,
      category: companyDetails.category,
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
        <Input
          type="text"
          label="Company website"
          onChange={(e) =>
            setCompanyDetails((prev) => ({ ...prev, website: e.target.value }))
          }
        />

        <DropdownMenu>
          <LabeledItem label="Main Category">
            <DropdownMenuTrigger asChild>
              <Button className="w-full items-start justify-start bg-white text-gray-950 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100">
                {companyDetails.category || "Select Category"}
              </Button>
            </DropdownMenuTrigger>
          </LabeledItem>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="w-full"
                onClick={() =>
                  setCompanyDetails((prev) => ({
                    ...prev,
                    category: "Category 1",
                  }))
                }
              >
                Category 1
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
          type="file"
          label="Company Logo"
          accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
          onChange={handleLoadFile}
        />
        {companyDetails.companyImage && (
          <Image
            width={200}
            height={200}
            src={companyDetails.companyImage}
            alt="Company Logo"
          />
        )}
      </form>
    </div>
  );
}
