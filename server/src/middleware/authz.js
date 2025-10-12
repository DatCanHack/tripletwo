// server/src/middleware/authz.js
import { sql } from "../db/sql.js";
import { verifyAccess, verifyRefresh, signAccess } from "../utils/jwt.js";

// Allow local development to force dev-style cookies without changing NODE_ENV
const isProd = process.env.FORCE_DEV_COOKIES === "true" ? false : process.env.NODE_ENV === "production";
const ACCESS_COOKIE = "fitx_access";
const REFRESH_COOKIE = "fitx_refresh";

/** Bắt buộc đăng nhập: ƯU TIÊN Bearer, fallback cookie access */
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearer =
    authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const cookieTok = req.cookies?.[ACCESS_COOKIE] || null;

  const tryVerify = (t) => {
    if (!t) return null;
    try {
      return verifyAccess(t);
    } catch {
      return null;
    }
  };

  // ⚠️ ƯU TIÊN Bearer, sau đó mới đến cookie
  const payload = tryVerify(bearer) || tryVerify(cookieTok);
  if (!payload) return res.status(401).json({ error: "Invalid/expired token" });

  // Use lowercase 'users' table to match the rest of the codebase
  const rows = await sql`select id, email, name, "createdAt" from users where id = ${payload.sub} limit 1`;
  const u = rows[0] || null;

  if (!u) {
    return res.status(401).json({ error: "User not found" });
  }

  // Normalize to a common shape used by routes
  const user = {
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    role: 'USER',
    active: true,
    subscriptionPlan: 'FREE',
    subscriptionBilling: null,
    createdAt: u.createdAt ?? null,
  };

  req.user = user;
  next();
};

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: "Forbidden" });
    next();
  };

/** Refresh access token bằng refresh cookie */
export const handleRefresh = async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) return res.status(401).json({ error: "No refresh token" });

  try {
    const payload = verifyRefresh(token);
    const rows = await sql`select * from "User" where id = ${payload.sub} limit 1`;
    const user = rows[0] || null;
    if (!user) return res.status(401).json({ error: "User not found" });

    const access = signAccess(user.id);

    // set lại access cookie (để các XHR khác có thể dùng)
    res.cookie(ACCESS_COOKIE, access, {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ accessToken: access, user: publicUser(user) });
  } catch {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};

export const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  avatarUrl: u.avatarUrl ?? null,
  role: u.role,
  active: u.active ?? true,
  subscriptionPlan: u.subscriptionPlan,
  subscriptionBilling: u.subscriptionBilling ?? null,
  createdAt: u.createdAt ?? null,
});
