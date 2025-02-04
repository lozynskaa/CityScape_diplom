"use client";
import { Button } from "~/app/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { type CompanyInfoState } from "./page";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { LabeledItem } from "~/app/_components/ui/labeled-item";
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
    <div className="flex w-96 flex-col items-center gap-y-4">
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

      <DropdownMenu>
        <LabeledItem label="Main Category">
          <DropdownMenuTrigger asChild>
            <Button className="w-96 items-start justify-start bg-white text-gray-950 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100">
              {companyDetails.category || "Select Category"}
            </Button>
          </DropdownMenuTrigger>
        </LabeledItem>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="w-96"
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
    </div>
  );
}
