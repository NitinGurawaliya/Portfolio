import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const isDevelopment = process.env.NODE_ENV !== "production";
const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://devfolio:devfolio@localhost:5432/devfolio?schema=public";

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"], // Only show errors, no query logs
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

// Optimize connection pool settings
if (isDevelopment) globalForPrisma.prisma = prisma;

export default prisma;
