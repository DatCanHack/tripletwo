// server/src/config/env.js
import "dotenv/config";

const isProd = process.env.NODE_ENV === "production";

/* helpers */
const val = (name, ...aliases) => {
  for (const k of [name, ...aliases]) {
    const v = process.env[k];
    if (v !== undefined && v !== "") return v;
  }
  return undefined;
};
const req = (name, ...aliases) => {
  const v = val(name, ...aliases);
  if (!v)
    throw new Error(`Missing env: one of ${[name, ...aliases].join(", ")}`);
  return v;
};
const toBool = (v, d = false) => {
  if (v == null) return d;
  const s = String(v).trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(s)) return true;
  if (["0", "false", "no", "n"].includes(s)) return false;
  return d;
};

export const env = {
  /* general */
  isProd,
  PORT: Number(val("PORT")) || 5500,
  CORS_ORIGIN: val("CORS_ORIGIN") || "http://localhost:5173",

  /* JWT – map cả hai cách đặt tên để luôn khớp với .env */
  JWT_SECRET: req("JWT_SECRET", "JWT_ACCESS_SECRET"),
  REFRESH_SECRET: req("REFRESH_SECRET", "JWT_REFRESH_SECRET"),
  JWT_EXPIRES: val("JWT_EXPIRES", "JWT_ACCESS_EXPIRES") || "15m",
  REFRESH_EXPIRES: val("REFRESH_EXPIRES", "JWT_REFRESH_EXPIRES") || "7d",

  /* Cookies (refresh). Access cookie name được hardcode trong routes */
  COOKIE_NAME: val("COOKIE_NAME") || "fitx_refresh",
  COOKIE_SECURE: isProd ? true : toBool(val("COOKIE_SECURE"), false),
  COOKIE_SAME_SITE: isProd ? "none" : val("COOKIE_SAME_SITE") || "lax",

  /* Database */
  DATABASE_URL: req("DATABASE_URL"),

  /* 3rd party & AI */
  OPENAI_API_KEY: val("OPENAI_API_KEY") || "",
  AI_MODEL: val("AI_MODEL") || "gpt-4o-mini",
  GOOGLE_CLIENT_ID: val("GOOGLE_CLIENT_ID") || "",

  /* VietQR (hỗ trợ alias VIETQR_BIN/BANK_BIN) */
  VIETQR_BANK_CODE:
    val("VIETQR_BANK_CODE", "VIETQR_BIN", "BANK_BIN", "BANK_CODE") || "",
  VIETQR_ACCOUNT_NO: val("VIETQR_ACCOUNT_NO") || "",
  VIETQR_ACCOUNT_NAME: val("VIETQR_ACCOUNT_NAME") || "",
  VIETQR_TEMPLATE: val("VIETQR_TEMPLATE") || "compact",

  /* Optional pricing (nếu dùng) */
  PRO_PRICE_MONTHLY_VND: Number(val("PRO_PRICE_MONTHLY_VND")) || 0,
  PRO_PRICE_YEARLY_VND: Number(val("PRO_PRICE_YEARLY_VND")) || 0,
};
