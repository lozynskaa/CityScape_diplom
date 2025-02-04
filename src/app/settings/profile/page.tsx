"use client";
import { skipToken } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/app/_components/ui/avatar";
import { Input } from "~/app/_components/ui/input";
import { Spinner } from "~/app/_components/ui/spinner";
import { Textarea } from "~/app/_components/ui/textarea";
import { type User } from "~/server/db/schema";
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";

const requiredFields = ["name", "email"];

export default function Profile() {
  const [updatedUserData, setUpdatedUserData] = useState<
    Partial<User> & { imageFile?: { file: string; fileName: string } }
  >({
    name: "",
    email: "",
    image: "",
  });
  const session = useSession();

  const userId = session?.data?.user?.id;

  const {
    data: user,
    isFetching,
    isFetched,
  } = api.user.getUser.useQuery(userId ? { id: userId } : skipToken);
  const { mutateAsync: updateUser } = api.user.updateUser.useMutation();

  useEffect(() => {
    if (user) {
      setUpdatedUserData(user);
    }
  }, [isFetched]);

  if (isFetching || !user) {
    return <Spinner />;
  }

  const [firstName = "U", lastName = "U"] = user?.name
    ? user.name.split(" ")
    : ["U", "U"];

  const initials = firstName.charAt(0) + lastName.charAt(0);

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
        setUpdatedUserData((prev) => ({ ...prev, imageFile: parsedFile }));
      };
    }
  };

  const handleUpdateUser = async () => {
    const newUser = await updateUser({
      id: user.id,
      name: updatedUserData.name ?? "",
      email: updatedUserData.email,
      bio: updatedUserData.bio ?? "",
      image: updatedUserData.imageFile,
    });
    if (!newUser) return;
    setUpdatedUserData(newUser);
  };

  return (
    <div className="space-y-8 px-12 py-8">
      <h1 className="text-2xl font-bold text-gray-950">Profile</h1>
      <div className="flex flex-row items-center gap-x-4">
        <Avatar className="h-40 w-40 rounded-full object-cover">
          <AvatarImage src={user?.image ?? ""} alt="@shadcn" />
          <AvatarFallback>
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gray-200 text-center text-3xl font-bold uppercase">
              {initials}
            </div>
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-2xl font-bold">{user?.name}</h3>
          <p className="text-gray-600">{user?.email}</p>
        </div>
      </div>
      {user.bio && (
        <p className="text-sm text-gray-600">
          <b>Bio:</b>
          {user.bio}
        </p>
      )}
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-950">
          Edit profile details
        </h1>
        <Button
          onClick={handleUpdateUser}
          disabled={
            !requiredFields.every(
              (field) => updatedUserData[field as keyof User],
            )
          }
        >
          Save
        </Button>
      </div>

      <div className="grid w-full grid-cols-2 gap-5">
        <Input
          placeholder="Enter name"
          label="User Name"
          value={updatedUserData?.name ?? user?.name ?? ""}
          onChange={(e) =>
            setUpdatedUserData((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <Input
          placeholder="Enter email"
          label="User Email"
          value={updatedUserData?.email ?? user?.email}
          onChange={(e) =>
            setUpdatedUserData((prev) => ({
              ...prev,
              email: e.target.value,
            }))
          }
        />

        <Textarea
          placeholder="Enter bio"
          label="User Bio"
          wrapperClassName="col-span-2"
          onChange={(e) =>
            setUpdatedUserData((prev) => ({
              ...prev,
              bio: e.target.value,
            }))
          }
          value={updatedUserData?.bio ?? user?.bio ?? ""}
        />
        <Input
          type="file"
          label="Profile Image"
          accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
          onChange={handleLoadFile}
        />
        {updatedUserData?.imageFile && (
          <Image
            width={200}
            height={200}
            src={updatedUserData.imageFile.file}
            alt="Profile Image"
            className="col-span-2"
          />
        )}
      </div>
    </div>
  );
}
