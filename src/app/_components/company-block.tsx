"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { type Company } from "~/server/db/company.schema";

type Props = {
  company: Company;
};

export default function CompanyBlock({ company }: Props) {
  const {
    id: companyId,
    name,
    description,
    website,
    email,
    imageUrl,
  } = company;
  const handleMessageCompany = () => {
    console.log("message company:" + companyId);
  };
  return (
    <div className="flex flex-row items-center gap-x-4">
      <Avatar className="h-36 w-36 cursor-pointer rounded-full">
        <AvatarImage src={imageUrl ?? ""} alt="@shadcn" />
        <AvatarFallback className="text-5xl font-bold uppercase">
          {name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <h3 className="text-2xl font-bold">{name}</h3>
        <p className="text-sm text-gray-600">{description}</p>
        <Link
          className="block text-sm text-gray-600 hover:text-gray-500"
          href={website ?? "#"}
        >
          {website}
        </Link>
        <span className="text-sm text-gray-600">{email}</span>
      </div>
      <Button
        className="w-22 rounded-full font-bold"
        onClick={handleMessageCompany}
      >
        Message
      </Button>
    </div>
  );
}
