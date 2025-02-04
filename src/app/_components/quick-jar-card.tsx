"use client";

import { type Jar } from "~/server/db/schema";
import DefaultCompanyImage from "~/assets/default-company-bg.png";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";

type Props = {
  jar: Jar;
  settingsTab?: boolean;
};

export default function JarCard({ jar, settingsTab }: Props) {
  return (
    <div className="flex h-full w-full flex-row justify-between gap-x-8 rounded-lg bg-white py-4">
      <div className="flex w-full flex-col gap-y-4">
        <div>
          <p className="text-lg font-bold text-gray-950">{jar.name}</p>
          <p className="line-clamp-1 text-base text-gray-600">
            {jar.purpose ?? jar.description}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {jar.currentAmount}/{jar.goalAmount} {jar.currency}
          </p>
          <div className="h-3 w-full rounded-full bg-gray-100">
            <div
              className="h-3 rounded-full bg-emerald-400"
              style={{
                width: `${((jar.currentAmount ? +jar.currentAmount : 0) / (jar.goalAmount ? +jar.goalAmount : 0)) * 100}%`,
              }}
            />
          </div>
        </div>
        {settingsTab ? (
          <Link
            href={`/settings/company/${jar.companyId}/jars/${jar.id}`}
            className="w-30 inline-block h-10"
          >
            <Button
              className="w-30 h-10 rounded-full text-sm font-bold"
              variant="ghost"
            >
              View details
            </Button>
          </Link>
        ) : (
          <Link
            href={`/company/${jar.companyId}/jars/${jar.id}`}
            className="w-30 inline-block h-10"
          >
            <Button
              className="w-30 h-10 rounded-full text-sm font-bold"
              variant="ghost"
            >
              Quick donate
            </Button>
          </Link>
        )}
      </div>
      <Image
        src={jar.imageUrl ?? DefaultCompanyImage}
        alt={jar.name}
        onError={(e) => (e.currentTarget.src = DefaultCompanyImage.src)}
        width={356}
        height={200}
        className="h-50 w-auto max-w-[356px] rounded-lg object-cover"
      />
    </div>
  );
}
