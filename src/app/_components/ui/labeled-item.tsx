import * as React from "react";

import { cn } from "~/lib/utils";

type Props = React.PropsWithChildren<{
  label?: string;
  className?: string;
  wrapperClassName?: string;
}>;

const LabeledItem = ({
  children,
  label,
  className,
  wrapperClassName,
}: Props) => {
  return (
    <div className={cn("w-full space-y-2", wrapperClassName)}>
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
