// server/src/middleware/authz.js
import { prisma } from "../db/prisma.js";
import { verifyAccess, verifyRefresh, signAccess } from "../utils/jwt.js";

const isProd = process.env.NODE_ENV === "production";
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

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      subscriptionPlan: true,
      subscriptionBilling: true,
      createdAt: true,
    },
  });

  if (!user || user.active === false) {
    return res.status(401).json({ error: "User not found" });
  }

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
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
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
