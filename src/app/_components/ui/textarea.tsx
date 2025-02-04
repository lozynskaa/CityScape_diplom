import * as React from "react";

import { cn } from "~/lib/utils";

type Props = React.ComponentProps<"textarea"> & {
  label?: string;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <p className="text-base font-medium text-gray-950">{label}</p>
        )}
        <textarea
          className={cn(
            "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
