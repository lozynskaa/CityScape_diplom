import React, { Suspense } from "react";
import Header from "../_components/header";
import { Spinner } from "../_components/ui/spinner";
import { SessionProvider } from "next-auth/react";

export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <Suspense fallback={<Spinner />}>
        <SessionProvider>
          <main className="flex w-full flex-1 flex-col items-center justify-center">
            {children}
          </main>
        </SessionProvider>
      </Suspense>
    </>
  );
}
