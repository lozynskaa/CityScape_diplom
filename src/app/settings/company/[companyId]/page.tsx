"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/app/_components/ui/avatar";
import { Button } from "~/app/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";
import { LabeledItem } from "~/app/_components/ui/labeled-item";
import { api } from "~/trpc/react";
import DefaultCompanyImage from "~/assets/default-company-bg.png";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { type Company } from "~/server/db/schema";
import { Spinner } from "~/app/_components/ui/spinner";
import { useParams } from "next/navigation";

export default function Company() {
  const { companyId } = useParams<{ companyId: string }>();

  const [updatedCompanyData, setUpdatedCompanyData] = useState<
    Partial<Company>
  >({});
  const { data: currentCompany = null, isFetching } =
    api.company.getCompany.useQuery({
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
        location: currentCompany.location,
        website: currentCompany.website,
        category: currentCompany.category,
      });
    }
  }, [currentCompany]);

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fileUrl = URL.createObjectURL(file!);
    if (file && fileUrl) {
      setUpdatedCompanyData((prev) => ({ ...prev, imageUrl: fileUrl }));
    }
  };

  const handleSave = async () => {
    const requiredKeys = [
      "name",
      "email",
      "description",
      "imageUrl",
      "location",
      "website",
      "category",
    ];
    if (
      currentCompany &&
      updatedCompanyData &&
      requiredKeys.every(
        (key) => key in updatedCompanyData || key in currentCompany,
      )
    ) {
      const result = await updateCompany({
        id: currentCompany?.id ?? "",
        name: updatedCompanyData?.name ?? currentCompany?.name,
        companyEmail: updatedCompanyData?.email ?? currentCompany?.email,
        description:
          updatedCompanyData?.description ?? currentCompany?.description ?? "",
        image: updatedCompanyData?.imageUrl ?? currentCompany?.imageUrl ?? "",
        location:
          updatedCompanyData?.location ?? currentCompany?.location ?? "",
        website: updatedCompanyData?.website ?? currentCompany?.website ?? "",
        category:
          updatedCompanyData?.category ?? currentCompany?.category ?? "",
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
          <p className="text-gray-600">
            {currentCompany?.category}, {currentCompany?.location}
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-5 md:flex-row">
        <div className="w-full space-y-2 rounded-lg bg-gray-100 p-4 md:basis-1/4">
          <p className="text-lg font-semibold">Total Raised</p>
          <p className="text-xl font-bold">${currentCompany?.totalRaised}</p>
        </div>
        <div className="w-full space-y-2 rounded-lg bg-gray-100 p-4 md:basis-1/4">
          <p className="text-lg font-semibold">Total Raised</p>
          <p className="text-xl font-bold">${currentCompany?.totalRaised}</p>
        </div>
        <div className="w-full space-y-2 rounded-lg bg-gray-100 p-4 md:basis-1/4">
          <p className="text-lg font-semibold">Total Raised</p>
          <p className="text-xl font-bold">${currentCompany?.totalRaised}</p>
        </div>
        <div className="w-full space-y-2 rounded-lg bg-gray-100 p-4 md:basis-1/4">
          <p className="text-lg font-semibold">Total Raised</p>
          <p className="text-xl font-bold">${currentCompany?.totalRaised}</p>
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
          value={updatedCompanyData?.name ?? currentCompany?.name}
          onChange={(e) =>
            setUpdatedCompanyData((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <Input
          placeholder="Enter email"
          label="Company Email"
          value={updatedCompanyData?.email ?? currentCompany?.email}
          onChange={(e) =>
            setUpdatedCompanyData((prev) => ({
              ...prev,
              email: e.target.value,
            }))
          }
        />
        <Input
          placeholder="Enter website"
          label="Company website"
          value={updatedCompanyData?.website ?? currentCompany?.website ?? ""}
          onChange={(e) =>
            setUpdatedCompanyData((prev) => ({
              ...prev,
              website: e.target.value,
            }))
          }
        />
        <Input
          placeholder="Enter location"
          label="Company location"
          value={updatedCompanyData?.location ?? currentCompany?.location ?? ""}
          onChange={(e) =>
            setUpdatedCompanyData((prev) => ({
              ...prev,
              location: e.target.value,
            }))
          }
        />
        <DropdownMenu>
          <LabeledItem label="Main Category">
            <DropdownMenuTrigger asChild>
              <Button className="w-full items-start justify-start bg-white text-gray-950 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100">
                {updatedCompanyData?.category ??
                  currentCompany?.category ??
                  "Select Category"}
              </Button>
            </DropdownMenuTrigger>
          </LabeledItem>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() =>
                  setUpdatedCompanyData((prev) => ({
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
        <Input
          type="file"
          label="Company Logo"
          accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
          onChange={handleLoadFile}
        />
        {updatedCompanyData?.imageUrl && (
          <Image
            width={200}
            height={200}
            src={updatedCompanyData?.imageUrl ?? currentCompany?.imageUrl}
            alt="Company Logo"
            className="col-span-2"
          />
        )}
        <Textarea
          placeholder="Enter description"
          label="Company Description"
          wrapperClassName="col-span-2"
          onChange={(e) =>
            setUpdatedCompanyData((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          value={
            updatedCompanyData?.description ?? currentCompany?.description ?? ""
          }
        />
      </div>
    </div>
  );
}
