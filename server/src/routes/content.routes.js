// server/src/routes/content.routes.js
import { Router } from "express";
import { sql } from "../db/sql.js";
import { requireAuth } from "../middleware/authz.js";
import { hasFeat, FEAT } from "../rbac/caps.js";
// Local enum constants (replacing Prisma enums)
const Category = { FATLOSS: "FATLOSS", STRENGTH: "STRENGTH", YOGA: "YOGA" };
const Plan = { FREE: "FREE", BASIC: "BASIC", PRO: "PRO", ELITE: "ELITE" };

export const contentRoutes = Router();

/** Lessons */
contentRoutes.get("/lessons", requireAuth, async (req, res, next) => {
  try {
    const all = await sql`select id, title, level, "videoUrl", "premiumOnly", "createdAt" from "Lesson" order by "createdAt" desc`;
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

    const whereClause = where?.category
      ? sql`where category = ${where.category}`
      : sql``;

    const items = await sql`
      select id, title, category, "planMin", "createdAt"
      from "Program"
      ${whereClause}
      order by "createdAt" desc
    `;

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
