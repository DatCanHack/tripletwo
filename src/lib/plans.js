// src/lib/plans.js

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const isRestDay = (title) => /rest/i.test(title);

// --- Weekly plans ---
export const WEEKS_FATLOSS = [
  {
    week: 1,
    days: [
      "Full Body Burn",
      "Mobility Reset",
      "Rest",
      "Strength Foundations",
      "Yoga Flow",
      "Rest",
      "HIIT Sprint",
    ],
  },
  {
    week: 2,
    days: [
      "Metcon Circuit",
      "Mobility Reset",
      "Rest",
      "Legs & Glutes",
      "Yoga Flow",
      "Rest",
      "Core Crusher",
    ],
  },
  {
    week: 3,
    days: [
      "Full Body Burn",
      "Mobility Reset",
      "Rest",
      "Upper Body Power",
      "Yoga Flow",
      "Rest",
      "HIIT Sprint",
    ],
  },
  {
    week: 4,
    days: [
      "Metcon Circuit",
      "Mobility Reset",
      "Rest",
      "Legs & Glutes",
      "Power Yoga",
      "Rest",
      "Conditioning Mix",
    ],
  },
];

export const WEEKS_STRENGTH = [
  {
    week: 1,
    days: [
      "Upper Body Power",
      "Mobility Reset",
      "Rest",
      "Legs & Glutes",
      "Core Crusher",
      "Rest",
      "Rest",
    ],
  },
  {
    week: 2,
    days: [
      "Strength Foundations",
      "Mobility Reset",
      "Rest",
      "Upper Body Power",
      "Legs & Glutes",
      "Rest",
      "Rest",
    ],
  },
  {
    week: 3,
    days: [
      "Upper Body Power",
      "Mobility Reset",
      "Rest",
      "Power Yoga",
      "Legs & Glutes",
      "Rest",
      "Rest",
    ],
  },
  {
    week: 4,
    days: [
      "Metcon Circuit",
      "Mobility Reset",
      "Rest",
      "Strength Foundations",
      "Legs & Glutes",
      "Rest",
      "Rest",
    ],
  },
];

export const WEEKS_YOGA = [
  {
    week: 1,
    days: [
      "Yoga Flow",
      "Balance & Stretch",
      "Rest",
      "Power Yoga",
      "Mobility Reset",
      "Rest",
      "Yoga Flow",
    ],
  },
  {
    week: 2,
    days: [
      "Balance & Stretch",
      "Yoga Flow",
      "Rest",
      "Power Yoga",
      "Mobility Reset",
      "Rest",
      "Yoga Flow",
    ],
  },
  {
    week: 3,
    days: [
      "Yoga Flow",
      "Mobility Reset",
      "Rest",
      "Power Yoga",
      "Balance & Stretch",
      "Rest",
      "Yoga Flow",
    ],
  },
  {
    week: 4,
    days: [
      "Yoga Flow",
      "Balance & Stretch",
      "Rest",
      "Power Yoga",
      "Mobility Reset",
      "Rest",
      "Yoga Flow",
    ],
  },
];

// --- Metadata + cover + accent color ---
export const PLANS = {
  fatloss: {
    key: "fatloss",
    name: "Fatloss",
    weeks: WEEKS_FATLOSS,
    stats: { sessionsPerWeek: "3", duration: "~30m", goal: "−0.5~1kg/tuần" },
    summary:
      "Lộ trình đốt mỡ an toàn: HIIT + sức mạnh cơ bản + mobility để bảo toàn cơ nạc.",
    guide: [
      "Deficit ~10–20% TDEE; protein 1.6–2.2 g/kg; ngủ 7–8h",
      "Cardio cường độ vừa giữa các buổi để hồi phục",
      "Ưu tiên kỹ thuật, tránh quá tải đột ngột",
    ],
    cover: "/images/plans/fatloss", // .avif | .webp | .jpg
    color: "#00B3A4",
  },
  strength: {
    key: "strength",
    name: "Strength",
    weeks: WEEKS_STRENGTH,
    stats: {
      sessionsPerWeek: "3–4",
      duration: "30–40m",
      goal: "Tăng sức mạnh",
    },
    summary:
      "Tập trung compound (đẩy/kéo/chân), xen kẽ mobility & core để ổn định.",
    guide: [
      "Progressive overload vừa phải; ghi log tải & reps",
      "Ưu tiên kỹ thuật; warm-up khớp & động",
      "Protein cao; carb quanh buổi tập để có sức",
    ],
    cover: "/images/plans/strength",
    color: "#F59E0B", // amber
  },
  yoga: {
    key: "yoga",
    name: "Yoga",
    weeks: WEEKS_YOGA,
    stats: {
      sessionsPerWeek: "3–4",
      duration: "20–35m",
      goal: "Dẻo – thăng bằng",
    },
    summary:
      "Flow nhẹ – power – stretch, tập trung hơi thở, kiểm soát và phạm vi vận động.",
    guide: [
      "Thở đều, đừng nín thở; lắng nghe cơ thể",
      "Tập đều mỗi tuần, không cần quá dài",
      "Kết hợp đi bộ/đạp xe nhẹ ngày nghỉ",
    ],
    cover: "/images/plans/yoga",
    color: "#8B5CF6", // violet
  },
};

export const getPlan = (key) => PLANS[key] || PLANS.fatloss;
export const getPlanKeys = () => Object.keys(PLANS);

// Helper trả về <picture> sources (chỉ dùng tiện trong JSX)
export const getCoverSources = (plan) => ({
  avif: `${plan.cover}.avif`,
  webp: `${plan.cover}.webp`,
  jpg: `${plan.cover}.jpg`,
});
