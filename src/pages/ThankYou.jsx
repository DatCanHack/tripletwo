// src/pages/ThankYou.jsx
import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";

const THEME = "#00B3A4";
const usd = (n) =>
  `$${(+n).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

const PLAN_LABEL = { basic: "Basic", pro: "Pro", elite: "Elite" };

export default function ThankYou() {
  const [search] = useSearchParams();

  // Lấy thông tin từ query (UI-only)
  const order = search.get("order") || "";
  const plan = (search.get("plan") || "pro").toLowerCase();
  const billing = (search.get("billing") || "monthly").toLowerCase();
  const amount = search.get("amount") || "0";
  const email = search.get("email") || "";

  const valid = useMemo(
    () => !!order && !!plan && !!billing && !!amount,
    [order, plan, billing, amount]
  );

  useEffect(() => {
    // Scroll lên đầu cho chắc
    window.scrollTo(0, 0);
  }, []);

  if (!valid) {
    return (
      <div className="container py-16">
        <h1 className="text-2xl font-extrabold">No recent order</h1>
        <p className="mt-2 text-gray-400">
          Thiếu tham số đơn hàng. Đây chỉ là trang mẫu UI.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/pricing"
            className="px-4 py-2 rounded-xl border border-[#1c2227] hover:bg-white/5"
          >
            ← Back to Pricing
          </Link>
          <Link
            to="/lesson"
            className="px-4 py-2 rounded-xl"
            style={{ backgroundColor: THEME, color: "#000" }}
          >
            Go to Lessons
          </Link>
        </div>
      </div>
    );
  }

  const now = new Date();
  const planName = PLAN_LABEL[plan] || "Pro";

  return (
    <div className="container py-10 print:py-0">
      {/* Hero */}
      <div className="rounded-3xl border border-[#1c2227] bg-[#15191d] overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">
                Thank you!
              </h1>
              <p className="mt-2 text-gray-300">
                Đơn hàng của bạn đã được xác nhận. Biên nhận đã gửi tới{` `}
                <span className="text-white font-medium">
                  {email || "email của bạn"}
                </span>
                .
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Order</div>
              <div className="font-semibold">{order}</div>
            </div>
          </div>

          {/* Receipt */}
          <div className="mt-6 rounded-2xl border border-[#1c2227] bg-[#0f1214] overflow-hidden">
            <div className="grid grid-cols-12">
              <div className="col-span-12 md:col-span-7 p-5 md:border-r border-[#1c2227]">
                <h2 className="font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <Row k="Plan" v={planName} />
                  <Row
                    k="Billing"
                    v={billing === "yearly" ? "Yearly (save 20%)" : "Monthly"}
                  />
                  <Row k="Order date" v={now.toLocaleString()} />
                  <Row k="Receipt email" v={email || "—"} />
                </div>

                <div className="my-4 h-px bg-[#1c2227]" />

                <div className="flex items-center justify-between">
                  <div className="text-gray-300">Total paid</div>
                  <div className="text-2xl font-extrabold">{usd(amount)}</div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/lesson"
                    className="px-4 py-2.5 rounded-xl font-semibold text-black"
                    style={{ backgroundColor: THEME }}
                  >
                    Start training
                  </Link>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-xl border border-[#1c2227] hover:bg-white/5"
                  >
                    Print receipt
                  </button>
                </div>
              </div>

              {/* Perks */}
              <div className="col-span-12 md:col-span-5 p-5">
                <h3 className="font-semibold mb-3">What you get</h3>
                <ul className="space-y-2 text-sm">
                  {FEATURES_BY_PLAN[plan]?.map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 inline-block w-4 h-4 rounded-full bg-[#00B3A4] text-black text-[10px] grid place-items-center">
                        ✓
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-xl border border-[#1c2227] p-4 text-sm">
                  <div className="font-semibold mb-1">Next steps</div>
                  <ol className="list-decimal pl-5 space-y-1 text-gray-300">
                    <li>
                      Mở{" "}
                      <Link
                        to="/program/fatloss"
                        className="text-[#00B3A4] hover:underline"
                      >
                        Programs
                      </Link>{" "}
                      và chọn lộ trình phù hợp.
                    </li>
                    <li>
                      Vào{" "}
                      <Link
                        to="/menu"
                        className="text-[#00B3A4] hover:underline"
                      >
                        Menu
                      </Link>{" "}
                      để chuẩn bị bữa ăn.
                    </li>
                    <li>Đặt mục tiêu tuần này: 3 buổi × 30 phút.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            * Trang này là template UI. Không có thanh toán thật. Bạn có thể gắn
            Stripe/PayPal sau.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-gray-400">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}

const FEATURES_BY_PLAN = {
  basic: ["Lesson cơ bản", "Gợi ý menu", "Lưu tiến độ"],
  pro: [
    "Tất cả lessons",
    "Video 1080p",
    "Program 4 tuần",
    "Menu chuyên biệt",
    "Đồng bộ đa thiết bị",
  ],
  elite: [
    "Coach 1:1 mỗi tuần",
    "Kế hoạch cá nhân hóa",
    "Ưu tiên hỗ trợ",
    "Tất cả lợi ích Pro",
  ],
};
