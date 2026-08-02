import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; prismaSchemaFingerprint?: string };

// Bump this value with each Prisma migration so a running dev server never
// reuses a client instance generated from an older schema after hot reload.
const schemaFingerprint = "20260801130000_recovery_codes";

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

const cachedClient = globalForPrisma.prismaSchemaFingerprint === schemaFingerprint ? globalForPrisma.prisma : undefined;
export const db = cachedClient ?? createClient();

if (process.env.NODE_ENV !== "production") {
  const staleClient = globalForPrisma.prisma;
  globalForPrisma.prisma = db;
  globalForPrisma.prismaSchemaFingerprint = schemaFingerprint;
  if (staleClient && staleClient !== db) void staleClient.$disconnect();
}
