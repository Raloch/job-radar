import * as React from "react";

import { cn } from "@/shared/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "border-accent bg-accent px-4 text-sm font-semibold text-white hover:bg-[#19685e]",
        variant === "secondary" &&
          "border-line bg-surface px-4 text-sm font-semibold text-ink hover:bg-[#f3f1eb]",
        variant === "ghost" && "border-transparent px-3 text-sm text-ink hover:bg-[#ece8de]",
        variant === "danger" &&
          "border-[#c7c2bb] bg-[#efede7] px-4 text-sm text-ink hover:bg-[#e2ddd4]",
        size === "sm" ? "h-9" : "h-10",
        className,
      )}
      {...props}
    />
  );
}
