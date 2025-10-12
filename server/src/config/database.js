// server/src/config/database.js
import { PrismaClient } from "@prisma/client";

const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
let prisma = null;

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  return new PrismaClient({
    log: ["warn", "error"],
    datasources: {
      db: { url: databaseUrl },
    },
  });
}

function getPrismaClient() {
  if (!prisma) {
    prisma = createPrismaClient();

    // Graceful shutdown only for local/dev
    if (!isLambda) {
      process.on("beforeExit", async () => {
        await prisma?.$disconnect();
      });
    }
  }
  return prisma;
}

export { getPrismaClient };
export default getPrismaClient();
