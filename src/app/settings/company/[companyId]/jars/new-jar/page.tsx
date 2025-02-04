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
import { useParams } from "next/navigation";

const requiredFields = [
  "name",
  "description",
  "goalAmount",
  "currency",
  "purpose",
  "jarImage",
];

export default function NewJarPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const [jarDetails, setJarDetails] = useState({
    name: "",
    description: "",
    goalAmount: "",
    currency: "",
    purpose: "",
    jarImage: "",
  });

  const { mutate: createJar } = api.company.createCompanyJar.useMutation();

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fileUrl = URL.createObjectURL(file!);
    if (file && fileUrl) {
      setJarDetails((prev) => ({ ...prev, jarImage: fileUrl }));
    }
  };

  const handleCreateJar = () => {
    createJar({
      name: jarDetails.name,
      description: jarDetails.description,
      goalAmount: +jarDetails.goalAmount || 0,
      currency: jarDetails.currency,
      purpose: jarDetails.purpose,
      image: jarDetails.jarImage,
      companyId,
    });
  };

  return (
    <div className="h-full space-y-8 px-12 py-8">
      <div className="flex w-full flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">New Jar</h1>
        <Button
          className="w-24 rounded-full"
          onClick={handleCreateJar}
          disabled={requiredFields.some(
            (field) => !jarDetails[field as keyof typeof jarDetails],
          )}
        >
          Save
        </Button>
      </div>
      <form className="my-auto grid w-full grid-cols-2 gap-4">
        <Input
          placeholder="Enter name"
          label="Jar Name"
          value={jarDetails.name}
          onChange={(e) =>
            setJarDetails((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <Input
          placeholder="Enter purpose"
          label="Jar Purpose"
          value={jarDetails.purpose}
          onChange={(e) =>
            setJarDetails((prev) => ({
              ...prev,
              purpose: e.target.value,
            }))
          }
        />
        <Input
          type="number"
          label="Jar Goal"
          onChange={(e) =>
            setJarDetails((prev) => ({ ...prev, goalAmount: e.target.value }))
          }
        />

        <DropdownMenu>
          <LabeledItem label="Currency">
            <DropdownMenuTrigger asChild>
              <Button className="w-full items-start justify-start bg-white text-gray-950 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100">
                {jarDetails.currency || "Select Currency"}
              </Button>
            </DropdownMenuTrigger>
          </LabeledItem>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="w-full"
                onClick={() =>
                  setJarDetails((prev) => ({
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

        <Textarea
          placeholder="Enter description"
          label="Jar Description"
          value={jarDetails.description}
          onChange={(e) =>
            setJarDetails((prev) => ({
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
        {jarDetails.jarImage && (
          <Image
            width={200}
            height={200}
            src={jarDetails.jarImage}
            alt="Company Logo"
          />
        )}
      </form>
    </div>
  );
}
