"use client";

import { type Company } from "~/server/db/company.schema";
import DefaultCompanyImage from "~/assets/default-company-bg.png";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";

type Props = {
  company: Company;
};

export default function CompanyCard({ company }: Props) {
  return (
    <div className="w-full rounded-lg bg-white shadow">
      <Image
        src={company.imageUrl ?? DefaultCompanyImage}
        alt={company.name}
        onError={(e) => (e.currentTarget.src = DefaultCompanyImage.src)}
        width={250}
        height={140}
        className="h-[140px] min-w-[100%] rounded-lg object-cover"
      />
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
