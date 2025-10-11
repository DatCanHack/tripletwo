// server/src/config/database.js
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

// Configure for serverless environment
if (isLambda) {
  neonConfig.webSocketConstructor = ws;
  neonConfig.useSecureWebSocket = true;
  neonConfig.pipelineConnect = false;
}

let prisma = null;

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  if (isLambda) {
    // Use Neon serverless adapter for Lambda
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaNeon(pool);
    
    return new PrismaClient({
      adapter,
      log: ['error'],
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  } else {
    // Regular Prisma client for local development
    return new PrismaClient({
      log: ['query', 'error'],
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }
}

function getPrismaClient() {
  if (!prisma) {
    prisma = createPrismaClient();
    
    // Handle graceful shutdown
    if (!isLambda) {
      process.on('beforeExit', async () => {
        await prisma?.$disconnect();
      });
    }
  }
  
  return prisma;
}

export { getPrismaClient };
export default getPrismaClient();