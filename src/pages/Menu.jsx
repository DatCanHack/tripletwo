// src/pages/Menu.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MENU,
  CATS,
  DIETS,
  KCAL_BUCKETS,
  SORTS,
  imgOf,
  kcalBucket,
  getFeatured,
  getRecommended,
} from "../lib/menu";

/* ==================== Modal hiển thị chi tiết & công thức ==================== */
function RecipeModal({ item, onClose, onAdd, isAdded }) {
  if (!item) return null;
  const { name, slug, kcal, protein, carbs, fat, price, recipe } = item;

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-[min(760px,95vw)] rounded-2xl border border-[#1c2227] bg-[#0f1214] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1c2227]">
          <div className="font-semibold">{name}</div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white rounded-lg px-2 py-1"
          >
            ✕
          </button>
        </div>

        <div className="p-5 grid grid-cols-12 gap-5">
          {/* ảnh minh hoạ */}
          <div className="col-span-12 md:col-span-5">
            <div className="relative aspect-[4/3] bg-[#0b0e11] rounded-xl overflow-hidden border border-white/10">
              <img
                src={imgOf(slug)}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div className="absolute left-3 top-3 text-xs px-2 py-1 rounded-lg bg-black/60 border border-white/10">
                {kcal} kcal
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="text-center rounded-lg bg-black/40 border border-white/10 px-2 py-1">
                {protein}P
              </div>
              <div className="text-center rounded-lg bg-black/40 border border-white/10 px-2 py-1">
                {carbs}C
              </div>
              <div className="text-center rounded-lg bg-black/40 border border-white/10 px-2 py-1">
                {fat}F
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-300">
              Giá ước tính: ${price.toFixed(2)}
            </div>
          </div>

          {/* công thức */}
          <div className="col-span-12 md:col-span-7">
            <div className="space-y-3">
              <div>
                <div className="font-semibold mb-1">Nguyên liệu</div>
                <ul className="list-disc ms-5 space-y-1 text-sm text-gray-300">
                  {(recipe?.ingredients || []).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-semibold mb-1">Cách chế biến</div>
                <ol className="list-decimal ms-5 space-y-1 text-sm text-gray-300">
                  {(recipe?.steps || []).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button
                disabled={isAdded}
                onClick={() => {
                  onAdd?.(item);
                  onClose?.();
                }}
                className={`px-4 py-2 rounded-xl font-semibold ${
                  isAdded
                    ? "bg-white/10 text-white/60 cursor-not-allowed"
                    : "bg-[#00B3A4] text-black"
                }`}
              >
                {isAdded ? "Added ✓" : "Add to Meal Plan"}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#1c2227] hover:bg-white/5"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================= Drawer xem Meal Plan ======================= */
function MealPlanDrawer({ open, items, onRemove, onClear, onClose }) {
  const totals = useMemo(
    () =>
      items.reduce(
        (acc, it) => {
          acc.kcal += it.kcal || 0;
          acc.protein += it.protein || 0;
          acc.carbs += it.carbs || 0;
          acc.fat += it.fat || 0;
          acc.price += it.price || 0;
          return acc;
        },
        { kcal: 0, protein: 0, carbs: 0, fat: 0, price: 0 }
      ),
    [items]
  );

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000]">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="absolute right-0 top-0 h-full w-[min(420px,95vw)] bg-[#0f1214] border-l border-[#1c2227] shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1c2227]">
          <div className="font-semibold">Your Meal Plan</div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClear}
                className="text-sm text-red-300/90 hover:text-red-200"
                title="Clear all"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white rounded-lg px-2 py-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-3 space-y-3 overflow-y-auto h-[calc(100%-190px)]">
          {items.length === 0 && (
            <div className="text-sm text-gray-400 px-2 py-8 text-center">
              Chưa có món nào. Hãy bấm “Add to plan” để thêm.
            </div>
          )}

          {items.map((it) => (
            <div
              key={it.id}
              className="flex items-center gap-3 rounded-xl border border-[#1c2227] p-2"
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#0b0e11]">
                <img
                  src={imgOf(it.slug)}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium">{it.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {it.kcal} kcal • {it.protein}P {it.carbs}C {it.fat}F
                </div>
                <div className="text-xs text-gray-300 mt-0.5">
                  ${it.price.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => onRemove(it.id)}
                className="text-sm px-2 py-1 rounded-lg border border-[#1c2227] hover:bg-white/5"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-[#1c2227] p-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-white/5 p-2">
              <div className="text-gray-400 text-xs">Calories</div>
              <div className="font-semibold">{totals.kcal} kcal</div>
            </div>
            <div className="rounded-lg bg-white/5 p-2">
              <div className="text-gray-400 text-xs">Macros P/C/F</div>
              <div className="font-semibold">
                {totals.protein} / {totals.carbs} / {totals.fat}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-gray-400 text-sm">Estimated cost</div>
            <div className="text-lg font-extrabold">
              ${totals.price.toFixed(2)}
            </div>
          </div>
          <button
            className="mt-3 w-full rounded-xl bg-[#00B3A4] text-black font-semibold py-2"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ================================== Page ================================== */
export default function Menu() {
  // trạng thái filter cho khu vực All Menu
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [diet, setDiet] = useState("All");
  const [kcal, setKcal] = useState("All");
  const [sort, setSort] = useState("Popular");
  const [fav, setFav] = useState({}); // id -> boolean

  // modal & meal plan
  const [openItem, setOpenItem] = useState(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [planItems, setPlanItems] = useState([]);

  const toggleFav = (id) => setFav((m) => ({ ...m, [id]: !m[id] }));
  const isInPlan = (id) => planItems.some((x) => x.id === id);
  const addToPlan = (it) =>
    setPlanItems((arr) =>
      arr.find((x) => x.id === it.id) ? arr : [...arr, it]
    );
  const removeFromPlan = (id) =>
    setPlanItems((arr) => arr.filter((x) => x.id !== id));
  const clearPlan = () => setPlanItems([]);

  // danh sách cho All Menu
  const filtered = useMemo(() => {
    let arr = MENU.filter((it) => {
      const matchQ = !q || it.name.toLowerCase().includes(q.toLowerCase());
      const matchCat = cat === "All" || it.category === cat;
      const matchDt = diet === "All" || it.tags.includes(diet);
      const matchK = kcal === "All" || kcalBucket(it.kcal) === kcal;
      return matchQ && matchCat && matchDt && matchK;
    });
    switch (sort) {
      case "Calories ↑":
        arr.sort((a, b) => a.kcal - b.kcal);
        break;
      case "Calories ↓":
        arr.sort((a, b) => b.kcal - a.kcal);
        break;
      case "Protein ↑":
        arr.sort((a, b) => a.protein - b.protein);
        break;
      case "Protein ↓":
        arr.sort((a, b) => b.protein - a.protein);
        break;
      case "Price ↑":
        arr.sort((a, b) => a.price - b.price);
        break;
      case "Price ↓":
        arr.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    return arr;
  }, [q, cat, diet, kcal, sort]);

  const featured = useMemo(() => getFeatured(6), []); // chỉ để lấy heroFood
  const recommended = useMemo(() => getRecommended(6), []);
  const heroFood = featured[0] || MENU[0];

  return (
    <div className="w-full">
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden border-b border-[#12171b]">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_380px_at_20%_-10%,rgba(0,179,164,.25),transparent),linear-gradient(to_bottom_right,#0b1013,#0f1719)]" />
        <div className="relative container py-8 md:py-10 grid grid-cols-12 gap-6 items-center">
          {/* Left text */}
          <div className="col-span-12 md:col-span-6">
            <p className="text-sm text-gray-400">Healthy Menu</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-extrabold leading-tight">
              Only <span className="text-[#00B3A4]">30 Minute</span>
              <br />
              Just <span className="text-[#00B3A4]">2 Times</span>
            </h1>
            <p className="mt-4 text-gray-300 max-w-[60ch]">
              Chọn nhanh bữa ăn theo mục tiêu & macros. Gợi ý đi kèm workout để
              bạn theo sát lộ trình.
            </p>

            {/* QUICK CHIPS (đã bỏ search ở HERO) */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {["Breakfast", "Lunch", "Dinner"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-3 py-1.5 rounded-xl text-sm border ${
                    cat === c
                      ? "bg-[#00B3A4] text-black border-[#00B3A4]"
                      : "border-[#1c2227] bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {c}
                </button>
              ))}
              <button
                onClick={() => setCat("All")}
                className={`px-3 py-1.5 rounded-xl text-sm border ${
                  cat === "All"
                    ? "border-[#00B3A4] text-[#00B3A4]"
                    : "border-[#1c2227] hover:bg-white/5"
                }`}
              >
                All
              </button>
            </div>

            {/* NÚT MEAL PLAN — nổi bật */}
            <div className="mt-5">
              <button
                onClick={() => setPlanOpen(true)}
                className="group inline-flex items-center gap-2 rounded-2xl bg-[#00B3A4]
                           text-black font-semibold px-4 py-2 shadow-[0_10px_24px_rgba(0,179,164,.35)]
                           ring-2 ring-[#00B3A4]/50 hover:translate-y-[-1px] transition"
                title="Open Meal Plan"
              >
                {/* icon clipboard/list */}
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path
                    fill="currentColor"
                    d="M9 3h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1V5a2 2 0 0 1 2-2Zm0 3V5h6v1H9Z"
                  />
                </svg>
                Open Meal Plan
                <span className="ml-1 text-xs rounded-full bg-black/20 px-2 py-0.5 font-bold">
                  {planItems.length}
                </span>
              </button>
            </div>
          </div>

          {/* Right visual */}
          <div className="col-span-12 md:col-span-6">
            <div className="relative mx-auto w-[min(560px,90%)] aspect-[4/3] rounded-[28px] overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,179,164,.25)]">
              <img
                src={imgOf(heroFood?.slug)}
                alt={heroFood?.name || "Food"}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div className="absolute right-4 top-4 px-3 py-1.5 rounded-lg text-xs bg-black/60 border border-white/10">
                {heroFood?.kcal} kcal
              </div>
              <div className="absolute left-4 bottom-4">
                <div className="text-lg font-semibold">{heroFood?.name}</div>
                <div className="mt-1 text-sm text-gray-300">
                  {heroFood?.protein}P • {heroFood?.carbs}C • {heroFood?.fat}F
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== ALL MENU (giữ search ở toolbar phía dưới) ============== */}
      <section className="container pb-12">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search meals..."
                    className="w-full sm:w-72 rounded-xl bg-[#0f1317] border border-[#1c2227] focus:border-[#00B3A4] outline-none px-4 py-2.5"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    ⌘K
                  </span>
                </div>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-xl bg-[#0f1317] border border-[#1c2227] focus:border-[#00B3A4] outline-none px-3 py-2.5"
                >
                  {SORTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  className="rounded-xl bg-[#0f1317] border border-[#1c2227] focus:border-[#00B3A4] outline-none px-3 py-2.5"
                >
                  {CATS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={diet}
                  onChange={(e) => setDiet(e.target.value)}
                  className="rounded-xl bg-[#0f1317] border border-[#1c2227] focus:border-[#00B3A4] outline-none px-3 py-2.5"
                >
                  {DIETS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                <select
                  value={kcal}
                  onChange={(e) => setKcal(e.target.value)}
                  className="rounded-xl bg-[#0f1317] border border-[#1c2227] focus:border-[#00B3A4] outline-none px-3 py-2.5"
                >
                  {KCAL_BUCKETS.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category quick tabs */}
            <div className="mt-6 flex flex-wrap gap-2">
              {CATS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-3 py-1.5 rounded-xl text-sm border ${
                    cat === c
                      ? "bg-[#00B3A4] text-black border-[#00B3A4]"
                      : "border-[#1c2227] hover:bg-[#15191d]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="mt-8 grid grid-cols-12 gap-6">
              {filtered.map((m) => (
                <Card
                  key={m.id}
                  item={m}
                  fav={!!fav[m.id]}
                  onFav={() => toggleFav(m.id)}
                  onOpen={() => setOpenItem(m)}
                  className="col-span-12 sm:col-span-6 lg:col-span-4"
                />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-12 text-center text-gray-400 py-16">
                  Không tìm thấy món phù hợp.
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar recommended (desktop) */}
          <aside className="hidden xl:block w-[320px] shrink-0">
            <div className="rounded-2xl border border-[#1c2227] bg-[#0f1214] p-4 sticky top-20">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Recommended Menu</div>
                <span className="text-xs text-emerald-300">For you</span>
              </div>
              <div className="space-y-3">
                {recommended.map((m) => (
                  <MiniCard key={m.id} item={m} onOpen={() => setOpenItem(m)} />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Floating Meal Plan button */}
      <button
        onClick={() => setPlanOpen(true)}
        className="
    fixed bottom-6 left-6 z-[996]
    h-14 w-14 rounded-full
    bg-[#00B3A4] text-black
    shadow-[0_0_0_8px_rgba(0,179,164,.15)]
    hover:scale-105 transition
    grid place-items-center
  "
        title="Open Meal Plan"
      >
        {/* icon túi đồ ăn / giỏ */}
        <svg viewBox="0 0 24 24" className="w-6 h-6">
          <path
            fill="currentColor"
            d="M7 7h10l1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM9 7a3 3 0 1 1 6 0"
          />
        </svg>

        {/* badge số lượng – vẫn để góc trên bên phải của nút */}
        <span
          className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full
                   text-[11px] bg-black/80 text-white grid place-items-center"
        >
          {planItems.length}
        </span>
      </button>
      {/* Modals & Drawer */}
      {openItem && (
        <RecipeModal
          item={openItem}
          onClose={() => setOpenItem(null)}
          onAdd={addToPlan}
          isAdded={isInPlan(openItem.id)}
        />
      )}
      <MealPlanDrawer
        open={planOpen}
        items={planItems}
        onRemove={removeFromPlan}
        onClear={clearPlan}
        onClose={() => setPlanOpen(false)}
      />
    </div>
  );
}

/* ================================ Cards ================================ */
function Card({
  item,
  fav,
  onFav,
  onOpen,
  className = "col-span-12 sm:col-span-6 lg:col-span-3",
}) {
  const { name, slug, kcal, protein, carbs, fat, price, tags } = item;
  return (
    <div
      className={`${className} rounded-2xl border border-[#1c2227] overflow-hidden bg-[#15191d] hover:translate-y-[-2px] transition`}
    >
      <div className="relative aspect-[16/10] bg-[#0f1214]">
        <img
          src={imgOf(slug)}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute left-3 top-3 text-xs px-2 py-1 rounded-lg bg-black/60 backdrop-blur border border-white/10">
          {kcal} kcal
        </div>
        <button
          onClick={onFav}
          title="Favorite"
          className={`absolute right-3 top-3 w-8 h-8 rounded-full border backdrop-blur flex items-center justify-center ${
            fav
              ? "bg-[#00B3A4] text-black border-[#00B3A4]"
              : "bg-black/50 border-white/10 text-white hover:bg-white/10"
          }`}
        >
          ♥
        </button>
      </div>
      <div className="p-4">
        <div className="font-medium">{name}</div>
        <div className="text-xs text-gray-400 mt-0.5">${price.toFixed(2)}</div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <Chip label={`${protein}P`} />
          <Chip label={`${carbs}C`} />
          <Chip label={`${fat}F`} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {tags.slice(0, 3).map((t) => (
            <Tag key={t} text={t} />
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={onOpen}
            className="flex-1 px-3 py-2 rounded-xl bg-[#00B3A4] text-black text-sm font-semibold"
          >
            Add to plan
          </button>
          <Link
            to="/lesson"
            className="px-3 py-2 rounded-xl border border-[#1c2227] text-sm hover:bg-white/5"
          >
            Pair workout
          </Link>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ item, onOpen }) {
  const { name, slug, kcal } = item;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#1c2227] bg-[#0b0f12] p-2">
      <div className="relative w-20 h-16 shrink-0 rounded-lg overflow-hidden border border-white/10">
        <img
          src={imgOf(slug)}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        <div className="absolute left-1 top-1 text-[10px] px-1.5 py-[2px] rounded bg-black/60 border border-white/10">
          {kcal}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{name}</div>
        <div className="text-xs text-gray-400">Recommended</div>
      </div>
      <button
        onClick={onOpen}
        title="Xem công thức"
        className="w-8 h-8 rounded-full bg-[#00B3A4] text-black font-bold"
      >
        +
      </button>
    </div>
  );
}

/* =============================== tiny atoms =============================== */
function Chip({ label }) {
  return (
    <div className="text-center rounded-lg bg-black/40 border border-white/10 px-2 py-1">
      {label}
    </div>
  );
}
function Tag({ text }) {
  return (
    <div className="text-[11px] px-2 py-1 rounded-lg bg-black/40 border border-white/10">
      {text}
    </div>
  );
}
