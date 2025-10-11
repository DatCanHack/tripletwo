// src/lib/subscription.js

// Mã tính năng dùng chung toàn app
export const FEAT = {
  LESSONS_BASIC: "lessons_basic",
  ALL_LESSONS: "all_lessons",
  VIDEO_1080P: "video_1080p",
  PROGRAM_4W: "program_4w",
  MENU_SPECIAL: "menu_specialized",
  SYNC: "sync_multi_device",
  COACH_1_1: "coach_1_1",
  OFFLINE: "offline",
};

// Năng lực theo gói (free chỉ để tham chiếu)
export const CAPS = {
  free: [FEAT.LESSONS_BASIC],
  basic: [FEAT.LESSONS_BASIC],
  pro: [
    FEAT.ALL_LESSONS,
    FEAT.VIDEO_1080P,
    FEAT.PROGRAM_4W,
    FEAT.MENU_SPECIAL,
    FEAT.SYNC,
  ],
  elite: [
    FEAT.ALL_LESSONS,
    FEAT.VIDEO_1080P,
    FEAT.PROGRAM_4W,
    FEAT.MENU_SPECIAL,
    FEAT.SYNC,
    FEAT.COACH_1_1,
    FEAT.OFFLINE,
  ],
};

export const planHas = (plan, code) => (CAPS[plan] || []).includes(code);

// Meta để hiển thị badge
export const PLAN_META = {
  free: { name: "Free", abbr: "F", color: "#64748b" }, // slate
  basic: { name: "Basic", abbr: "B", color: "#64748b" },
  pro: { name: "Pro", abbr: "P", color: "#00B3A4" },
  elite: { name: "Elite", abbr: "E", color: "#F59E0B" },
};
