import React from "react";
import Header from "../_components/header";

export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main className="flex w-full flex-1 flex-col items-center justify-center">
        {children}
      </main>
    </>
  );
}
