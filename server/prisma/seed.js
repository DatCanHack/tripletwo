// prisma/seed.js
import { PrismaClient, Role, Plan, Billing, Category } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@fitx.dev";
  const adminPass = "admin123";
  const adminHash = await bcrypt.hash(adminPass, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      passwordHash: adminHash,
      role: Role.ADMIN,
      subscriptionPlan: Plan.PRO,
      subscriptionBilling: Billing.MONTHLY,
      active: true,
    },
  });

  const userEmail = "user@fitx.dev";
  const userPass = "user123";
  const userHash = await bcrypt.hash(userPass, 10);

  await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      name: "Demo User",
      passwordHash: userHash,
      role: Role.USER,
      subscriptionPlan: Plan.BASIC,
      subscriptionBilling: Billing.MONTHLY,
      active: true,
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: "Full Body Warm-up (10m)",
        level: "Beginner",
        premiumOnly: false,
      },
      {
        title: "HIIT 20m – Burn Fat Fast",
        level: "Intermediate",
        premiumOnly: true,
      },
      { title: "Core & Abs 15m", level: "All", premiumOnly: false },
      { title: "Mobility Flow 12m", level: "All", premiumOnly: false },
    ],
    skipDuplicates: true,
  });

  // ✅ DÙNG ENUM Category & Plan
  await prisma.program.createMany({
    data: [
      {
        title: "Fat Loss – 4 Weeks",
        category: Category.FATLOSS,
        planMin: Plan.FREE,
      },
      {
        title: "Strength Builder",
        category: Category.STRENGTH,
        planMin: Plan.BASIC,
      },
      {
        title: "Yoga Relax 21-Day",
        category: Category.YOGA,
        planMin: Plan.PRO,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed done.");
  console.log("   Admin:", adminEmail, "/", adminPass);
  console.log("   User :", userEmail, "/", userPass);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
