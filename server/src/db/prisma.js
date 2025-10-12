// server/src/db/prisma.js
import { PrismaClient } from "@prisma/client";

const isProd = process.env.NODE_ENV === "production";

let prisma = globalThis.__PRISMA__;
if (!prisma) {
  prisma = new PrismaClient({ log: ["warn", "error"] });
  globalThis.__PRISMA__ = prisma;
  // Warm connection (ignore failure)
  prisma.$connect().catch((e) => {
    console.error("[prisma] initial connect failed:", e?.message || e);
  });
}

/* ======================= ensureDb ======================= */
let _lastPing = globalThis.__PRISMA_LAST_PING || 0;
let _pingPromise = globalThis.__PRISMA_PING_PROMISE || null;

function withTimeout(promise, ms, code = "DB_TIMEOUT") {
  return Promise.race([
    promise,
    new Promise((_, rej) => {
      const err = new Error(code);
      err.code = code;
      setTimeout(() => rej(err), ms);
    }),
  ]);
}

export async function ensureDb({ timeout = 4000 } = {}) {
  const now = Date.now();
  if (now - _lastPing < 15_000 && !_pingPromise) return true;

  if (!_pingPromise) {
    _pingPromise = (async () => {
      try {
        try {
          await withTimeout(prisma.$connect(), Math.min(2000, timeout));
        } catch {}
        await withTimeout(prisma.$queryRaw`SELECT 1`, timeout);
        _lastPing = Date.now();
        globalThis.__PRISMA_LAST_PING = _lastPing;
        return true;
      } finally {
        globalThis.__PRISMA_PING_PROMISE = null;
        _pingPromise = null;
      }
    })();
    globalThis.__PRISMA_PING_PROMISE = _pingPromise;
  }
  return _pingPromise;
}

export { prisma };
