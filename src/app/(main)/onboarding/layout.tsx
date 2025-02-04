import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
export default async function OnboardingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/sign-in");
  }
  return { children };
}
