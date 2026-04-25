import { PrismaClient } from "@prisma/client";

declare global {
  var __jobRadarPrisma__: PrismaClient | undefined;
}

export function getPrismaClient() {
  if (!globalThis.__jobRadarPrisma__) {
    globalThis.__jobRadarPrisma__ = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return globalThis.__jobRadarPrisma__;
}
