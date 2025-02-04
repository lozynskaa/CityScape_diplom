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
import { LogOut, Settings, SquareChartGantt, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const headerLinks = [
  {
    name: "Projects",
    href: "/",
  },
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Impact",
    href: "/about",
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
      <h1 className="flex-1 text-2xl font-bold">CityScape</h1>
      <nav className="flex flex-1 flex-row items-center justify-end gap-x-8">
        <ul className="flex flex-row items-center gap-x-9">
          {headerLinks.map((link) => (
            <li
              key={link.name}
              className="text-base font-medium text-gray-950 hover:text-gray-700"
            >
              <Link href={link.href}>{link.name}</Link>
            </li>
          ))}
        </ul>
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={session.user.image ?? ""} alt="@shadcn" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User />
                  <span className="text-sm font-medium text-gray-950">
                    My Profile
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <SquareChartGantt />
                  <span className="text-sm font-medium text-gray-950">
                    My Projects
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings />
                  <span className="text-sm font-medium text-gray-950">
                    My Settings
                  </span>
                </DropdownMenuItem>
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
        ) : (
          <Link href="api/auth/sign-in">
            <Button className="w-22 h-8 rounded-full bg-emerald-400 text-gray-950 hover:bg-emerald-500 focus:bg-emerald-500 active:bg-emerald-500">
              Sign in
            </Button>
          </Link>
        )}
      </nav>
    </header>
  );
}
