import * as React from "react";

import { cn } from "~/lib/utils";

type Props = React.ComponentProps<"input"> & {
  label?: string;
  wrapperClassName?: string;
};

const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ className, wrapperClassName, type, label, ...props }, ref) => {
    return (
      <div className={cn("w-full space-y-2", wrapperClassName)}>
        {label && (
          <p className="text-base font-medium text-gray-950">{label}</p>
        )}
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent bg-white px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
