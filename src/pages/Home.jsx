// src/pages/Home.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { PLANS, getCoverSources } from "../lib/plans";
import { LESSONS, getPosterUrl } from "../lib/lesson";
import { MENU, imgOf } from "../lib/menu";
import { BLOGS } from "../lib/blogs";

// thêm helper ngay gần đầu file (trên export default function Home)
const toSlug = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/* ---------------------------------------------------------- */

export default function Home() {
  const featuredLessons = LESSONS.slice(0, 6);
  const featuredMeals = MENU.slice(0, 8);
  // ĐẶT TRONG function Home() { ... } nhưng trước return
  const TESTIMONIALS = [
    {
      name: "Steven Haward",
      role: "Pro Member",
      quote:
        "I checked out the exercise lesson section and really love how it's focused on specific goals like fat loss and muscle gain...",
      hero: "/images/home/testimonials/steven.png", // ảnh lớn bên trái
      thumb: "/images/home/testimonials/steven.png", // ảnh nhỏ bên phải (có thể dùng cùng ảnh)
    },
    {
      name: "Hana Giang Anh",
      role: "Basic Member",
      quote:
        "Kết hợp mobility, yoga và sức mạnh khiến buổi tập luôn mới mẻ. Phần này có nhiều tiềm năng để giữ người dùng hứng thú. Làm rất tốt!",
      hero: "/images/home/testimonials/gianganh.png",
      thumb: "/images/home/testimonials/gianganh.png",
    },
    {
      name: "Trương Đình Hoàng",
      role: "Elite Member",
      quote:
        "Định dạng 30 phút rất phù hợp cho người bận rộn. Video giúp mình dễ theo dõi và phần hướng dẫn bằng giọng nói thì thân thiện, truyền nhiều động lực.",
      hero: "/images/home/testimonials/truongdinhhoang.png",
      thumb: "/images/home/testimonials/truongdinhhoang.png",
    },
  ];

  const [tIdx, setTIdx] = useState(0);
  const tPrev = () =>
    setTIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const tNext = () => setTIdx((i) => (i + 1) % TESTIMONIALS.length);
  return (
    <div className="w-full">
      {/* ========================= HERO ========================= */}
      <section className="relative overflow-hidden rounded-3xl mb-10">
        {/* nền gradient + glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f12] via-[#0d1819] to-[#0a0f12]" />
        <div className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 -bottom-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

        {/* nội dung */}
        <div className="relative z-10 container grid grid-cols-12 gap-8 items-center py-10 md:py-14">
          {/* left text */}
          <div className="col-span-12 md:col-span-6">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Only <span className="text-[#00B3A4]">30 Minutes</span> and Just{" "}
              <span className="text-[#00B3A4]">2 Times / Week</span>
            </h1>
            <p className="mt-4 text-gray-300 max-w-[60ch]">
              Bài tập có hướng dẫn, thực đơn và video coaching để bạn đạt mục
              tiêu nhanh hơn. Tập ngắn gọn – hiệu quả – phù hợp người bận rộn.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/lesson"
                className="px-5 py-3 rounded-2xl bg-[#00B3A4] text-black font-semibold"
              >
                Explore Lessons
              </Link>
              <Link
                to="/program/fatloss"
                className="px-5 py-3 rounded-2xl border border-white/20 hover:bg-white/10"
              >
                Start Fatloss
              </Link>
            </div>
          </div>

          {/* right visual */}
          <div className="col-span-12 md:col-span-6 relative">
            <div className="mx-auto w-[300px] md:w-[380px] aspect-square rounded-full bg-gradient-to-br from-emerald-800/30 to-cyan-700/30 border border-white/10 overflow-hidden shadow-2xl">
              <img
                src="/images/home/coach.png"
                alt="Coach"
                className="w-full h-full object-cover object-[50%_20%]"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>

            {/* badges */}
            <Stat
              className="absolute left-1/2 -translate-x-1/2 -top-3"
              label="+1000 active members"
            />
            <Stat
              className="absolute right-2 top-6"
              label="200+ lessons"
              small
            />
            <Stat
              className="absolute left-4 bottom-6"
              label="~300 kcal / buổi"
              small
            />
          </div>
        </div>
      </section>
      {/* ========== WHAT OUR CUSTOMERS SAY (polished) ========== */}
      <section className="container py-10">
        <h2 className="text-xl md:text-2xl font-semibold mb-6">
          What Our Customers Say
        </h2>

        <div className="rounded-3xl border border-[#1c2227] bg-[#0f1214] p-5 md:p-7">
          <div className="grid grid-cols-12 gap-6 md:gap-8 items-center">
            {/* Left — hero / coach */}
            <div className="col-span-12 lg:col-span-5">
              <div className="relative mx-auto max-w-[420px] aspect-[4/3]">
                {/* glow */}
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-70
                          bg-[radial-gradient(ellipse_at_center,rgba(0,179,164,.28),rgba(0,179,164,.06)_70%,transparent_80%)]"
                />
                {/* current hero image */}
                <img
                  key={tIdx} /* đổi key để transition mượt mỗi lần slide */
                  src={TESTIMONIALS[tIdx]?.hero}
                  alt={TESTIMONIALS[tIdx]?.name || "Coach"}
                  className="relative z-10 h-full w-auto mx-auto object-contain
                       drop-shadow-[0_20px_60px_rgba(0,179,164,.25)]
                       transition-opacity duration-300"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            </div>

            {/* Right — quote card */}
            <div className="col-span-12 lg:col-span-7">
              <div
                className="relative overflow-hidden rounded-2xl p-5 md:p-7
                     text-black shadow-[0_10px_40px_rgba(0,179,164,.15)]
                     bg-gradient-to-br from-[#00B3A4]/85 via-[#00B3A4]/75 to-[#0aa39c]/65"
              >
                {/* quote icon */}
                <div className="absolute right-4 top-3 text-3xl md:text-4xl text-black/25 select-none">
                  “
                </div>

                {/* heading */}
                <div className="flex items-baseline gap-3">
                  <div className="text-base md:text-lg font-semibold tracking-tight">
                    {TESTIMONIALS[tIdx]?.name}
                  </div>
                  <div className="text-xs md:text-sm text-black/70">
                    {TESTIMONIALS[tIdx]?.role}
                  </div>
                </div>

                {/* content */}
                <p className="mt-3 md:mt-4 leading-relaxed md:text-[15px] text-black/90">
                  “{TESTIMONIALS[tIdx]?.quote}”
                </p>

                {/* controls - one consistent style */}
                <div className="mt-5 flex items-center gap-3">
                  {/* 1 kiểu nút dùng chung */}
                  <button
                    type="button"
                    onClick={tPrev}
                    aria-label="Previous"
                    className="h-10 w-10 grid place-items-center rounded-full
               border border-white/20 bg-white/15 text-black/80
               hover:bg-white/25 active:scale-95 transition
               focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                      <path
                        fill="currentColor"
                        d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={tNext}
                    aria-label="Next"
                    className="h-10 w-10 grid place-items-center rounded-full
               border border-white/20 bg-white/15 text-black/80
               hover:bg-white/25 active:scale-95 transition
               focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                      <path
                        fill="currentColor"
                        d="m8.59 16.59 1.41 1.41L16 12 10 6 8.59 7.41 12.17 11z"
                      />
                    </svg>
                  </button>

                  {/* dots */}
                  <div className="ml-1 flex items-center gap-1.5">
                    {TESTIMONIALS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTIdx(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={[
                          "h-2 rounded-full transition-all",
                          i === tIdx
                            ? "w-5 bg-black/70"
                            : "w-2.5 bg-black/40 hover:bg-black/55",
                        ].join(" ")}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ======================== BLOG POSTS ======================== */}
      <section className="container pb-12">
        <Heading title="Blog Posts" />
        <div className="grid grid-cols-12 gap-6">
          {BLOGS.map((b) => {
            const slug = b.slug || toSlug(b.title || String(b.id)); // tạo slug ổn định
            return (
              <Link
                key={b.id}
                to={`/blog/${slug}`} // <-- trỏ tới trang chi tiết blog
                className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-2xl overflow-hidden border border-[#1c2227] bg-[#15191d] hover:-translate-y-0.5 transition"
              >
                <div className="relative aspect-[16/10]">
                  <img
                    src={b.cover}
                    alt={b.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  {/* overlay gradient dưới + tag/time góc trái trên */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute left-3 top-3 text-[11px] px-2 py-1 rounded-md bg-black/60 border border-white/10">
                    {b.tag} • {b.mins} phút
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-medium leading-snug line-clamp-2">
                    {b.title}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =========================== PROGRAMS =========================== */}
      <section className="container pb-12">
        <Heading
          title="Programs"
          subtitle="Chọn lộ trình và theo sát trong 4 tuần."
        />
        <div className="grid grid-cols-12 gap-6">
          {Object.values(PLANS).map((p) => {
            const cover = getCoverSources(p);
            return (
              <Link
                key={p.key}
                to={`/program/${p.key}`}
                className="col-span-12 md:col-span-4 rounded-2xl overflow-hidden border border-[#1c2227] bg-[#15191d] hover:translate-y-[-2px] transition"
              >
                <div className="relative aspect-[16/9]">
                  <picture>
                    <source srcSet={cover.avif} type="image/avif" />
                    <source srcSet={cover.webp} type="image/webp" />
                    <img
                      src={cover.jpg}
                      alt={`${p.name} cover`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-lg font-semibold">
                    {p.name}
                  </div>
                </div>
                <div className="p-4 text-sm text-gray-300">{p.summary}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ====================== FEATURED LESSONS ====================== */}
      <section className="container pb-12">
        <Heading
          title="Featured Lessons"
          subtitle="Gợi ý nhanh để bạn bắt đầu vận động."
        />
        <div className="grid grid-cols-12 gap-6">
          {featuredLessons.map((l) => (
            <Link
              key={l.id}
              to={`/video?id=${l.id}`}
              className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-2xl overflow-hidden border border-[#1c2227] bg-[#15191d] hover:translate-y-[-2px] transition"
            >
              <div className="relative aspect-[16/10] bg-[#0f1214]">
                <img
                  src={getPosterUrl(l.slug)}
                  alt={l.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute left-3 top-3 text-xs px-2 py-1 rounded-lg bg-black/60 border border-white/10">
                  {l.duration} phút • {l.level}
                </div>
              </div>
              <div className="p-4">
                <div className="font-medium">{l.title}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {l.category} • {l.kcal} kcal
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================== MENU ============================ */}
      <section className="container pb-16">
        <Heading
          title="Menu Picks"
          subtitle="Bữa ăn phù hợp với lịch tập của bạn."
        />
        <div className="grid grid-cols-12 gap-6">
          {featuredMeals.map((m) => (
            <div
              key={m.id}
              className="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3 rounded-2xl border border-[#1c2227] overflow-hidden bg-[#15191d]"
            >
              <div className="relative aspect-[16/10] bg-[#0f1214]">
                <img
                  src={imgOf(m.slug)}
                  alt={m.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <div className="absolute left-3 top-3 text-xs px-2 py-1 rounded-lg bg-black/60 border border-white/10">
                  {m.kcal} kcal
                </div>
              </div>
              <div className="p-4">
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  ${m.price.toFixed(2)} • {m.category}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            to="/menu"
            className="px-5 py-3 rounded-2xl border border-[#1c2227] hover:bg-white/5"
          >
            Xem toàn bộ menu →
          </Link>
        </div>
      </section>

      {/* ====================== JOIN OUR COMMUNITY ====================== */}
      <JoinCommunity />

      {/* ============================= FAQ ============================= */}
      <FAQ />
    </div>
  );
}

/* ---------------------------- small bits ---------------------------- */

function Stat({ label, small, className = "" }) {
  return (
    <div
      className={
        "rounded-full border border-white/20 bg-black/40 backdrop-blur px-3 py-1 text-xs text-white " +
        (small ? "" : "text-sm font-semibold") +
        " " +
        className
      }
    >
      {label}
    </div>
  );
}

function Heading({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
      {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

/* ------------------------- Join our community ------------------------- */
function JoinCommunity() {
  const [tab, setTab] = useState("signup"); // signup | login

  return (
    <section className="container pb-16">
      <Heading title="Join Our 32 Community" />
      <div className="rounded-2xl border border-[#1c2227] bg-[#15191d] p-5 md:p-7 grid grid-cols-12 gap-6">
        {/* info left */}
        <div className="col-span-12 md:col-span-6">
          <h3 className="text-lg font-semibold text-white">
            Transform Your Body
          </h3>
          <p className="mt-2 text-gray-300">
            Cộng đồng tập luyện thân thiện, chia sẻ kinh nghiệm và tài nguyên
            miễn phí. Hãy tham gia để nhận email tổng hợp và lộ trình mẫu.
          </p>

          <ul className="mt-4 space-y-2 text-gray-300">
            <li>• Lịch tập 4 tuần theo mục tiêu</li>
            <li>• Mẫu thực đơn từ 1.800–2.200 kcal</li>
            <li>• Nhận tips tập – ăn mỗi tuần</li>
          </ul>

          <div className="mt-6 flex items-center gap-4 text-2xl text-gray-300">
            <IconInstagram />
            <IconX />
            <IconYoutube />
          </div>
        </div>

        {/* form right */}
        <div className="col-span-12 md:col-span-6">
          <div className="flex rounded-xl overflow-hidden border border-[#1c2227]">
            <button
              onClick={() => setTab("signup")}
              className={`w-1/2 py-2 text-sm ${
                tab === "signup" ? "bg-[#00B3A4] text-black" : "bg-white/5"
              }`}
            >
              Sign up
            </button>
            <button
              onClick={() => setTab("login")}
              className={`w-1/2 py-2 text-sm ${
                tab === "login" ? "bg-[#00B3A4] text-black" : "bg-white/5"
              }`}
            >
              Login
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {tab === "signup" && (
              <>
                <input
                  className="w-full rounded-xl bg-[#0f1317] border border-[#1c2227] px-4 py-3 outline-none"
                  placeholder="Họ tên"
                />
                <input
                  className="w-full rounded-xl bg-[#0f1317] border border-[#1c2227] px-4 py-3 outline-none"
                  placeholder="Email"
                  type="email"
                />
                <input
                  className="w-full rounded-xl bg-[#0f1317] border border-[#1c2227] px-4 py-3 outline-none"
                  placeholder="Mật khẩu"
                  type="password"
                />
                <button className="w-full rounded-xl bg-[#00B3A4] text-black font-semibold py-3">
                  Sign up
                </button>
              </>
            )}

            {tab === "login" && (
              <>
                <input
                  className="w-full rounded-xl bg-[#0f1317] border border-[#1c2227] px-4 py-3 outline-none"
                  placeholder="Email"
                  type="email"
                />
                <input
                  className="w-full rounded-xl bg-[#0f1317] border border-[#1c2227] px-4 py-3 outline-none"
                  placeholder="Mật khẩu"
                  type="password"
                />
                <button className="w-full rounded-xl bg-[#00B3A4] text-black font-semibold py-3">
                  Login
                </button>
              </>
            )}

            <button className="w-full rounded-xl border border-[#1c2227] py-3 hover:bg-white/5">
              {tab === "signup" ? "Đăng ký với Google" : "Đăng nhập với Google"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- FAQ ------------------------------- */
function FAQ() {
  const items = [
    {
      q: "32 là gì và giúp gì cho mục tiêu của tôi?",
      a: "32 là hệ lộ trình tập + thực đơn ngắn gọn (30 phút, 2 buổi/tuần) tập trung tính khả thi. Bạn sẽ được hướng dẫn rõ ràng, dễ theo dõi và duy trì.",
    },
    {
      q: "Có cần thiết bị hay phòng gym không?",
      a: "Bạn có thể bắt đầu với trọng lượng cơ thể. Một số buổi có gợi ý tạ đơn/kháng lực để tăng độ khó.",
    },
    {
      q: "Khi đăng ký các gói có lợi ích gì?",
      a: "Bạn mở khóa thêm bài Premium, lịch tập chi tiết và coaching qua video ở các gói cao hơn.",
    },
    {
      q: "Chính sách hoàn tiền / hỗ trợ thế nào?",
      a: "Nếu có lỗi kỹ thuật hay chưa phù hợp, hãy liên hệ hỗ trợ – chúng tôi luôn ưu tiên trải nghiệm của bạn.",
    },
  ];
  const [open, setOpen] = useState(0);

  return (
    <section className="container pb-20">
      <Heading title="FAQ" />
      <div className="rounded-2xl border border-[#1c2227] overflow-hidden">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="border-b border-[#1c2227]">
              <button
                className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-white/5"
                onClick={() => setOpen((v) => (v === i ? -1 : i))}
              >
                <span className="font-medium">{it.q}</span>
                <span className="text-xl">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && <div className="px-4 pb-4 text-gray-300">{it.a}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------- icons ------------------------------ */
function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="12"
        cy="12"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}
function IconX() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path d="M3 3l18 18M21 3L3 21" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function IconYoutube() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path
        d="M22 12s0-4-1-5-5-1-9-1-8 0-9 1-1 5-1 5 0 4 1 5 5 1 9 1 8 0 9-1 1-5 1-5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M10 9l5 3-5 3V9z" fill="currentColor" />
    </svg>
  );
}
