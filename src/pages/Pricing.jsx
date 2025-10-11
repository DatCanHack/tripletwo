// src/pages/Pricing.jsx
import { useMemo, useState, useCallback } from "react";
import { Accordion } from "../components/Accordion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  PLANS as PLAN_DEF, // object: { BASIC, PRO, ELITE }
  getPriceUSD, // lấy giá theo plan + billing
  getPerMonthOnYearlyUSD, // giá quy đổi /tháng khi chọn yearly
} from "../lib/plan";

const cx = (...c) => c.filter(Boolean).join(" ");

// Thông tin mô tả/feature hiển thị (không chứa giá)
const RAW_PLANS = [
  {
    key: PLAN_DEF.BASIC.key,
    name: PLAN_DEF.BASIC.name,
    blurb: "Bắt đầu tập đều 3 buổi/tuần",
    popular: false,
    features: ["Lesson cơ bản", "Menu gợi ý", "Lưu tiến độ"],
    minus: ["Không có video HD", "Không tải offline"],
  },
  {
    key: PLAN_DEF.PRO.key,
    name: PLAN_DEF.PRO.name,
    blurb: "Đầy đủ bài + menu nâng cao",
    popular: true,
    features: [
      "Tất cả lessons",
      "Video 1080p",
      "Program 4 tuần",
      "Menu chuyên biệt",
      "Đồng bộ đa thiết bị",
    ],
    minus: ["Không coach 1:1"],
  },
  {
    key: PLAN_DEF.ELITE.key,
    name: PLAN_DEF.ELITE.name,
    blurb: "Tập kèm coach 1:1",
    popular: false,
    features: [
      "Coach 1:1 mỗi tuần",
      "Kế hoạch cá nhân hóa",
      "Ưu tiên hỗ trợ",
      "Tất cả lợi ích Pro",
    ],
    minus: [],
  },
];

const FAQ_ITEMS = [
  {
    q: "Tôi có thể hủy bất cứ lúc nào không?",
    a: "Có. Gói trả trước theo chu kỳ; bạn có thể hủy trước ngày gia hạn để không bị trừ kỳ tiếp theo.",
  },
  {
    q: "Pro khác gì Basic?",
    a: "Pro mở khóa tất cả bài học, video 1080p, program 4 tuần và menu chuyên biệt—đủ để theo 1 lộ trình hoàn chỉnh.",
  },
  {
    q: "Elite bao gồm những gì?",
    a: "Elite có coach 1:1 và kế hoạch cá nhân hóa theo mục tiêu/thiết bị/giờ giấc của bạn.",
  },
  {
    q: "Có trial không?",
    a: "Bạn có thể dùng thử 7 ngày với Pro. Huỷ trong thời gian trial sẽ không bị trừ phí.",
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState("monthly"); // "monthly" | "yearly"
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChoose = useCallback(
    (planKey) => {
      if (!user) {
        navigate("/login", { state: { from: location } });
        return;
      }
      navigate(`/checkout?plan=${planKey}&billing=${billing}`);
    },
    [user, navigate, location, billing]
  );

  // Ghép thông tin giá từ lib/plans
  const plans = useMemo(() => {
    return RAW_PLANS.map((p) => {
      const monthly = getPriceUSD(p.key, "MONTHLY");
      const yearly = getPriceUSD(p.key, "YEARLY"); // tổng cho 1 năm (đã áp giảm)
      const perMonthOnYearly = getPerMonthOnYearlyUSD(p.key);
      return { ...p, monthly, yearly, perMonthOnYearly };
    });
  }, []);

  return (
    <div className="w-full">
      {/* HERO */}
      <section className="container py-10 md:py-14">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Chọn gói phù hợp
          </h1>
          <p className="mt-3 text-gray-300">
            Luyện tập thông minh với program 4 tuần, video chất lượng và thực
            đơn phù hợp mục tiêu.
          </p>
        </div>

        {/* Toggle billing */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => setBilling("monthly")}
            className={cx(
              "px-4 py-2 rounded-xl border",
              billing === "monthly"
                ? "border-[#00B3A4] bg-[#00B3A4] text-black font-semibold"
                : "border-[#1c2227] hover:bg-white/5"
            )}
          >
            Monthly
          </button>
          <div className="text-sm text-gray-400">or</div>
          <button
            onClick={() => setBilling("yearly")}
            className={cx(
              "px-4 py-2 rounded-xl border relative",
              billing === "yearly"
                ? "border-[#00B3A4] bg-[#00B3A4] text-black font-semibold"
                : "border-[#1c2227] hover:bg-white/5"
            )}
            title="Save 20%"
          >
            Yearly
            <span className="ml-2 text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Save 20%
            </span>
          </button>
        </div>
      </section>

      {/* CARDS */}
      <section className="container pb-10">
        <div className="grid grid-cols-12 gap-6">
          {plans.map((p) => {
            const isYearly = billing === "yearly";
            const priceNum = isYearly ? p.yearly : p.monthly;
            const label = isYearly ? "/năm" : "/tháng";

            return (
              <div
                key={p.key}
                className={cx(
                  "col-span-12 md:col-span-4 rounded-3xl border bg-[#15191d] overflow-hidden flex flex-col",
                  p.popular ? "border-[#00B3A4]" : "border-[#1c2227]"
                )}
              >
                {p.popular && (
                  <div className="px-4 py-2 text-xs bg-[#00B3A4] text-black font-semibold">
                    Most popular
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-lg font-semibold">{p.name}</div>
                  <div className="text-sm text-gray-400">{p.blurb}</div>

                  <div className="mt-4">
                    <div className="text-3xl font-extrabold">
                      ${priceNum}
                      <span className="text-base text-gray-400 font-medium">
                        {" "}
                        {label}
                      </span>
                    </div>
                    {isYearly && (
                      <div className="text-xs text-gray-400 mt-1">
                        ≈ ${p.perMonthOnYearly}/month billed yearly
                      </div>
                    )}
                  </div>

                  <ul className="mt-5 space-y-2 text-sm">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 inline-block w-4 h-4 rounded-full bg-[#00B3A4] text-black text-[10px] grid place-items-center">
                          ✓
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                    {p.minus.map((m, i) => (
                      <li
                        key={`m-${i}`}
                        className="flex items-start gap-2 text-gray-400"
                      >
                        <span className="mt-0.5 inline-block w-4 h-4 rounded-full bg-white/10 text-white/70 text-[10px] grid place-items-center">
                          –
                        </span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <button
                      onClick={() => handleChoose(p.key)}
                      className={cx(
                        "w-full block text-center px-4 py-2.5 rounded-xl font-semibold",
                        p.popular
                          ? "bg-[#00B3A4] text-black"
                          : "border border-[#1c2227] hover:bg-white/5"
                      )}
                    >
                      Choose {p.name}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* COMPARISON */}
      <section className="container pb-10">
        <h2 className="text-xl font-semibold mb-4">So sánh nhanh</h2>
        <div className="overflow-x-auto rounded-2xl border border-[#1c2227]">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-[#12171b]">
              <tr>
                <th className="text-left px-4 py-3 border-r border-[#1c2227]">
                  Tính năng
                </th>
                {RAW_PLANS.map((p) => (
                  <th
                    key={p.key}
                    className="text-left px-4 py-3 border-r border-[#1c2227] last:border-r-0"
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Tất cả lessons", true, true, true],
                ["Video 1080p", false, true, true],
                ["Program 4 tuần", true, true, true],
                ["Menu chuyên biệt", false, true, true],
                ["Coach 1:1", false, false, true],
                ["Tải offline", false, false, true],
              ].map((row, i) => (
                <tr key={i} className="border-t border-[#1c2227]">
                  <td className="px-4 py-3 border-r border-[#1c2227]">
                    {row[0]}
                  </td>
                  {RAW_PLANS.map((_, j) => (
                    <td
                      key={j}
                      className="px-4 py-3 border-r border-[#1c2227] last:border-r-0"
                    >
                      {row[j + 1] ? (
                        <span className="inline-block w-5 h-5 rounded-full bg-[#00B3A4] text-black text-[11px] grid place-items-center">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-block w-5 h-5 rounded-full bg-white/10 text-white/60 text-[11px] grid place-items-center">
                          –
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="container pb-16">
        <h2 className="text-xl font-semibold mb-4">FAQ</h2>
        <Accordion items={FAQ_ITEMS} />
      </section>
    </div>
  );
}
