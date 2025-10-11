// src/lib/plan.js

// Giảm giá khi trả Yearly
export const YEARLY_DISCOUNT = 0.2; // 20%

// Bảng giá USD theo tháng (nguồn chuẩn duy nhất)
export const PLANS = {
  BASIC: { key: "basic", name: "Basic", monthlyUSD: 2.99 },
  PRO: { key: "pro", name: "Pro", monthlyUSD: 4.99 },
  ELITE: { key: "elite", name: "Elite", monthlyUSD: 9.99 },
};

// Giá theo billing: MONTHLY | YEARLY
export function getPriceUSD(planKey, billing = "MONTHLY") {
  const p = PLANS[String(planKey).toUpperCase()];
  if (!p) return 0;
  if (String(billing).toUpperCase() === "YEARLY") {
    // tổng tiền cho cả năm (đã áp discount)
    return Math.round(p.monthlyUSD * 12 * (1 - YEARLY_DISCOUNT));
  }
  // giá theo tháng
  return p.monthlyUSD;
}

// Giá quy đổi "mỗi tháng" khi chọn Yearly (để hiển thị tham khảo)
export function getPerMonthOnYearlyUSD(planKey) {
  const year = getPriceUSD(planKey, "YEARLY");
  return Math.round((year / 12) * 100) / 100;
}
