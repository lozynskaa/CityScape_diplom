import { redirect } from "next/navigation";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { signIn } from "~/server/auth";
import { api } from "~/trpc/server";

async function handleSignIn(formData: FormData) {
  "use server";

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  await signIn("credentials", {
    redirect: true,
    redirectTo: "/",
    email,
    password,
  });
}

// Define a server action for creating a new account
async function handleSignUp(formData: FormData) {
  "use server";

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("firstName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const bio = formData.get("bio");

  // Custom logic to create a new user in your database
  const user = await api.user.createUser({
    name: `${firstName} ${lastName}`,
    email,
    password,
    bio: (bio as string) || "",
  });

  if (!user) {
    // Handle error
    return;
  }
}

export default async function SignUp() {
  return (
    <div className="flex flex-col items-center justify-center gap-y-3 pt-10">
      <div className="px-4 pt-5">
        <h1 className="text-2xl font-bold">Sign in or create an account</h1>
      </div>
      <div className="flex flex-col items-start gap-16 md:flex-row">
        <form className="flex flex-col gap-y-3 px-4 py-3" action={handleSignIn}>
          <Input
            name="email"
            label="Username or email"
            className="rounded-full"
          />
          <Input
            name="password"
            label="Password"
            type="password"
            className="rounded-full"
          />
          <Button
            className="w-96 rounded-full bg-emerald-400 text-sm font-bold text-gray-950"
            type="submit"
          >
            Sign In
          </Button>
        </form>
        <form className="flex flex-col gap-y-3 px-4 py-3" action={handleSignUp}>
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
            <Input
              name="firstName"
              label="First Name"
              className="rounded-full"
            />
            <Input name="lastName" label="Last Name" className="rounded-full" />
          </div>
          <Input name="email" label="Email" className="rounded-full" />
          <Input
            name="password"
            label="Password"
            type="password"
            className="rounded-full"
          />
          <Textarea name="bio" label="Bio" className="rounded-xl" />
          <Button
            className="w-96 rounded-full bg-emerald-400 text-sm font-bold text-gray-950"
            type="submit"
          >
            Create new account
          </Button>
        </form>
      </div>
    </div>
  );
}
