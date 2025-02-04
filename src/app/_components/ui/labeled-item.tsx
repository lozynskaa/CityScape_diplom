import * as React from "react";

import { cn } from "~/lib/utils";

type Props = React.PropsWithChildren<{
  label?: string;
  className?: string;
}>;

const LabeledItem = ({ children, label, className }: Props) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <p className={cn("text-base font-medium text-gray-950", className)}>
          {label}
        </p>
      )}
      {children}
    </div>
  );
};

LabeledItem.displayName = "LabeledItem";

export { LabeledItem };
