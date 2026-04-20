import type { Metadata } from "next";

import "@/app/globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Job Radar",
  description: "前端职位发现工作台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}
