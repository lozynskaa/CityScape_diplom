import { redirect } from "next/navigation";

export default async function CompanyLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
}>) {
  const urlParams = await params;
  if (
    urlParams.companyId === "undefined" ||
    !urlParams.companyId ||
    urlParams.companyId === "null"
  ) {
    redirect("/settings/company");
  }
  return children;
}
