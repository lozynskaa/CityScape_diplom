"use client";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { type CompanyInfoState } from "./page";
import Image from "next/image";

type Props = {
  companyDetails: CompanyInfoState;
  setCompanyDetails: React.Dispatch<React.SetStateAction<CompanyInfoState>>;
  handleLoadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function FirstStep({
  companyDetails,
  setCompanyDetails,
  handleLoadFile,
}: Props) {
  return (
    <div className="grid grid-cols-1 flex-col items-center gap-4 md:grid-cols-2">
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
        wrapperClassName="col-span-2"
        value={companyDetails.description}
        onChange={(e) =>
          setCompanyDetails((prev) => ({
            ...prev,
            description: e.target.value,
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
          className="col-span-2 justify-self-center"
          src={companyDetails.companyImage.file}
          alt="Company Logo"
        />
      )}
    </div>
  );
}
