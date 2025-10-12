// server/src/routes/admin.routes.js
import { Router } from "express";
import { sql } from "../db/sql.js";
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
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || "20", 10)));

    const like = `%${q}%`;

    // Tránh compose SQL fragment — dùng điều kiện an toàn theo tham số
    const items = await sql`
      select id, email, name, role, active, "subscriptionPlan", "subscriptionBilling", "createdAt"
      from users
      where (${q} = '' or email ilike ${like} or name ilike ${like})
      order by "createdAt" desc
      offset ${(page - 1) * limit}
      limit ${limit}
    `;

    const countRows = await sql`
      select count(*)::int as count
      from users
      where (${q} = '' or email ilike ${like} or name ilike ${like})
    `;
    const total = countRows[0]?.count || 0;

    res.json({ items: items.map(toPublicUser), total, page, limit });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /admin/users/:id
 */
adminRoutes.get("/users/:id", async (req, res, next) => {
  try {
const rows = await sql`select id, email, name, role, active, "subscriptionPlan", "subscriptionBilling", "createdAt" from users where id = ${req.params.id} limit 1`;
    const u = rows[0] || null;
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

const upd = await sql`update users set role = ${role} where id = ${req.params.id} returning id, email, role`;
    const u = upd[0] || null;

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

const upd = await sql`
      update users
      set "subscriptionPlan" = ${plan}, "subscriptionBilling" = ${billing || null}
      where id = ${req.params.id}
      returning id, email, "subscriptionPlan", "subscriptionBilling"
    `;
    const u = upd[0] || null;

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
const upd = await sql`update users set active = ${!!active} where id = ${req.params.id} returning id, email, active`;
    const u = upd[0] || null;
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
await sql`delete from users where id = ${req.params.id}`;
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
const invRows = await sql`update "Invoice" set status = 'PAID', "paidAt" = now() where id = ${req.params.id} returning *`;
    const inv = invRows[0];

    if (inv?.userId) {
      await sql`
        update users
        set "subscriptionPlan" = ${inv.plan}, "subscriptionBilling" = ${inv.billing}
        where id = ${inv.userId}
      `;
    }

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
