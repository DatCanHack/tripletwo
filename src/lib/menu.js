// src/libs/menu.js

/* ======================= Constants ======================= */
export const CATS = ["All", "Breakfast", "Lunch", "Dinner"];

export const DIETS = [
  "All",
  "High-Protein",
  "Low-Carb",
  "Gluten-Free",
  "Vegetarian",
  "Vegan",
];

export const KCAL_BUCKETS = ["All", "<300", "300–500", ">500"];

export const SORTS = [
  "Popular",
  "Calories ↑",
  "Calories ↓",
  "Protein ↑",
  "Protein ↓",
  "Price ↑",
  "Price ↓",
];

/* ======================= Helpers ======================= */
// slug -> ảnh minh hoạ. Bạn chỉ cần đặt ảnh đúng tên trong /public/images/menu/
export function imgOf(slug, ext = "jpg") {
  return `/images/menu/${slug}.${ext}`;
}

export function kcalBucket(k) {
  if (k < 300) return "<300";
  if (k <= 500) return "300–500";
  return ">500";
}

const slugify = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/* ======================= Data ======================= */
/**
 * Trường dữ liệu mỗi món:
 * id, name, slug, category, kcal, protein, carbs, fat, price, tags[], recipe?
 */
export const MENU = [
  /* ---------- Breakfast sample ---------- */
  {
    id: 101,
    name: "Cơm gạo lứt – tôm – bông cải – cà rốt – nấm",
    slug: "brown-rice-shrimp-broccoli-carrot-mushroom",
    category: "Breakfast",
    kcal: 320,
    protein: 22,
    carbs: 48,
    fat: 8,
    price: 3.9,
    tags: ["High-Fiber", "Gluten-Free"],
    recipe: {
      ingredients: [
        "100g gạo lứt",
        "1 nõn bông cải xanh",
        "5 con tôm bóc nõn",
        "10g nấm (tuỳ loại)",
        "1/2 củ cà rốt",
        "Muối, tiêu, dầu ăn",
      ],
      steps: [
        "Vo gạo lứt, nấu chín (cho hơi nhiều nước hơn gạo trắng).",
        "Bông cải/cà rốt rửa sạch, cắt miếng vừa, luộc chín.",
        "Tôm ướp muối/tiêu, áp chảo chín vàng; xào sơ nấm.",
        "Bày cơm, tôm, cà rốt, bông cải, nấm ra đĩa và dùng nóng.",
      ],
    },
  },

  /* ---------- Lunch sample ---------- */
  {
    id: 201,
    name: "Cơm gạo lứt – ức gà – trứng – xà lách – cà rốt",
    slug: "brown-rice-chicken-egg-lettuce-carrot",
    category: "Lunch",
    kcal: 520,
    protein: 42,
    carbs: 46,
    fat: 18,
    price: 6.5,
    tags: ["High-Protein"],
    recipe: {
      ingredients: [
        "100g gạo lứt",
        "200g ức gà",
        "1 quả trứng gà",
        "1/2 củ cà rốt",
        "1 cây xà lách nhỏ",
        "Muối, tiêu, dầu ăn",
      ],
      steps: [
        "Nấu cơm gạo lứt.",
        "Ức gà khía mặt, ướp muối/tiêu, áp chảo chín vàng.",
        "Trứng luộc chín, bổ đôi. Cà rốt luộc, thái lát. Xà lách rửa sạch.",
        "Cho cơm ra đĩa, xếp gà, trứng, xà lách, cà rốt lên trên.",
      ],
    },
  },

  /* ---------- Dinner sample ---------- */
  {
    id: 301,
    name: "Salad tôm rong nho sốt mè rang",
    slug: "shrimp-sea-grapes-salad-sesame",
    category: "Dinner",
    kcal: 280,
    protein: 18,
    carbs: 20,
    fat: 12,
    price: 4.2,
    tags: ["Gluten-Free", "Low-Carb"],
    recipe: {
      ingredients: [
        "Rau xà lách, bắp cải tím, bắp, cà rốt",
        "Tôm",
        "Rong nho",
        "Sốt mè rang đóng chai",
      ],
      steps: [
        "Sơ chế tôm, bỏ chỉ lưng; luộc chín, bóc vỏ.",
        "Rửa rong nho, ngâm nhanh với nước đá cho giòn.",
        "Cà rốt/bắp cải cắt sợi (luộc qua nếu thích).",
        "Trộn xà lách + bắp cải + bắp + cà rốt + tôm + rong nho với sốt mè rang.",
      ],
    },
  },

  /* ---------- Recommended sample ---------- */
  {
    id: 401,
    name: "Salad tôm trứng sốt bơ đậu phộng",
    slug: "shrimp-egg-salad-peanut-butter-dressing",
    category: "Dinner",
    kcal: 340,
    protein: 24,
    carbs: 16,
    fat: 20,
    price: 4.8,
    tags: ["High-Protein"],
    recommended: true,
    recipe: {
      ingredients: [
        "Rau xà lách, ớt chuông, cà chua bi, bơ",
        "Tôm; trứng gà luộc",
        "Bơ đậu phộng, nước lọc, muối, đường, nước cốt chanh",
      ],
      steps: [
        "Tôm sơ chế, luộc chín; trứng luộc, bóc vỏ, cắt múi.",
        "Ớt chuông cắt sợi, cà chua bi cắt đôi, bơ cắt khối.",
        "Pha sốt: bơ đậu phộng + muối + đường + nước cốt chanh + ít nước.",
        "Trộn đều rau + tôm + trứng + bơ + ớt chuông + cà chua với sốt.",
      ],
    },
  },

  /* --------- vài món bổ sung để có lưới đẹp --------- */
  {
    id: 102,
    name: "Yến Mạch & Berry",
    slug: "oats-berry",
    category: "Breakfast",
    kcal: 280,
    protein: 12,
    carbs: 46,
    fat: 8,
    price: 3.2,
    tags: ["Vegetarian", "High-Fiber"],
  },
  {
    id: 202,
    name: "Bánh mì nướng bơ",
    slug: "avocado-toast",
    category: "Lunch",
    kcal: 360,
    protein: 8,
    carbs: 34,
    fat: 12,
    price: 4.2,
    tags: ["Vegetarian"],
  },
  {
    id: 302,
    name: "Gà nướng",
    slug: "grilled-chicken",
    category: "Dinner",
    kcal: 420,
    protein: 42,
    carbs: 12,
    fat: 18,
    price: 6.5,
    tags: ["High-Protein", "Gluten-Free"],
  },
];

/* ======================= Selectors ======================= */
export const getBySlug = (slug) => MENU.find((m) => m.slug === slug);
export const getById = (id) => MENU.find((m) => m.id === Number(id));

export const getFeatured = (n = 8) =>
  MENU.filter((m) =>
    ["Breakfast", "Lunch", "Dinner"].includes(m.category)
  ).slice(0, n);

export const getRecommended = (n = 6) =>
  MENU.filter((m) => m.recommended).slice(0, n);
