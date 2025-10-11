// server/src/routes/admin.routes.js
import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/authz.js";

export const adminRoutes = Router();

// Chỉ ADMIN mới được vào các route dưới
adminRoutes.use(requireAuth, requireRole("ADMIN"));

const toPublicUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name ?? null,
  role: u.role,
  active: u.active,
  subscriptionPlan: u.subscriptionPlan,
  subscriptionBilling: u.subscriptionBilling ?? null,
  createdAt: u.createdAt,
});

/**
 * GET /admin/users?q=&page=1&limit=20
 */
adminRoutes.get("/users", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit || "20", 10))
    );

    const where = q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
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
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      items: items.map(toPublicUser),
      total,
      page,
      limit,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /admin/users/:id
 */
adminRoutes.get("/users/:id", async (req, res, next) => {
  try {
    const u = await prisma.user.findUnique({
      where: { id: req.params.id },
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
    if (!u) return res.status(404).json({ error: "Not found" });
    res.json({ user: toPublicUser(u) });
  } catch (e) {
    next(e);
  }
});

/**
 * PATCH /admin/users/:id/role  body: { role: "ADMIN" | "USER" }
 */
adminRoutes.patch("/users/:id/role", async (req, res, next) => {
  try {
    const { role } = req.body || {};
    if (!["ADMIN", "USER"].includes(role))
      return res.status(400).json({ error: "Invalid role" });

    const u = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    res.json({ user: u });
  } catch (e) {
    next(e);
  }
});

/**
 * PATCH /admin/users/:id/subscription
 * body: { plan: "FREE"|"BASIC"|"PRO"|"ELITE", billing: "MONTHLY"|"YEARLY"|null }
 */
adminRoutes.patch("/users/:id/subscription", async (req, res, next) => {
  try {
    const { plan, billing } = req.body || {};
    if (!["FREE", "BASIC", "PRO", "ELITE"].includes(plan))
      return res.status(400).json({ error: "Invalid plan" });
    if (billing && !["MONTHLY", "YEARLY"].includes(billing))
      return res.status(400).json({ error: "Invalid billing" });

    const u = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        subscriptionPlan: plan,
        subscriptionBilling: billing || null,
      },
      select: {
        id: true,
        email: true,
        subscriptionPlan: true,
        subscriptionBilling: true,
      },
    });

    res.json({ user: u });
  } catch (e) {
    next(e);
  }
});

/**
 * PATCH /admin/users/:id/active  body: { active: boolean }
 */
adminRoutes.patch("/users/:id/active", async (req, res, next) => {
  try {
    const { active } = req.body || {};
    const u = await prisma.user.update({
      where: { id: req.params.id },
      data: { active: !!active },
      select: { id: true, email: true, active: true },
    });
    res.json({ user: u });
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /admin/users/:id
 */
adminRoutes.delete("/users/:id", async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

/**
 * (Tuỳ chọn) đánh dấu hoá đơn đã thanh toán thủ công
 * POST /admin/invoices/:id/mark-paid
 */
adminRoutes.post("/invoices/:id/mark-paid", async (req, res, next) => {
  try {
    const inv = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status: "PAID", paidAt: new Date() },
    });

    await prisma.user.update({
      where: { id: inv.userId },
      data: {
        subscriptionPlan: inv.plan,
        subscriptionBilling: inv.billing,
      },
    });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
