import React from "react";
import { SidebarProvider } from "../_components/ui/sidebar";
import AppSidebar from "../_components/app-sidebar";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/sign-in");
  }
  return (
    <SidebarProvider
      className="relative"
      style={{
        height: "100%",
        minHeight: "calc(100svh - 64px)",
      }}
    >
      <AppSidebar />
      <main
        className="flex h-full flex-1 flex-col"
        style={{ height: "100%", minHeight: "calc(100svh - 64px)" }}
      >
        {children}
      </main>
    </SidebarProvider>
  );
}
