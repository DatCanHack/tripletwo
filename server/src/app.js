// server/src/app.js
import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { sql, ensureDb } from "./db/sql.js";
import { authRoutes } from "./routes/auth.routes.js";
import { accountRoutes } from "./routes/account.routes.js";
import { contentRoutes } from "./routes/content.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";
import { aiRoutes } from "./routes/ai.routes.js";
import { payRoutes } from "./routes/pay.routes.js";
import { notFound, onError } from "./middleware/error.js";

const app = express();
app.set("trust proxy", 1);

app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

/* ------------------- CORS ------------------- */
// Danh sách mặc định rất “rộng rãi”: localhost + bất kỳ *.vercel.app + URL FE nếu set qua env
const DEFAULT_ALLOWLIST = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  ".vercel.app",
  ".amplifyapp.com",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.FRONTEND_URL || null,
  process.env.WEB_URL || null,
  "https://twentytwo-eight.vercel.app",
  "https://main.dezleujsj0pht.amplifyapp.com",
  "https://www.tripletwo.dpdns.org",
].filter(Boolean);

// Nếu có CORS_ORIGIN thì dùng THÊM cùng với mặc định (không ghi đè)
const manual = (env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowlist = [...new Set([...DEFAULT_ALLOWLIST, ...manual])];

const isLocalhost = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

// Hỗ trợ cả rule là hostname (vd: example.com), hậu tố (vd: .vercel.app) hoặc URL đầy đủ
function ruleMatchOrigin(rule, origin) {
  if (!rule || !origin) return false;

  // Luôn cho qua mọi subdomain *.vercel.app
  try {
    const u = new URL(origin);
    const host = u.hostname.toLowerCase();
    if (host.endsWith("vercel.app")) return true;

    // chuẩn hoá rule
    const r = rule.toLowerCase();
    // dạng hậu tố: .domain.tld
    if (r.startsWith(".")) {
      return host.endsWith(r.slice(1));
    }

    // nếu rule là URL đầy đủ
    if (/^https?:\/\//i.test(r)) {
      // so sánh tuyệt đối (không thêm slash cuối)
      return origin.replace(/\/+$/, "") === r.replace(/\/+$/, "");
    }

    // rule là hostname: so sánh hostname hoặc hostname + scheme phổ biến
    if (host === r) return true;
    if (`https://${host}` === r || `http://${host}` === r) return true;
  } catch {
    // origin không phải URL hợp lệ -> bỏ qua
  }
  return false;
}

const corsOptions = {
  origin(origin, cb) {
    // server-to-server / healthcheck (không có Origin) -> cho qua
    if (!origin) return cb(null, true);
    if (isLocalhost(origin)) return cb(null, origin); // Return specific origin

    for (const rule of allowlist) {
      if (ruleMatchOrigin(rule, origin)) {
        return cb(null, origin); // Return the specific origin instead of true
      }
    }

    return cb(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ------------------- Healthcheck ------------------- */
app.get("/", (_req, res) => res.json({ ok: true, name: "FitX API" }));
app.get("/health", (_req, res) =>
  res.json({ status: "healthy", timestamp: new Date().toISOString() })
);
app.get("/db-ping", async (_req, res) => {
  try {
    await ensureDb();
    await sql`SELECT 1`;
    res.json({ db: "ok" });
  } catch (e) {
    res.status(500).json({ db: "fail", err: String(e) });
  }
});

/* ------------------- Routes ------------------- */
app.use("/ai", aiRoutes);
app.use("/auth", authRoutes);
app.use("/account", accountRoutes);
app.use("/content", contentRoutes);
app.use("/admin", adminRoutes);
app.use("/pay", payRoutes);

/* ------------------- Errors ------------------- */
app.use(notFound);
app.use(onError);

export default app;
