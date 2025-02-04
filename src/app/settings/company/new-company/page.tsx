"use client";

import { useRef, useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import CreateCompanyForm, {
  type CreateCompanyDetails,
} from "~/app/_components/create-company-form";

const defaultBirthday = new Date();
defaultBirthday.setFullYear(defaultBirthday.getFullYear() - 22);

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

export default function NewCompanyPage() {
  const [disabled, setDisabled] = useState(true);
  const companyDetailsRef = useRef<CreateCompanyDetails>({});
  const { mutate: createCompany } = api.company.createCompany.useMutation();

  const handleCreateCompany = async () => {
    if (!disabledCallback(companyDetailsRef.current)) {
      const filledCompanyDetails =
        companyDetailsRef.current as Required<CreateCompanyDetails>;

      createCompany({
        company: {
          name: filledCompanyDetails.name,
          companyEmail: filledCompanyDetails.email,
          website: filledCompanyDetails.website ?? "",
          description: filledCompanyDetails.description ?? "",
          image: filledCompanyDetails.imageFile,
          companyIBAN: filledCompanyDetails.iBan,
          okpo: filledCompanyDetails.okpo,
          phoneNumber: filledCompanyDetails.phone,
          dateOfBirth: filledCompanyDetails.dateOfBirth,
          country: filledCompanyDetails.country,
          firstName: filledCompanyDetails.firstName,
          lastName: filledCompanyDetails.lastName,
        },
      });
    }
  };

  return (
    <div className="h-full space-y-8 px-12 py-8">
      <div className="flex w-full flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">New Company</h1>
        <Button
          className="w-24 rounded-full"
          onClick={handleCreateCompany}
          disabled={disabled}
        >
          Save
        </Button>
      </div>
      <CreateCompanyForm
        companyDetailsRef={companyDetailsRef}
        disabledCallback={disabledCallback}
        setDisabled={setDisabled}
      />
    </div>
  );
}
