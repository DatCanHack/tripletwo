// server/src/routes/content.routes.js
import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/authz.js";
import { hasFeat, FEAT } from "../rbac/caps.js";
import { Category, Plan } from "@prisma/client"; // ✅ lấy enum trực tiếp

export const contentRoutes = Router();

/** Lessons */
contentRoutes.get("/lessons", requireAuth, async (req, res, next) => {
  try {
    const all = await prisma.lesson.findMany({
      orderBy: { createdAt: "desc" },
    });
    const plan = req.user.subscriptionPlan; // 'FREE'|'BASIC'|'PRO'|'ELITE'
    const canAll = hasFeat(plan, FEAT.ALL_LESSONS);
    const data = canAll ? all : all.filter((l) => !l.premiumOnly);
    res.json({ items: data });
  } catch (err) {
    next(err);
  }
});

/** Programs */
contentRoutes.get("/programs", requireAuth, async (req, res, next) => {
  try {
    const cat = (req.query.category || "").toString().toLowerCase();

    // ✅ Map query string -> enum Category.*
    const categoryMap = {
      fatloss: Category.FATLOSS,
      strength: Category.STRENGTH,
      yoga: Category.YOGA,
    };

    const where = categoryMap[cat] ? { category: categoryMap[cat] } : undefined;

    const items = await prisma.program.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // ✅ So sánh bằng enum Plan để tránh sai chính tả
    const rank = {
      [Plan.FREE]: 0,
      [Plan.BASIC]: 1,
      [Plan.PRO]: 2,
      [Plan.ELITE]: 3,
    };
    const userRank = rank[req.user.subscriptionPlan] ?? 0;

    const filtered = items.filter((p) => userRank >= (rank[p.planMin] ?? 0));

    res.json({ items: filtered });
  } catch (err) {
    next(err);
  }
});
