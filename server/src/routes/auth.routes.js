// server/src/routes/auth.routes.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sql, ensureDb } from "../db/sql.js";
import { env } from "../config/env.js";
import { signAccess, signRefresh, verifyRefresh } from "../utils/jwt.js";
import { OAuth2Client } from "google-auth-library";

export const authRoutes = Router();
// helper timeout an toàn cho promise
const withTimeout = (p, ms, label) =>
  Promise.race([
    p,
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error(`Timeout at ${label} after ${ms}ms`)), ms)
    ),
  ]);
const isProd = process.env.NODE_ENV === "production";
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// Cookie names
const REFRESH_COOKIE = "fitx_refresh";
const ACCESS_COOKIE = "fitx_access";

// Trên Vercel, API nằm dưới /api
const API_BASE = process.env.VERCEL ? "/api" : "";

/* ---------------- Helpers ---------------- */

function toMs(s, fallback) {
  if (!s || typeof s !== "string") return fallback;
  const m = s.match(/^(\d+)\s*([smhd])$/i);
  if (!m) return fallback;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const k =
    unit === "s"
      ? 1000
      : unit === "m"
      ? 60000
      : unit === "h"
      ? 3600000
      : 86400000;
  return n * k;
}

const ACCESS_MAX_AGE = toMs(env.JWT_EXPIRES || "15m", 15 * 60 * 1000);
const REFRESH_MAX_AGE = toMs(
  env.REFRESH_EXPIRES || "7d",
  7 * 24 * 60 * 60 * 1000
);

function toPublicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    role: u.role ?? 'USER',
    active: u.active ?? true,
    subscriptionPlan: u.subscriptionPlan ?? 'FREE',
    subscriptionBilling: u.subscriptionBilling ?? null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

const zodIssues = (err) =>
  err.issues?.map((i) => ({
    path: Array.isArray(i.path) ? i.path : [i.path],
    message: i.message,
  })) || [];

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: `${API_BASE}/auth/refresh`,
    maxAge: REFRESH_MAX_AGE,
  });
}

function setAccessCookie(res, token) {
  res.cookie(ACCESS_COOKIE, token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
}

/* ========== GOOGLE LOGIN ========== */
authRoutes.post("/google", async (req, res) => {
  try {
    const { credential, id_token, access_token } = req.body || {};
    const idToken = id_token || credential;

    let payload = null;
    if (idToken) {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else if (access_token) {
      const gRes = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      if (!gRes.ok) {
        return res.status(401).json({
          error: "GOOGLE_AUTH_FAILED",
          message: "Không lấy được hồ sơ Google.",
        });
      }
      payload = await gRes.json();
    } else {
      return res.status(400).json({ error: "NO_GOOGLE_TOKEN" });
    }

    const {
      sub: googleId,
      email,
      name,
      picture,
      email_verified,
    } = payload || {};
    if (!email || !googleId)
      return res.status(400).json({ error: "INVALID_GOOGLE_PAYLOAD" });
    if (email_verified === false)
      return res.status(403).json({ error: "EMAIL_NOT_VERIFIED" });

    try {
      await ensureDb();
    } catch {
      return res
        .status(503)
        .json({ error: "DB_CONNECT_TIMEOUT", message: "DB không sẵn sàng." });
    }

    let rows = await sql`select * from users where email = ${email} limit 1`;
    let user = rows[0] || null;
    if (!user) {
      const ins = await sql`
        insert into users (email, name, "googleId")
        values (${email}, ${name ?? null}, ${googleId})
        returning *
      `;
      user = ins[0] || null;
    } else if (!user.googleId) {
      try {
        const upd = await sql`
          update users
          set "googleId" = ${googleId}
          where id = ${user.id}
          returning *
        `;
        user = upd[0] || user;
      } catch {
        /* ignore if schema doesn't have these fields */
      }
    }

    if (user.active === false) {
      return res
        .status(403)
        .json({ error: "INACTIVE", message: "Tài khoản chưa được kích hoạt." });
    }

    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id);
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    return res.json({ ok: true, accessToken, user: toPublicUser(user) });
  } catch (err) {
    console.error("GOOGLE_LOGIN_ERROR:", err);
    return res.status(401).json({
      error: "GOOGLE_AUTH_FAILED",
      message: "Xác thực Google không thành công.",
    });
  }
});

/* ---------- /auth/register ---------- */
const RegisterSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên"),
  email: z.string().trim().toLowerCase().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

authRoutes.post("/register", async (req, res) => {
  try {
    console.log("[auth/register] Starting registration for:", req.body?.email);
    
    // Step 1: Check DB
    console.log("[auth/register] Step 1: Checking DB connection...");
    await ensureDb();
    console.log("[auth/register] Step 1: DB connection OK");

    // Step 2: Parse input
    console.log("[auth/register] Step 2: Parsing input...");
    const { name, email, password } = RegisterSchema.parse(req.body);
    console.log("[auth/register] Step 2: Input parsed OK", { name, email });
    
    // Step 3: Check existing user
    console.log("[auth/register] Step 3: Checking if user exists...");
    const existed = (await sql`select 1 from users where email = ${email} limit 1`)[0];
    console.log("[auth/register] Step 3: User exists check:", !!existed);
    
    if (existed) {
      return res
        .status(409)
        .json({ error: "EMAIL_EXISTS", message: "Email đã được đăng ký." });
    }
    
    // Step 4: Hash password
    console.log("[auth/register] Step 4: Hashing password...");
    const passwordHash = await bcrypt.hash(password, 10);
    console.log("[auth/register] Step 4: Password hashed OK");
    
    // Step 5: Insert user
    console.log("[auth/register] Step 5: Inserting user...");
    await sql`insert into users (name, email, password) values (${name}, ${email}, ${passwordHash})`;
    console.log("[auth/register] Step 5: User inserted OK");
    
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("[auth/register] Error at step:", err);
    console.error("[auth/register] Error stack:", err.stack);
    
    if (err?.issues) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        issues: zodIssues(err),
        message: "Dữ liệu không hợp lệ",
      });
    }
    return res
      .status(500)
      .json({ error: "INTERNAL", message: "Có lỗi xảy ra: " + (err?.message || String(err)) });
  }
});

/* ---------- /auth/login ---------- */
const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

authRoutes.post("/login", async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    // đảm bảo kết nối Prisma đã sẵn sàng & giới hạn thời gian
    await withTimeout(ensureDb(), 7000, "db.connect");

    const userRows = await withTimeout(
      sql`select id, name, email, password, "createdAt", "updatedAt" from users where email = ${email} limit 1`,
      8000,
      "user.findUnique"
    );
    const user = userRows[0] || null;

    if (!user) {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Email hoặc mật khẩu không đúng.",
      });
    }

    const ok = await withTimeout(
      bcrypt.compare(password, user.password || ""),
      4000,
      "bcrypt.compare"
    );
    if (!ok) {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Email hoặc mật khẩu không đúng.",
      });
    }

    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id);

    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    const { password: _, ...rest } = user;
    return res.json({ ok: true, accessToken, user: toPublicUser(rest) });
  } catch (err) {
    // Nếu là timeout DB → trả 503 để FE không hiểu nhầm là lỗi form
    if (String(err?.message || "").startsWith("Timeout at")) {
      console.error("[auth/login] DB timeout:", err.message);
      return res.status(503).json({
        error: "DB_TIMEOUT",
        message: "Hệ thống đang bận. Vui lòng thử lại.",
      });
    }
    if (err?.issues) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        issues: zodIssues(err),
        message: "Dữ liệu không hợp lệ",
      });
    }
    next(err);
  }
});

/* ---------- /auth/refresh ---------- */
authRoutes.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) {
      return res.status(401).json({ error: "NO_REFRESH_TOKEN" });
    }

    const decoded = verifyRefresh(token);
    if (!decoded?.userId) {
      return res.status(401).json({ error: "INVALID_REFRESH_TOKEN" });
    }

    await ensureDb();
    const userRows = await sql`select id, name, email, "createdAt", "updatedAt" from users where id = ${decoded.userId} limit 1`;
    const user = userRows[0] || null;

    if (!user) {
      return res.status(401).json({ error: "USER_NOT_FOUND" });
    }

    const accessToken = signAccess(user.id);
    setAccessCookie(res, accessToken);

    return res.json({ ok: true, accessToken, user: toPublicUser(user) });
  } catch (err) {
    return res.status(401).json({ error: "INVALID_REFRESH_TOKEN" });
  }
});
/* ---------- /auth/logout ---------- */
authRoutes.post("/logout", (_req, res) => {
  res.clearCookie(REFRESH_COOKIE, {
    path: "/auth/refresh",
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  });
  res.clearCookie(ACCESS_COOKIE, {
    path: "/",
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  });
  res.json({ ok: true });
});

authRoutes.get("/__debug/db", async (_req, res) => {
  try {
    await withTimeout(ensureDb(), 5000, "db.connect");
    await withTimeout(sql`select 1`, 5000, "select 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, message: String(e?.message || e) });
  }
});
