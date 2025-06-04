"use client";

import { type Company } from "~/server/db/company.schema";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";

type Props = {
  company: Company;
};

export default function CompanyCard({ company }: Props) {
  return (
    <div className="w-full rounded-lg bg-white shadow">
      {company.imageUrl ? (
        <Image
          src={company.imageUrl}
          alt={company.name}
          loading={"lazy"}
          width={250}
          height={140}
          className="h-[140px] min-w-[100%] rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-[140px] w-full items-center justify-center rounded-2xl bg-gray-200 text-center text-3xl font-bold uppercase">
          {company.name.charAt(0)}
        </div>
      )}

      <div className="space-y-3 p-4">
        <p className="text-lg font-medium text-gray-950">{company.name}</p>
        <p className="line-clamp-1 text-base text-gray-600">
          {company.description}
        </p>
        <Link
          href={`/company/${company.id}`}
          className="inline-block h-10 w-full"
        >
          <Button
            className="h-10 w-full rounded-full text-sm font-bold"
            variant="ghost"
          >
            View details
          </Button>
        </Link>
      </div>
    </div>
  );
}
