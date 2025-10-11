// ============================================================================
// /src/lib/lesson.js
// 1 nơi duy nhất quản lý dữ liệu + helpers cho 3 route:
//   - ROUTE A:  /lesson                 (LessonIndex.jsx)  → Category → Lessons
//   - ROUTE B:  /lesson/:id             (LessonDetail.jsx) → 1 Lesson/Series
//   - ROUTE C:  /lesson/:id/watch       (LessonWatch.jsx)  → Video trong Lesson
// Không import từ file khác để tránh vòng lặp.
// ============================================================================

// --------------------------- Assets helpers (B,C) ----------------------------
const POSTER_DIR = "/images/lessons"; // đổi nếu để ảnh nơi khác
const VIDEO_DIR = "/videos"; // đổi nếu để video nơi khác

/** (B,C) Lấy poster cho video/lesson theo slug ảnh */
export function getPosterUrl(slug) {
  return `${POSTER_DIR}/${slug}.jpg`;
}
/** (C) Nguồn video .mp4 cho player */
export function getVideoUrl(slug) {
  return `${VIDEO_DIR}/${slug}.mp4`;
}

// ----------------------------- Category meta (A) ----------------------------
export const CATEGORY_META = {
  muscle: { key: "muscle", label: "Tăng cơ" },
  fatloss: { key: "fatloss", label: "Giảm cân" },
  cardio: { key: "cardio", label: "Cardio" },
  yoga: { key: "yoga", label: "Yoga" },
};

function normalizeCategory(c) {
  const k = String(c || "").toLowerCase();
  if (k.includes("yoga")) return "yoga";
  if (k.includes("cardio")) return "cardio";
  if (["fatloss", "fat", "loss", "giảm"].some((t) => k.includes(t)))
    return "fatloss";
  return "muscle";
}

// ----------------------------- DATASET: VIDEOS (C) --------------------------
/**
 * (C) Danh sách video — phần tử playlist của 1 Lesson ở Route B sẽ tham chiếu tới các id ở đây.
 * Mỗi video:
 *  - id, slug, title, duration (phút), level, kcal, category, tags[]
 *  - posterSlug? (ảnh khác slug), premiumOnly?
 */
export const VIDEOS = [
  {
    id: "2",
    slug: "Superman",
    title: "Superman",
    duration: 18,
    level: "Beginner",
    kcal: 120,
    category: "fatloss",
    tags: ["HIIT", "Full body"],
    posterSlug: "Superman",
  },
  {
    id: "1",
    slug: "chongday",
    title: "Push Up",
    duration: 22,
    level: "Beginner",
    kcal: 160,
    category: "muscle",
    tags: ["Strength"],
    posterSlug: "chongday",
  },
  {
    id: "3",
    slug: "squat",
    title: "Squat",
    duration: 25,
    level: "Intermediate",
    kcal: 200,
    category: "cardio",
    tags: ["Core", "Abs"],
    posterSlug: "squat",
  },
  {
    id: "4",
    slug: "kechan",
    title: "Alternating Straight Leg Lowering",
    duration: 20,
    level: "Beginner",
    kcal: 90,
    category: "yoga",
    tags: ["Mobility"],
    posterSlug: "kechan",
  },
  {
    id: "5",
    slug: "lunge",
    title: "Reverse Lunge",
    duration: 16,
    level: "Beginner",
    kcal: 70,
    category: "yoga",
    tags: ["Mobility"],
    posterSlug: "lunge",
  },
];

VIDEOS.forEach((v) => {
  v.category = normalizeCategory(v.category);
  v.thumb = getPosterUrl(v.posterSlug || v.slug);
});

// --------------------------- DATASET: LESSONS (A,B) -------------------------
/**
 * (A) hiển thị theo category → danh sách LESSONS thuộc loại đó
 * (B) chi tiết 1 LESSON/Series → hero + intro + playlist (và có thể theo tuần)
 *
 * Mỗi LESSON:
 *  - id, slug, title, intro, category, level
 *  - coverSlug? (ảnh hero riêng)
 *  - playlist: [videoId, ...]  (bắt buộc)
 *  - weeks?: [{ title, items:[videoId,...] }]
 */
export const LESSONS = [
  {
    id: "fatloss-starter",
    slug: "fatloss-starter",
    title: "Fat Loss — Starter",
    intro: "Chuỗi HIIT đốt mỡ nhanh, phù hợp người mới bắt đầu.",
    category: "fatloss",
    level: "Beginner",
    coverSlug: "fatloss-starter", // đổi sang ảnh bạn có
    playlist: ["full-body-burn", "core-crusher", "mobility-reset"],
    weeks: [
      { title: "Week 1", items: ["full-body-burn"] },
      { title: "Week 2", items: ["core-crusher"] },
      { title: "Week 3", items: ["mobility-reset"] },
    ],
  },
  {
    id: "muscle-gain-basic",
    slug: "muscle-gain-basic",
    title: "Muscle Gain — Basic",
    intro: "Nền tảng sức mạnh, tăng cơ an toàn.",
    category: "muscle",
    level: "Beginner",
    coverSlug: "muscle-gain-basic",
    playlist: ["1", "2", "3", "4", "5"],
  },
  {
    id: "yoga-ease",
    slug: "yoga-ease",
    title: "Yoga — Ease & Flow",
    intro: "Thả lỏng, tăng độ linh hoạt với flow nhẹ nhàng.",
    category: "yoga",
    level: "Beginner",
    coverSlug: "yoga-ease",
    playlist: ["yoga-flow", "mobility-reset"],
  },
];

LESSONS.forEach((s) => {
  s.category = normalizeCategory(s.category);
  s.cover = getPosterUrl(
    s.coverSlug || (s.playlist && s.playlist[0]) || s.slug
  );
});

// Liên kết ngược: video → seriesIds
const _videoIndex = Object.fromEntries(VIDEOS.map((v) => [v.id, v]));
LESSONS.forEach((s) => {
  (s.playlist || []).forEach((vid) => {
    const v = _videoIndex[vid];
    if (v) {
      v.seriesIds = v.seriesIds || [];
      if (!v.seriesIds.includes(s.id)) v.seriesIds.push(s.id);
    }
  });
});

// ----------------------------- LOOKUP HELPERS (A,B,C) -----------------------
/** (B,C) Lấy video theo id hoặc slug */
export function getVideoById(idOrSlug) {
  const key = String(idOrSlug || "").toLowerCase();
  return (
    VIDEOS.find(
      (v) =>
        String(v.id).toLowerCase() === key ||
        String(v.slug).toLowerCase() === key
    ) || null
  );
}

/** (A,B) Lấy lesson theo id hoặc slug */
export function getLessonById(idOrSlug) {
  const key = String(idOrSlug || "").toLowerCase();
  return (
    LESSONS.find(
      (s) =>
        String(s.id).toLowerCase() === key ||
        String(s.slug).toLowerCase() === key
    ) || null
  );
}

/** (B) Playlist của 1 lesson → mảng object video */
export function getPlaylist(lessonId) {
  const s = getLessonById(lessonId);
  if (!s) return [];
  return (s.playlist || []).map((id) => getVideoById(id)).filter(Boolean);
}

/** (B) Weeks dạng [{title, items:[videoObj,...]}] nếu lesson có cấu trúc tuần */
export function getWeeks(lessonId) {
  const s = getLessonById(lessonId);
  if (!s || !Array.isArray(s.weeks)) return [];
  return s.weeks.map((w) => ({
    title: w.title,
    items: (w.items || []).map((id) => getVideoById(id)).filter(Boolean),
  }));
}

/** (C) Prev/Next trong lesson. Nếu lessonId null → tìm lesson đầu chứa videoId */
export function getPrevNext(videoId, lessonId = null) {
  let lesson = lessonId ? getLessonById(lessonId) : null;
  if (!lesson) {
    lesson = LESSONS.find((s) => (s.playlist || []).includes(videoId)) || null;
  }
  if (!lesson) return { prev: null, next: null, lesson: null };

  const arr = lesson.playlist || [];
  const idx = arr.indexOf(videoId);
  const prev = idx > 0 ? getVideoById(arr[idx - 1]) : null;
  const next =
    idx >= 0 && idx < arr.length - 1 ? getVideoById(arr[idx + 1]) : null;
  return { prev, next, lesson };
}

// --------------------------- SECTION HELPERS (A) ----------------------------
/** (A) Gom LESSONS theo category cho trang index */
export function sectionizeLessons(list = LESSONS) {
  const res = { muscle: [], fatloss: [], cardio: [], yoga: [] };
  (list || []).forEach((s) => res[normalizeCategory(s.category)].push(s));
  return res;
}

/** (C – back-compat) Gom VIDEOS theo category nếu cần */
export function sectionizeVideos(list = VIDEOS) {
  const res = { muscle: [], fatloss: [], cardio: [], yoga: [] };
  (list || []).forEach((v) => res[normalizeCategory(v.category)].push(v));
  return res;
}

// ------------------------------- PROGRESS (C,B,A) ---------------------------
// Lưu theo từng user. Có thể đồng bộ với server nếu truyền apiClient.

// store/driver
let PROGRESS_API = null; // apiClient (optional) – đối tượng có get/post/put
let CURRENT_USER_ID = null; // user.id hiện tại (string | number)
let REMOTE_SYNCING = false; // cờ sync tránh đua

const BASE_KEY = "lesson:progress:v2";

function storageKey() {
  return `${BASE_KEY}:${CURRENT_USER_ID || "anon"}`;
}

function readMap() {
  try {
    return JSON.parse(localStorage.getItem(storageKey()) || "{}");
  } catch {
    return {};
  }
}
function writeMap(m) {
  localStorage.setItem(storageKey(), JSON.stringify(m || {}));
}

// --------- Public: bind progress to user (gọi 1 lần sau khi có user) --------
/**
 * Gắn user hiện tại cho hệ thống lưu tiến độ.
 * - userId: string|number
 * - apiClient: đối tượng có các method:
 *    GET   /me/lesson-progress       => { items: { [videoId]: Progress } }
 *    PUT   /me/lesson-progress/:id   body: Progress => { ok: true }
 */
export async function bindProgressToUser({ userId, apiClient } = {}) {
  CURRENT_USER_ID = userId || null;
  PROGRESS_API = apiClient || null;

  // nếu có API thì kéo tiến độ về & merge với local theo updatedAt
  if (!PROGRESS_API || !userId) return;

  try {
    const res = await PROGRESS_API.get?.("/me/lesson-progress");
    const serverMap = res?.items || res?.data?.items || {} || {};
    const localMap = readMap();

    // merge theo updatedAt mới hơn
    const merged = { ...localMap };
    Object.keys(serverMap).forEach((id) => {
      const s = serverMap[id];
      const l = localMap[id];
      if (!l || (s?.updatedAt || 0) > (l?.updatedAt || 0)) merged[id] = s;
    });
    writeMap(merged);
  } catch (e) {
    // im lặng: ko ảnh hưởng offline
    console.warn("sync progress (pull) failed", e?.message || e);
  }
}

// ---------------------- Helpers push 1 record lên server --------------------
async function pushOneToServer(id, record) {
  if (!PROGRESS_API || !CURRENT_USER_ID) return;
  try {
    await PROGRESS_API.put?.(`/me/lesson-progress/${encodeURIComponent(id)}`, {
      ...record,
      id,
    });
  } catch (e) {
    // để lần sau ghi tiếp, không throw
    console.warn("sync progress (push) failed", e?.message || e);
  }
}

/** Trả về { time, duration, completed, updatedAt } hoặc null */
export function getProgress(id) {
  const m = readMap();
  return m[id] || null;
}

export function saveTime(id, timeSec = 0, durationSec = 0) {
  const m = readMap();
  const prev = m[id] || {};
  const updated = {
    ...prev,
    time: Math.max(0, Math.floor(timeSec || 0)),
    duration: Math.max(prev.duration || 0, Math.floor(durationSec || 0)),
    completed:
      prev.completed ||
      (durationSec > 0 && timeSec / durationSec >= 0.95) ||
      false,
    updatedAt: Date.now(),
  };
  m[id] = updated;
  writeMap(m);

  // đẩy server (nếu có)
  pushOneToServer(id, updated);
  return updated;
}

export function markCompleted(id, durationSec = 0) {
  const m = readMap();
  const prev = m[id] || {};
  const updated = {
    ...prev,
    completed: true,
    time: Math.max(prev.time || 0, durationSec || prev.duration || 0),
    duration: Math.max(prev.duration || 0, durationSec || 0),
    updatedAt: Date.now(),
  };
  m[id] = updated;
  writeMap(m);

  // đẩy server (nếu có)
  pushOneToServer(id, updated);
  return updated;
}

// ---------------- last watched (theo user) ----------------------------------
const LAST_KEY_BASE = "lesson:last:v2";
function lastKey() {
  return `${LAST_KEY_BASE}:${CURRENT_USER_ID || "anon"}`;
}
export function setLastWatched(id) {
  try {
    localStorage.setItem(lastKey(), String(id));
  } catch {}
}
export function getLastWatched() {
  try {
    return localStorage.getItem(lastKey()) || null;
  } catch {
    return null;
  }
}

/** Stats tổng theo 1 danh sách video (mặc định toàn bộ VIDEOS) */
export function getStats(list = VIDEOS) {
  const progress = readMap();
  const total = list.length;
  const completed = list.filter((l) => progress[l.id]?.completed).length;

  const minutesWatched = list.reduce((sum, l) => {
    const p = progress[l.id];
    const durMin = Number(l.duration || 0);
    if (!p) return sum;
    const watchedMin = Math.min((p.time || 0) / 60, durMin);
    return sum + watchedMin;
  }, 0);

  const lastId = getLastWatched();
  const lastTitle =
    list.find((l) => String(l.id) === String(lastId))?.title || null;

  return {
    total,
    completed,
    minutesWatched: Math.round(minutesWatched),
    lastTitle,
    progressMap: progress,
  };
}

/** Tiến độ tổng hợp của 1 LESSON (playlist) */
export function getLessonProgress(lessonId) {
  const playlist = getPlaylist(lessonId);
  const map = readMap();

  const total = playlist.length;
  const completed = playlist.filter((v) => map[v.id]?.completed).length;

  const minutesWatched = playlist.reduce((sum, v) => {
    const p = map[v.id];
    const durMin = Number(v.duration || 0);
    if (!p) return sum;
    const watchedMin = Math.min((p.time || 0) / 60, durMin);
    return sum + watchedMin;
  }, 0);

  const percent = total ? Math.round((completed / total) * 100) : 0;
  return {
    total,
    completed,
    percent,
    minutesWatched: Math.round(minutesWatched),
  };
}
