import * as React from "react";

import { cn } from "@/shared/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-2xl border border-line bg-surface px-4 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-[#dceeea]",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
