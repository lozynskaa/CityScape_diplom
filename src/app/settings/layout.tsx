import React from "react";
import { SidebarProvider } from "../_components/ui/sidebar";
import AppSidebar from "../_components/app-sidebar";
export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
