// server/src/db/prisma.js
import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

// Bật cache kết nối (Neon v>=0.10: option này luôn true, nhưng set để rõ ý đồ)
neonConfig.fetchConnectionCache = true;

const isProd = process.env.NODE_ENV === "production";

/**
 * Dùng 1 PrismaClient duy nhất (cache trên globalThis) để tránh
 * tạo kết nối mới mỗi request (đặc biệt là môi trường serverless Vercel).
 */
let prisma = globalThis.__PRISMA__;

if (!prisma) {
  if (isProd) {
    // Sử dụng driver adapter + Pool của Neon (không dùng host "-pooler")
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL, // ví dụ: ...@ep-xxxx.neon.tech/neondb?sslmode=require
      // 1 connection cho mỗi lambda là đủ
      max: 1,
    });
    const adapter = new PrismaNeon(pool);

    prisma = new PrismaClient({
      adapter,
      log: ["warn", "error"], // thêm "query" nếu cần
    });
  } else {
    prisma = new PrismaClient({
      log: ["warn", "error"],
    });
  }

  // Lưu vào global để tái sử dụng giữa các lần invoke
  globalThis.__PRISMA__ = prisma;

  // Warm connection để lần gọi đầu không bị chậm (không throw nếu fail)
  prisma.$connect().catch((e) => {
    console.error("[prisma] initial connect failed:", e?.message || e);
  });
}

/* ======================= ensureDb ======================= */
/**
 * Kiểm tra DB sẵn sàng bằng SELECT 1 với timeout (mặc định 4s).
 * - Chống gọi trùng lặp bằng promise dùng chung (debounce theo tiến trình).
 * - Cache kết quả ping trong 15s để không spam DB giữa nhiều request đồng thời.
 *
 * Dùng: await ensureDb(); // throw {code:"DB_TIMEOUT"} nếu quá hạn
 */
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

  // Nếu mới ping < 15s thì coi như OK
  if (now - _lastPing < 15_000 && !_pingPromise) return true;

  if (!_pingPromise) {
    _pingPromise = (async () => {
      try {
        // Bảo đảm đã connect
        try {
          await withTimeout(prisma.$connect(), Math.min(2000, timeout));
        } catch {
          // ignore; tiếp tục thử query dưới để xác định trạng thái
        }

        // Ping nhanh
        await withTimeout(prisma.$queryRaw`SELECT 1`, timeout);

        _lastPing = Date.now();
        globalThis.__PRISMA_LAST_PING = _lastPing;
        return true;
      } finally {
        // clear in-flight để các lần sau có thể ping tiếp khi cần
        globalThis.__PRISMA_PING_PROMISE = null;
        _pingPromise = null;
      }
    })();

    globalThis.__PRISMA_PING_PROMISE = _pingPromise;
  }

  // Đợi kết quả ping hiện tại
  return _pingPromise;
}

export { prisma };
