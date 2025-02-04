"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { LabeledItem } from "./ui/labeled-item";

type Props<T> = {
  set: (id: string) => void;
  items: T[];
  title: string;
  label?: string;
};

export function ItemSelectBlock<T extends { id: string; name: string }>({
  set,
  items,
  title,
  label,
}: Props<T>) {
  return (
    <DropdownMenu>
      <LabeledItem label={label}>
        <DropdownMenuTrigger asChild>
          <Button
            className="h9 w-full items-start justify-start"
            variant="outline"
          >
            {title}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            {items.map((company) => (
              <DropdownMenuItem
                className="w-full"
                key={company.id}
                onClick={() => set(company.id)}
              >
                {company.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </LabeledItem>
    </DropdownMenu>
  );
}
