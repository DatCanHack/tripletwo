import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/auth.routes.js";
import { accountRoutes } from "./routes/account.routes.js";
import { contentRoutes } from "./routes/content.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";
import { notFound, onError } from "./middleware/error.js";
import { aiRoutes } from "./routes/ai.routes.js";
import { payRoutes } from "./routes/pay.routes.js";

const app = express();
app.set("trust proxy", 1);

app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// CORS
function matchAllowlist(origin) {
  if (!allowlist.length) return false;
  try {
    const { hostname } = new URL(origin);
    return allowlist.some((rule) => {
      if (rule.startsWith(".")) return hostname.endsWith(rule.slice(1));
      return origin === rule;
    });
  } catch {
    return false;
  }
}

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // mobile app / curl
    const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
      origin
    );
    if (isLocal || matchAllowlist(origin)) return cb(null, true);
    cb(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.get("/", (_req, res) => res.json({ ok: true, name: "FitX API" }));

// Routes
app.use("/ai", aiRoutes);
app.use("/auth", authRoutes);
app.use("/account", accountRoutes);
app.use("/content", contentRoutes);
app.use("/admin", adminRoutes);
app.use("/pay", payRoutes);

app.use(notFound);
app.use(onError);

const port = Number(process.env.PORT || 5500);

app.listen(port, () => {
  console.log(`✅ API listening at http://localhost:${port}`);
});
