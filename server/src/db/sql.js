// server/src/db/sql.js
import { neon, neonConfig } from "@neondatabase/serverless";

// Cache connections across invocations (good for serverless)
neonConfig.fetchConnectionCache = true;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required for Neon SQL client");
}

export const sql = neon(connectionString);

function withTimeout(promise, ms, label = "DB_TIMEOUT") {
  return Promise.race([
    promise,
    new Promise((_, rej) => {
      const err = new Error(`${label}`);
      err.code = label;
      setTimeout(() => rej(err), ms);
    }),
  ]);
}

export async function ensureDb({ timeout = 4000 } = {}) {
  return withTimeout(sql`select 1`, timeout, "DB_TIMEOUT").then(() => true);
}
