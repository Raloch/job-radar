import { cn } from "@/shared/lib/utils";

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "accent" | "salary" | "success" | "muted";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "default" && "border-line bg-[#f1eee7] text-ink",
        tone === "accent" && "border-[#a7cfc8] bg-[#e6f3f0] text-accent",
        tone === "salary" && "border-[#efcfac] bg-[#fff2e2] text-amber",
        tone === "success" && "border-[#b9d8c7] bg-[#ecf7f0] text-success",
        tone === "muted" && "border-[#dad7d0] bg-[#f7f5f0] text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
