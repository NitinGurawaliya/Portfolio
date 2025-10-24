import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const isDevelopment = process.env.NODE_ENV !== "production";

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"], // Only show errors, no query logs
  });

if (isDevelopment) globalForPrisma.prisma = prisma;

export default prisma;
