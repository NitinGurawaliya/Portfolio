import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const isDevelopment = process.env.NODE_ENV !== "production";

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"], // Only show errors, no query logs
    // Optimize connection pool for better performance
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Optimize connection pool settings
if (isDevelopment) globalForPrisma.prisma = prisma;

export default prisma;
