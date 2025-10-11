// src/pages/LessonIndex.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/apiClient";
import {
  LESSONS,
  CATEGORY_META,
  sectionizeLessons,
  getStats,
  getPosterUrl,
  getPlaylist,
  getLessonProgress,
  bindProgressToUser,
} from "../lib/lesson";

const DIFFICULTY = [
  { key: "all", label: "Tất cả" },
  { key: "beginner", label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced", label: "Advanced" },
];
const DURATION = [
  { key: "any", label: "Mọi độ dài" },
  { key: "<15", label: "< 15 phút" },
  { key: "15-30", label: "15–30 phút" },
  { key: ">30", label: "> 30 phút" },
];
const SORTS = [
  { key: "newest", label: "Mới nhất" },
  { key: "duration", label: "Thời lượng" },
  { key: "title", label: "A → Z" },
];

// Thứ tự hiển thị category
const ORDER = ["fatloss", "muscle", "cardio", "yoga"];

/** YÊU CẦU QUYỀN THEO GÓI
 * - Free: mở Muscle
 * - Fatloss: yêu cầu Basic
 * - Yoga: yêu cầu Pro
 * - Cardio: giữ Elite như trước (bạn có thể đổi nếu muốn)
 */
const REQUIRED_PLAN = {
  muscle: "free",
  fatloss: "basic",
  cardio: "elite",
  yoga: "pro",
};

// Màu cho từng gói (dùng làm overlay / CTA)
const PLAN_STYLE = {
  free: { label: "Free", color: "#9CA3AF" }, // gray-400
  basic: { label: "Basic", color: "#3b82f6" }, // blue-500
  pro: { label: "Pro", color: "#8b5cf6" }, // violet-500
  elite: { label: "Elite", color: "#f59e0b" }, // amber-500
};

// Bậc gói để so sánh
const PLAN_RANK = { free: 0, basic: 1, pro: 2, elite: 3 };
const rankOf = (p) => PLAN_RANK[String(p || "free").toLowerCase()] ?? 0;

export default function LessonIndex() {
  const { user, booted } = useAuth();

  useEffect(() => {
    if (booted && user) bindProgressToUser({ userId: user.id, apiClient: api });
  }, [booted, user]);

  const [q, setQ] = useState("");
  const [dif, setDif] = useState("all");
  const [dur, setDur] = useState("any");
  const [sort, setSort] = useState("newest");

  // Lấy gói hiện tại của user (role/plan)
  const userPlan = String(
    user?.subscription?.plan || user?.subscriptionPlan || "FREE"
  ).toLowerCase();

  const items = LESSONS;

  // Lọc cơ bản (không loại theo role để còn hiển thị card bị khóa)
  const filtered = useMemo(() => {
    let list = [...items];
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter((it) =>
        [it.title, it.intro].filter(Boolean).join(" ").toLowerCase().includes(s)
      );
    }
    if (dif !== "all")
      list = list.filter((it) => (it.level || "").toLowerCase() === dif);

    const getDur = (it) =>
      getPlaylist(it.id).reduce((sum, v) => sum + Number(v?.duration || 0), 0);

    if (dur === "<15")
      list = list.filter((it) => getDur(it) > 0 && getDur(it) < 15);
    else if (dur === "15-30")
      list = list.filter((it) => getDur(it) >= 15 && getDur(it) <= 30);
    else if (dur === ">30") list = list.filter((it) => getDur(it) > 30);

    list.sort((a, b) => {
      if (sort === "title") return (a.title || "").localeCompare(b.title || "");
      if (sort === "duration") return getDur(a) - getDur(b);
      const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
      if (ta !== tb) return tb - ta;
      return String(b.id || "").localeCompare(String(a.id || ""));
    });
    return list;
  }, [items, q, dif, dur, sort]);

  const stats = useMemo(() => getStats(filtered), [filtered]);
  const sections = useMemo(() => sectionizeLessons(filtered), [filtered]);

  if (!booted) return null;
  if (!user) return <Navigate to="/login" replace />;

  const canViewCat = (cat) =>
    rankOf(userPlan) >= rankOf(REQUIRED_PLAN[cat] || "elite");

  return (
    <div className="w-full">
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden border-b border-[#12171b]">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_380px_at_20%_-10%,rgba(0,179,164,.25),transparent),linear-gradient(to_bottom_right,#0b1013,#0f1719)]" />
        <div className="relative container py-8 md:py-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 md:col-span-5">
            <p className="text-sm text-gray-400">Join Our Lessons</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-extrabold leading-tight">
              Only <span className="text-[#00B3A4]">30 Minute</span>
              <br />
              Just <span className="text-[#00B3A4]">2 Times</span>
            </h1>
            <p className="mt-4 text-gray-300 max-w-[60ch]">
              Chọn mục tiêu của bạn và bắt đầu lộ trình luyện tập.
            </p>
          </div>
          <div className="col-span-12 md:col-span-7 md:flex md:justify-end">
            <div className="relative w-[92vw] md:w-auto max-w-[980px] aspect-[16/9] rounded-[28px] overflow-hidden shadow-[0_24px_80px_rgba(0,179,164,.22)]">
              <img
                src="/images/home/hero1.png"
                alt="Workout highlight"
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 768px) 92vw, 980px"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-black/10" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================ STATS ============================ */}
      <div className="container mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Tổng số bài" value={stats.total} />
        <Stat label="Hoàn thành" value={stats.completed} />
        <Stat label="Phút đã xem" value={stats.minutesWatched} />
        <Stat label="Xem gần nhất" value={stats.lastTitle || "—"} small />
      </div>

      {/* ============================ FILTERS ============================ */}
      <div className="container mt-6 grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-5">
          <div className="flex items-center gap-2 rounded-xl border border-[#1c2227] bg-[#0f1317] px-3">
            <svg
              className="w-4 h-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tiêu đề…"
              className="w-full bg-transparent py-2.5 outline-none"
            />
          </div>
        </div>
        <div className="col-span-6 lg:col-span-2">
          <select
            value={dif}
            onChange={(e) => setDif(e.target.value)}
            className="w-full rounded-xl border border-[#1c2227] bg-[#0f1317] px-3 py-2.5"
          >
            {DIFFICULTY.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-6 lg:col-span-2">
          <select
            value={dur}
            onChange={(e) => setDur(e.target.value)}
            className="w-full rounded-xl border border-[#1c2227] bg-[#0f1317] px-3 py-2.5"
          >
            {DURATION.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-12 lg:col-span-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full rounded-xl border border-[#1c2227] bg-[#0f1317] px-3 py-2.5"
          >
            {SORTS.map((o) => (
              <option key={o.key} value={o.key}>
                Sắp xếp: {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ============================ CATEGORY CARDS (có khóa) ============================ */}
      <section className="container mt-8">
        <div className="grid grid-cols-12 gap-4">
          {ORDER.map((k) => {
            const list = sections[k] || [];
            if (!list.length) return null;

            const cover = list[0].cover || getPosterUrl(list[0].slug);
            const prog = getLessonProgress(list[0].id);
            const requiredPlan = REQUIRED_PLAN[k] || "elite";
            const requiredStyle = PLAN_STYLE[requiredPlan];
            const allowed = canViewCat(k);

            const CardInner = (
              <>
                <div className="relative aspect-[16/10]">
                  <img
                    src={cover}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt={CATEGORY_META[k].label}
                  />
                  <div className="absolute left-3 top-3 text-xs px-2 py-1 rounded-lg bg-black/60 border border-white/10">
                    {CATEGORY_META[k].label}
                  </div>
                  {!allowed && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                      <div className="text-center px-4">
                        <div className="mx-auto mb-2 inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/15">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            className="text-white/90"
                          >
                            <rect x="3" y="11" width="18" height="10" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </div>
                        <div
                          className="text-sm font-semibold"
                          style={{ color: requiredStyle.color }}
                        >
                          Cần gói {requiredStyle.label}
                        </div>
                        <Link
                          to="/pricing"
                          className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold"
                          style={{
                            background: requiredStyle.color,
                            color: "#0b0f12",
                          }}
                        >
                          Nâng cấp {requiredStyle.label}
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path d="M5 12h14" />
                            <path d="M12 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 text-sm text-gray-300">
                  {allowed ? (
                    <>
                      {prog.completed}/{prog.total} đã xong
                    </>
                  ) : (
                    <span className="opacity-70">Nội dung bị khóa</span>
                  )}
                </div>
              </>
            );

            return allowed ? (
              <Link
                key={k}
                to={`/lesson/${list[0].id}`}
                className="col-span-12 md:col-span-4 xl:col-span-3 rounded-2xl overflow-hidden border border-[#1c2227] bg-[#15191d] hover:translate-y-[-2px] transition"
              >
                {CardInner}
              </Link>
            ) : (
              <div
                key={k}
                className="col-span-12 md:col-span-4 xl:col-span-3 rounded-2xl overflow-hidden border border-[#1c2227] bg-[#15191d]"
              >
                {CardInner}
              </div>
            );
          })}
        </div>

        {/* ============================ LISTS PER CATEGORY ============================ */}
        {ORDER.map((key) => {
          const list = sections[key] || [];
          if (!list.length) return null;

          const allowed = canViewCat(key);
          const requiredPlan = REQUIRED_PLAN[key] || "elite";
          const requiredStyle = PLAN_STYLE[requiredPlan];

          return (
            <div key={key} className="mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {CATEGORY_META[key].label}
                </h3>
                <div className="text-xs text-gray-400">{list.length} bài</div>
              </div>

              {allowed ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                  {list.map((l) => {
                    const prog = getLessonProgress(l.id);
                    const duration = getPlaylist(l.id).reduce(
                      (s, v) => s + Number(v.duration || 0),
                      0
                    );
                    return (
                      <Link
                        key={l.id}
                        to={`/lesson/${l.id}`}
                        className="rounded-xl border border-[#1c2227] bg-[#0f1317] overflow-hidden hover:translate-y-[-2px] transition"
                      >
                        <div className="relative aspect-[16/9]">
                          <img
                            src={l.cover || getPosterUrl(l.slug)}
                            className="absolute inset-0 w-full h-full object-cover"
                            alt={l.title}
                          />
                          {!!prog.percent && (
                            <div className="absolute right-2 top-2 text-[11px] px-2 py-1 rounded bg-black/60 border border-white/10">
                              {prog.percent}%
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <div className="font-medium line-clamp-2">
                            {l.title}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-1 capitalize">
                            {l.level} • {duration} phút •{" "}
                            {getPlaylist(l.id).length} video
                          </div>
                          <div className="mt-2 h-2 rounded bg-white/10 overflow-hidden">
                            <div
                              className="h-2 bg-[#00B3A4]"
                              style={{ width: `${prog.percent}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3 rounded-2xl border border-white/10 bg-[#0f1317] p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div
                      className="w-full h-full"
                      style={{
                        background:
                          "radial-gradient(600px 200px at 50% -10%, rgba(255,255,255,0.2), transparent)",
                      }}
                    />
                  </div>
                  <div className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/15 mb-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <rect x="3" y="11" width="18" height="10" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-300">
                    Nội dung <b>{CATEGORY_META[key].label}</b> chỉ dành cho{" "}
                    <span
                      className="font-semibold"
                      style={{ color: requiredStyle.color }}
                    >
                      gói {requiredStyle.label}
                    </span>
                    .
                  </div>
                  <Link
                    to="/pricing"
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold"
                    style={{
                      background: requiredStyle.color,
                      color: "#0b0f12",
                    }}
                  >
                    Nâng cấp {requiredStyle.label}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}

function Stat({ label, value, small }) {
  return (
    <div className="rounded-xl border border-[#1c2227] bg-[#0f1317] p-3">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`mt-1 ${small ? "text-sm" : "text-xl"} font-semibold`}>
        {value}
      </div>
    </div>
  );
}
