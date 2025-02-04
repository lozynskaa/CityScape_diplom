"use client";
import { type MutableRefObject } from "react";
import CreateCompanyForm, {
  type CreateCompanyDetails,
} from "~/app/_components/create-company-form";

type Props = {
  details: MutableRefObject<CreateCompanyDetails>;
  disabledCallback: (state: CreateCompanyDetails) => boolean;
  setDisabled: (state: boolean) => void;
};

export function FirstStep({ details, disabledCallback, setDisabled }: Props) {
  return (
    <CreateCompanyForm
      companyDetailsRef={details}
      disabledCallback={disabledCallback}
      setDisabled={setDisabled}
    />
  );
}
