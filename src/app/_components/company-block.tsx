"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { type Company } from "~/server/db/company.schema";

type Props = {
  company: Company;
};

export default function CompanyBlock({ company }: Props) {
  const { name, description, website, email, imageUrl } = company;
  const handleMessageCompany = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
    window.open(gmailUrl, "_blank");
  };
  return (
    <div className="flex flex-row items-center gap-x-4">
      <Avatar className="h-36 w-36 cursor-pointer rounded-full bg-gray-200">
        <AvatarImage src={imageUrl ?? ""} alt="@shadcn" />
        <AvatarFallback>
          <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gray-200 text-center text-3xl font-bold uppercase">
            {name.charAt(0)}
          </div>
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-1 flex-col space-y-1">
        <h3 className="text-2xl font-bold">{name}</h3>
        <p className="text-sm text-gray-600">{description}</p>
        <Link
          className="block break-all text-sm text-gray-600 underline hover:text-gray-500"
          href={website ?? "#"}
          target="_blank"
        >
          Company Website
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
