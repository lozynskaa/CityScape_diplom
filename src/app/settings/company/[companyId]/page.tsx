"use client";

import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/app/_components/ui/avatar";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import DefaultCompanyImage from "~/assets/default-company-bg.png";
import { type Company } from "~/server/db//company.schema";
import { Spinner } from "~/app/_components/ui/spinner";
import { useParams } from "next/navigation";
import CreateCompanyForm, {
  type CreateCompanyDetails,
} from "~/app/_components/create-company-form";

const requiredFields = [
  "name",
  "email",
  "website",
  "description",
  "imageFile",
  "iBan",
  "okpo",
  "phone",
  "dateOfBirth",
  "country",
  "firstName",
  "lastName",
] as const;

const disabledCallback = (state: CreateCompanyDetails) => {
  return !requiredFields.every((field) => state[field]);
};

export default function Company() {
  const { companyId } = useParams<{ companyId: string }>();
  const [disabled, setDisabled] = useState(true);
  const companyDetailsRef = useRef<CreateCompanyDetails>({});

  const {
    data: currentCompany = null,
    isFetching,
    refetch,
  } = api.company.getPrivateCompany.useQuery({
    id: companyId,
  });
  const { mutateAsync: updateCompany } =
    api.company.updateCompany.useMutation();

  useEffect(() => {
    if (currentCompany) {
      companyDetailsRef.current = currentCompany;
    }
  }, [currentCompany]);

  const handleSave = async () => {
    if (currentCompany && !disabledCallback(companyDetailsRef.current)) {
      const result = await updateCompany({
        id: currentCompany?.id ?? "",
        name: companyDetailsRef.current?.name ?? currentCompany?.name,
        companyEmail: companyDetailsRef.current?.email ?? currentCompany?.email,
        description:
          companyDetailsRef.current?.description ??
          currentCompany?.description ??
          "",
        image: companyDetailsRef.current?.imageFile,
        website:
          companyDetailsRef.current?.website ?? currentCompany?.website ?? "",
      });

      if (result) {
        companyDetailsRef.current = result;
        await refetch();
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
        <Avatar className="h-40 w-40 rounded-full bg-gray-200">
          <AvatarImage
            className="object-contain"
            src={currentCompany?.imageUrl ?? DefaultCompanyImage.src}
            alt="@shadcn"
          />
          <AvatarFallback>
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gray-200 text-center text-3xl font-bold uppercase">
              {currentCompany?.name?.charAt(0)}{" "}
            </div>
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-2xl font-bold">{currentCompany?.name}</h3>
          <p className="text-gray-600">{currentCompany?.description}</p>
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-5 md:flex-row">
        <div className="w-full space-y-2 rounded-lg bg-gray-100 p-4 md:basis-1/3">
          <p className="text-lg font-semibold">Total Events</p>
          <p className="text-xl font-bold">{currentCompany?.totalEvents}</p>
        </div>
        <div className="w-full space-y-2 rounded-lg bg-gray-100 p-4 md:basis-1/3">
          <p className="text-lg font-semibold">Total Donations</p>
          <p className="text-xl font-bold">{currentCompany?.totalDonations}</p>
        </div>
        <div className="w-full space-y-2 rounded-lg bg-gray-100 p-4 md:basis-1/3">
          <p className="text-lg font-semibold">Total Applicants</p>
          <p className="text-xl font-bold">{currentCompany?.totalApplicants}</p>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-950">
          Edit company details
        </h1>

        <Button onClick={handleSave} disabled={disabled}>
          Save changes
        </Button>
      </div>

      <CreateCompanyForm
        predefinedCompany={currentCompany}
        companyDetailsRef={companyDetailsRef}
        disabledCallback={disabledCallback}
        setDisabled={setDisabled}
      />
    </div>
  );
}
