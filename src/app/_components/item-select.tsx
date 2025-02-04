"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

type Props<T> = {
  set: (id: string) => void;
  items: T[];
};

export function ItemSelectBlock<T extends { id: string; name: string }>({
  set,
  items,
}: Props<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-96 items-start justify-start bg-white text-gray-950 hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100">
          Select Company
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {items.map((company) => (
            <DropdownMenuItem
              className="w-96"
              key={company.id}
              onClick={() => set(company.id)}
            >
              {company.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
