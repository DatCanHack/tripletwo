// server/src/app-minimal.js - Minimal version for initial deployment
import express from "express";
import morgan from "morgan";
import cors from "cors";

const app = express();
app.set("trust proxy", 1);

app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

// Simple CORS for testing
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Simple health checks
app.get("/", (_req, res) => res.json({ 
  ok: true, 
  name: "FitX API", 
  environment: process.env.NODE_ENV || "unknown",
  region: process.env.AWS_REGION || "unknown" 
}));

app.get("/health", (_req, res) => res.json({ 
  status: "healthy", 
  timestamp: new Date().toISOString(),
  secrets: {
    hasDBUrl: !!process.env.DATABASE_URL,
    hasJWT: !!process.env.JWT_SECRET,
    hasOpenAI: !!process.env.OPENAI_API_KEY
  }
}));

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
      }
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
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;