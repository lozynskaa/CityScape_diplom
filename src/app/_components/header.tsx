import Link from "next/link";
import { auth, signOut } from "~/server/auth";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, SquareChartGantt, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import If from "./ui/if";

const headerLinks = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Posts",
    href: "/post",
  },
];

export default async function Header() {
  const session = await auth();
  const [firstName = "U", lastName = "U"] = session?.user?.name
    ? session.user.name.split(" ")
    : ["U", "U"];

  const initials = firstName.charAt(0) + lastName.charAt(0);

  const handleLogout = async () => {
    "use server";
    await signOut();
  };

  return (
    <header className="flex w-full flex-row items-center justify-between border-b border-gray-200 px-10 py-5">
      <Link href="/" className="flex-1 text-2xl font-bold">
        CityScape
      </Link>
      <nav className="flex flex-1 flex-row items-center justify-end gap-x-8">
        <ul className="hidden flex-row items-center gap-x-9 md:flex">
          {headerLinks.map((link) => (
            <li
              key={link.name}
              className="text-base font-medium text-gray-950 hover:text-gray-700"
            >
              <Link href={link.href}>{link.name}</Link>
            </li>
          ))}
        </ul>
        <If condition={!session?.user}>
          <Link href="/api/auth/sign-in">
            <Button className="w-22 h-8 rounded-full">Sign in</Button>
          </Link>
        </If>
        <If condition={!!session?.user}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={session!.user.image ?? ""} alt="@shadcn" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-10 w-[calc(100vw_-_64px)] md:w-40">
              <DropdownMenuLabel>{session!.user.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href="/settings/profile">
                  <DropdownMenuItem>
                    <User />
                    <span className="text-sm font-medium text-gray-950">
                      My Profile
                    </span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings/company">
                  <DropdownMenuItem>
                    <SquareChartGantt />
                    <span className="text-sm font-medium text-gray-950">
                      My Companies
                    </span>
                  </DropdownMenuItem>
                </Link>
                <form action={handleLogout}>
                  <Button
                    className="h-min w-full cursor-default appearance-none justify-start bg-transparent px-2 py-1.5 text-left shadow-none outline-none hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100"
                    type="submit"
                  >
                    <LogOut className="text-red-500" />
                    <span className="text-sm font-medium text-red-500">
                      Sign Out
                    </span>
                  </Button>
                </form>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </If>
      </nav>
    </header>
  );
}
