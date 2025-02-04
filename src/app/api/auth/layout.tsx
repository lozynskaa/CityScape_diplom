import Link from "next/link";
import React from "react";

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className="flex w-full flex-row items-center justify-between border-b border-gray-200 px-10 py-5">
        <Link href="/" className="flex-1 text-2xl font-bold">
          CityScape
        </Link>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center">
        {children}
      </div>
    </>
  );
}
