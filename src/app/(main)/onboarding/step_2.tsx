"use client";
import { Button } from "~/app/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { type CompanyInfoState } from "./page";
import Image from "next/image";
import { LabeledItem } from "~/app/_components/ui/labeled-item";

type Props = {
  companyDetails: CompanyInfoState;
  setCompanyDetails: React.Dispatch<React.SetStateAction<CompanyInfoState>>;
  handleLoadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function SecondStep({
  companyDetails,
  setCompanyDetails,
  handleLoadFile,
}: Props) {
  return (
    <div className="flex w-96 flex-col items-center gap-y-4">
      <Input
        placeholder="Enter jar name"
        label="Jar Name"
        value={companyDetails.jarName}
        onChange={(e) =>
          setCompanyDetails((prev) => ({ ...prev, jarName: e.target.value }))
        }
      />
      <Input
        type="number"
        label="Jar Goal"
        onChange={(e) =>
          setCompanyDetails((prev) => ({
            ...prev,
            goalAmount: +e.target.value ? +e.target.value : 0,
          }))
        }
      />
      <Textarea
        placeholder="Enter jar description"
        label="Jar Description"
        value={companyDetails.jarDescription}
        onChange={(e) =>
          setCompanyDetails((prev) => ({
            ...prev,
            jarDescription: e.target.value,
          }))
        }
      />
      <Textarea
        placeholder="Enter jar purpose"
        label="Jar Purpose"
        value={companyDetails.jarPurpose}
        onChange={(e) =>
          setCompanyDetails((prev) => ({ ...prev, jarPurpose: e.target.value }))
        }
      />

      <DropdownMenu>
        <LabeledItem label="Main Category">
          <DropdownMenuTrigger asChild>
            <Button className="w-96 items-start justify-start bg-white text-gray-950 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100">
              {companyDetails.currency ?? "Select Currency"}
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
                  currency: "USD",
                }))
              }
            >
              USD
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Input
        type="file"
        label="Jar Logo"
        accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
        onChange={handleLoadFile}
      />
      {companyDetails.jarImage && (
        <Image
          width={200}
          height={200}
          src={companyDetails.jarImage}
          alt="Jar Logo"
        />
      )}
    </div>
  );
}
