"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, LayoutGrid, RefreshCcwDot } from "lucide-react";

import { cn } from "@/shared/lib/utils";

const navItems = [
  { href: "/discover", label: "职位发现", icon: LayoutGrid },
  { href: "/my-jobs", label: "我的职位", icon: BriefcaseBusiness },
  { href: "/admin", label: "同步管理", icon: RefreshCcwDot },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex max-w-[1600px] flex-col px-4 pb-6 pt-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-[30px] border border-line bg-surface px-5 py-4 shadow-panel sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">
              Job Radar V1
            </p>
            <h1 className="mt-1 font-heading text-2xl font-semibold">前端职位发现工作台</h1>
          </div>
          <nav className="flex items-center gap-2 rounded-full bg-[#f0ece4] p-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
                    active ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink",
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
