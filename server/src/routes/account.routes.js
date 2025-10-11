import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole, publicUser } from "../middleware/authz.js";

export const accountRoutes = Router();

// me
accountRoutes.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// update profile self
accountRoutes.patch("/me", requireAuth, async (req, res) => {
  const { name, avatarUrl } = req.body || {};
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, avatarUrl },
  });
  res.json({ user: publicUser(updated) });
});

// update subscription self (gọi sau checkout thành công FE)
accountRoutes.patch("/me/subscription", requireAuth, async (req, res) => {
  const { plan, billing } = req.body || {};
  const okPlan = ["FREE", "BASIC", "PRO", "ELITE"].includes(plan);
  const okBill = [null, "MONTHLY", "YEARLY"].includes(billing) || !billing;
  if (!okPlan || !okBill)
    return res.status(400).json({ error: "Invalid plan/billing" });

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      subscriptionPlan: plan,
      subscriptionBilling: billing || null,
      subscriptionSince: new Date(),
    },
  });
  res.json({ user: publicUser(updated) });
});

// admin: set plan for any user
accountRoutes.patch(
  "/users/:id/subscription",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res) => {
    const { plan, billing } = req.body || {};
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        subscriptionPlan: plan,
        subscriptionBilling: billing || null,
        subscriptionSince: new Date(),
      },
    });
    res.json({ user: publicUser(updated) });
  }
);
