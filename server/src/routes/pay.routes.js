import { Router } from "express";
import crypto from "crypto";
import { sql } from "../db/sql.js";
import { requireAuth } from "../middleware/authz.js";
import { env } from "../config/env.js";

export const payRoutes = Router();

// YÊU CẦU ĐĂNG NHẬP
payRoutes.use(requireAuth);

// ENV mặc định (đổi trong .env của bạn)
const BANK_BIN = env.VIETQR_BIN || "970422"; // ví dụ: TPBank
const BANK_ACC = env.VIETQR_ACCOUNT || "0848775559";
const BANK_NAME = env.VIETQR_NAME || "LE QUANG DAT";
const TEMPLATE = env.VIETQR_TEMPLATE || "compact";
const CURRENCY = "VND";

// Map plan -> số tiền VND (demo, bạn điều chỉnh theo Pricing)
function getAmount(plan = "PRO", billing = "MONTHLY") {
  const p = String(plan).toUpperCase();
  const b = String(billing).toUpperCase();
  if (p === "PRO") return b === "YEARLY" ? 1248000 : 130000;
  if (p === "BASIC") return b === "YEARLY" ? 754000 : 77000;
  if (p === "ELITE") return b === "YEARLY" ? 2496000 : 260000; // 1.200.000đ / 120.000đ
  return 0;
}

function buildInfo({ userId, plan, billing, paymentId }) {
  return `TRIPLETWO ${userId} ${plan}-${billing} ${paymentId}`.slice(0, 100);
}

function buildQRUrl({ amount, info }) {
  const qs = new URLSearchParams({
    amount: String(amount),
    addInfo: info,
    accountName: BANK_NAME,
  }).toString();
  return `https://img.vietqr.io/image/${BANK_BIN}-${BANK_ACC}-${TEMPLATE}.png?${qs}`;
}

/** Tạo QR */
payRoutes.post("/create", async (req, res) => {
  try {
    const { plan = "PRO", billing = "MONTHLY" } = req.body || {};
    const userId = req.user.id;
    const amount = getAmount(plan, billing);
    if (!amount) {
      return res
        .status(400)
        .json({ error: "INVALID_PLAN", message: "Plan/billing không hợp lệ" });
    }

    const paymentId = crypto.randomUUID();
    const info = buildInfo({ userId, plan, billing, paymentId });
    const imageUrl = buildQRUrl({ amount, info });
    const deepLink = `vietqr://pay?bank=${BANK_BIN}&acc=${BANK_ACC}&amount=${amount}&desc=${encodeURIComponent(
      info
    )}`;

    // Lưu DB nếu có bảng "Payment" (nếu không có sẽ bị catch và bỏ qua)
    try {
      await sql`
        insert into "Payment" (id, "userId", amount, currency, provider, plan, billing, status, meta)
        values (${paymentId}, ${userId}, ${amount}, ${CURRENCY}, 'VIETQR', ${plan}, ${billing}, 'PENDING', ${JSON.stringify({ imageUrl, info, bankBin: BANK_BIN, account: BANK_ACC, name: BANK_NAME })})
      `;
    } catch (e) {
      if (process.env.NODE_ENV !== "test") {
        console.warn("PAYMENT_PERSIST_SKIP:", e?.code || e?.message);
      }
    }

    res.json({
      ok: true,
      paymentId,
      amount,
      currency: CURRENCY,
      expiresAt: Date.now() + 15 * 60 * 1000,
      bank: { bin: BANK_BIN, account: BANK_ACC, name: BANK_NAME },
      qr: { imageUrl, deepLink, info },
    });
  } catch (e) {
    console.error("PAY_CREATE_ERROR:", e);
    res.status(500).json({ error: "INTERNAL", message: "Không tạo được QR" });
  }
});

/** Kiểm tra trạng thái (polling) */
payRoutes.get("/status/:id", async (req, res) => {
  const id = req.params.id;
  try {
    let status = "PENDING";
    try {
      const rows = await sql`select status from "Payment" where id = ${id} limit 1`;
      if (rows[0]) status = rows[0].status;
    } catch {}
    res.json({ ok: true, status });
  } catch (e) {
    res.status(500).json({ error: "INTERNAL" });
  }
});
