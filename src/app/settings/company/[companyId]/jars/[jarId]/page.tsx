"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Progress } from "~/app/_components/ui/progress";
import { type Jar } from "~/server/db/schema";
import { api } from "~/trpc/react";
import { Spinner } from "~/app/_components/ui/spinner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/app/_components/ui/carousel";
import DonorItem, { type DonationItemType } from "~/app/_components/donor-item";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";
import { LabeledItem } from "~/app/_components/ui/labeled-item";
import { Textarea } from "~/app/_components/ui/textarea";

export default function JarPage() {
  const { jarId } = useParams<{
    companyId: string;
    jarId: string;
  }>();

  const [updatedJarData, setUpdatedJarData] = useState<Partial<Jar>>({});
  const { data: currentJar = null, isFetching } = api.company.getJar.useQuery({
    id: jarId,
  });
  console.log("🚀 ~ JarPage ~ currentJar:", currentJar);
  const { mutateAsync: updateJar } = api.company.updateCompanyJar.useMutation();

  useEffect(() => {
    if (currentJar) {
      setUpdatedJarData({
        name: currentJar.name,
        description: currentJar.description,
        purpose: currentJar.purpose,
        goalAmount: currentJar.goalAmount,
        currency: currentJar.currency,
      });
    }
  }, [currentJar]);

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fileUrl = URL.createObjectURL(file!);
    if (file && fileUrl) {
      setUpdatedJarData((prev) => ({ ...prev, imageUrl: fileUrl }));
    }
  };

  const handleSave = async () => {
    const requiredKeys = [
      "name",
      "description",
      "purpose",
      "imageUrl",
      "goalAmount",
      "currency",
    ];
    if (
      currentJar &&
      updatedJarData &&
      requiredKeys.every((key) => key in currentJar || key in updatedJarData)
    ) {
      const result = await updateJar({
        id: currentJar?.id ?? "",
        name: updatedJarData?.name ?? currentJar?.name,
        description:
          updatedJarData?.description ?? currentJar?.description ?? "",
        purpose: updatedJarData?.purpose ?? currentJar?.purpose ?? "",
        image: updatedJarData?.imageUrl ?? currentJar?.imageUrl ?? "",
        goalAmount: +(
          updatedJarData?.goalAmount ??
          currentJar?.goalAmount ??
          "0"
        ),
        currency: updatedJarData?.currency ?? currentJar?.currency ?? "",
      });

      if (result) {
        setUpdatedJarData(result);
      }
    }
  };

  if (isFetching || !currentJar) {
    return <Spinner />;
  }

  return (
    <div className="space-y-8 px-12 py-8">
      <h1 className="text-2xl font-bold text-gray-950">Jar Dashboard</h1>

      <div className="space-y-2">
        <p className="text-base font-medium text-gray-950">
          Raised {Math.round(+currentJar.currentAmount)} {currentJar.currency}{" "}
          of {Math.round(+currentJar.goalAmount)} {currentJar.currency}
        </p>
        <Progress
          value={Math.round(
            (+currentJar.currentAmount / +currentJar.goalAmount) * 100,
          )}
        />
        <p className="text-sm text-gray-600">
          By {currentJar?.users?.length} peoples
        </p>
      </div>

      <h1 className="text-2xl font-bold text-gray-950">Latest donations</h1>

      {currentJar?.users?.length > 0 ? (
        <Carousel
          opts={{
            align: "start",
            axis: "x",
          }}
          orientation="vertical"
          className="h-[300px] w-full py-4"
        >
          <CarouselContent>
            {currentJar.users.map((userDonation, index) => (
              <CarouselItem key={index} className="basis-1/5">
                <DonorItem donation={userDonation as DonationItemType} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : (
        <p className="!mt-2 text-sm text-gray-600">No recent donations yet.</p>
      )}

      <div className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-950">Edit Jar</h1>

        <Button onClick={handleSave}>Save changes</Button>
      </div>

      <div className="grid w-full grid-cols-2 gap-5">
        <Input
          placeholder="Enter name"
          label="Jar Name"
          value={updatedJarData?.name ?? currentJar?.name}
          onChange={(e) =>
            setUpdatedJarData((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <Input
          placeholder="Enter purpose"
          label="Jar Purpose"
          value={updatedJarData?.purpose ?? currentJar?.purpose ?? ""}
          onChange={(e) =>
            setUpdatedJarData((prev) => ({ ...prev, purpose: e.target.value }))
          }
        />

        <Input
          placeholder="Enter goal amount"
          label="Jar Goal"
          value={updatedJarData?.goalAmount ?? currentJar?.goalAmount ?? ""}
          onChange={(e) =>
            setUpdatedJarData((prev) => ({
              ...prev,
              goalAmount: e.target.value,
            }))
          }
        />

        <DropdownMenu>
          <LabeledItem label="Currency">
            <DropdownMenuTrigger asChild>
              <Button className="w-full items-start justify-start bg-white text-gray-950 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100">
                {updatedJarData.currency ??
                  currentJar.currency ??
                  "Select Currency"}
              </Button>
            </DropdownMenuTrigger>
          </LabeledItem>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() =>
                  setUpdatedJarData((prev) => ({
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
          label="Company Description"
          wrapperClassName="col-span-2"
          onChange={(e) =>
            setUpdatedJarData((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          value={updatedJarData?.description ?? currentJar?.description ?? ""}
        />

        <Input
          type="file"
          label="Company Logo"
          accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
          onChange={handleLoadFile}
        />
        {updatedJarData?.imageUrl && (
          <Image
            width={200}
            height={200}
            src={updatedJarData?.imageUrl}
            alt="Company Logo"
            className="col-span-2"
          />
        )}
      </div>
    </div>
  );
}
