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
import { useParams, useRouter } from "next/navigation";

export default function Company() {
  const { companyId } = useParams<{ companyId: string }>();
  const router = useRouter();

  const [updatedCompanyData, setUpdatedCompanyData] = useState<
    Partial<Company> & { imageFile?: { fileName: string; file: string } }
  >({});
  const { data: currentCompany = null, isFetching } =
    api.company.getPrivateCompany.useQuery({
      id: companyId,
    });
  const { mutateAsync: updateCompany } =
    api.company.updateCompany.useMutation();
  const { mutateAsync: linkStripe } =
    api.company.linkStripeCompany.useMutation();

  useEffect(() => {
    if (currentCompany) {
      setUpdatedCompanyData({
        name: currentCompany.name,
        email: currentCompany.email,
        description: currentCompany.description,
        website: currentCompany.website,
        imageUrl: currentCompany.imageUrl,
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
    const requiredKeys = [
      "name",
      "email",
      "description",
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
        image: updatedCompanyData?.imageFile,
        website: updatedCompanyData?.website ?? currentCompany?.website ?? "",
      });

      if (result) {
        setUpdatedCompanyData(result);
      }
    }
  };

  const handleLinkStripe = async () => {
    if (!currentCompany) return;
    const stripeLinkage = await linkStripe({
      stripeAccountId: currentCompany.stripeAccountId,
      id: currentCompany.id,
    });
    router.push(stripeLinkage.url);
  };

  if (isFetching) {
    return <Spinner />;
  }

  return (
    <div className="w-full space-y-8 px-12 py-8">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-950">Company Dashboard</h1>
        <Button
          onClick={handleLinkStripe}
          disabled={!!currentCompany?.stripeLinked}
        >
          {currentCompany?.stripeLinked
            ? "Open Stripe Dashboard"
            : "Connect with Stripe"}
        </Button>
      </div>

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
          type="file"
          label="Company Logo"
          accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
          onChange={handleLoadFile}
        />
        {updatedCompanyData?.imageUrl && !updatedCompanyData?.imageFile && (
          <Image
            width={200}
            height={200}
            src={updatedCompanyData?.imageUrl}
            alt="Company Logo"
            className="col-span-2"
          />
        )}
        {updatedCompanyData?.imageFile && (
          <Image
            width={200}
            height={200}
            src={updatedCompanyData?.imageFile.file}
            alt="Company Logo"
            className="col-span-2"
          />
        )}
      </div>
    </div>
  );
}
