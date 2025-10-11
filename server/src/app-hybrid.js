// server/src/app-hybrid.js - Hybrid version with database but minimal dependencies
import express from "express";
import morgan from "morgan";
import cors from "cors";
import prisma from "./config/database.js";
import { env } from "./config/env.js";

const app = express();
app.set("trust proxy", 1);

app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

// CORS configuration
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
  "https://main.dezleujsj0pht.amplifyapp.com",
].filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // server-to-server
    
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
    if (isLocalhost) return cb(null, true);

    for (const rule of DEFAULT_ALLOWLIST) {
      if (rule.startsWith('.') && origin.includes(rule.slice(1))) {
        return cb(null, true);
      }
      if (origin === rule) return cb(null, true);
    }
    
    return cb(null, true); // Temporarily allow all for testing
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Basic health checks
app.get("/", (_req, res) => res.json({ 
  ok: true, 
  name: "FitX API", 
  version: "hybrid",
  environment: process.env.NODE_ENV || "unknown",
  region: process.env.AWS_REGION || "unknown" 
}));

app.get("/health", (_req, res) => res.json({ 
  status: "healthy", 
  timestamp: new Date().toISOString(),
  version: "hybrid",
  secrets: {
    hasDBUrl: !!process.env.DATABASE_URL,
    hasJWT: !!process.env.JWT_SECRET,
    hasOpenAI: !!process.env.OPENAI_API_KEY
  }
}));

// Database health check
app.get("/db-ping", async (_req, res) => {
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    res.json({ 
      db: "ok", 
      test: result,
      timestamp: new Date().toISOString() 
    });
  } catch (e) {
    console.error('Database error:', e);
    res.status(500).json({ 
      db: "fail", 
      error: e.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Basic user endpoints (without complex auth middleware)
app.get("/users/count", async (_req, res) => {
  try {
    const count = await prisma.user.count();
    res.json({ count, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const users = await prisma.user.findMany({
      take: parseInt(limit),
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        active: true
      }
    });
    res.json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test secrets loading
app.get("/test-secrets", (_req, res) => {
  try {
    res.json({
      environment_params: {
        SSM_DATABASE_URL_PARAM: process.env.SSM_DATABASE_URL_PARAM,
        SSM_JWT_SECRET_PARAM: process.env.SSM_JWT_SECRET_PARAM,
        SECRETS_OPENAI_API_KEY_NAME: process.env.SECRETS_OPENAI_API_KEY_NAME,
      },
      loaded_secrets: {
        DATABASE_URL: process.env.DATABASE_URL ? "✓ Loaded" : "✗ Missing",
        JWT_SECRET: process.env.JWT_SECRET ? "✓ Loaded" : "✗ Missing", 
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "✓ Loaded" : "✗ Missing",
      },
      version: "hybrid"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handlers
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;