import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { api } from "../services/apiClient";
import {
  LESSONS,
  getLessonById,
  getPosterUrl,
  getVideoUrl,
  getPlaylist,
  getVideoById,
  getPrevNext,
  getProgress,
  saveTime,
  markCompleted,
  setLastWatched,
  bindProgressToUser,
} from "../lib/lesson";
import PoseCoach from "../components/PoseCoach"; // ⬅️ mới

const SAVE_INTERVAL = 1;

// ===== Helpers lưu localStorage cho reps & sessions =====
const LS_KEYS = {
  repsDone: (vid) => `repsDone:${vid}`,
  sessions: (vid) => `sessions:${vid}`,
  targetReps: (vid) => `targetReps:${vid}`,
};

function getNumber(key, fallback = 0) {
  try {
    const v = localStorage.getItem(key);
    if (v == null) return fallback;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}
function setNumber(key, val) {
  try {
    localStorage.setItem(key, String(val));
  } catch {}
}

// Heuristic: 1 video coi là hoàn tất khi p.completed === true
// hoặc đã xem >= 95% thời lượng.
function isVideoCompleted(p) {
  if (!p) return false;
  if (p.completed) return true;
  const dur = p.duration || 0;
  const time = p.time || 0;
  return dur > 0 && time >= 0.95 * dur;
}

export default function LessonWatch() {
  const { user, booted } = useAuth();
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // Đồng bộ progress theo user
  useEffect(() => {
    if (booted && user) bindProgressToUser({ userId: user.id, apiClient: api });
  }, [booted, user]);

  // Guard sau khi đã khai báo hooks
  const isLoading = !booted;
  const shouldRedirect = booted && !user;
  if (shouldRedirect) return <Navigate to="/login" replace />;
  if (isLoading) return null;

  const lesson = useMemo(() => getLessonById(id) || LESSONS[0] || null, [id]);
  if (!lesson) return <Navigate to="/lesson" replace />;

  // video hiện tại (?vid=) hoặc video đầu playlist
  const currentVideo = useMemo(() => {
    const vid = params.get("vid");
    return getVideoById(vid) || getPlaylist(lesson.id)[0] || null;
  }, [lesson.id, params]);

  if (!currentVideo) return <Navigate to={`/lesson/${lesson.id}`} replace />;

  // prev/next trong lesson
  const { prev, next } = getPrevNext(currentVideo.id, lesson.id);

  const videoRef = useRef(null);
  const lastSavedRef = useRef(0);
  const [resumeAt, setResumeAt] = useState(null);
  const [showResume, setShowResume] = useState(false);
  const [percent, setPercent] = useState(0);

  // ==== Reps / Sessions state ====
  const initialTarget =
    typeof currentVideo?.reps === "number" && currentVideo.reps > 0
      ? currentVideo.reps
      : getNumber(LS_KEYS.targetReps(currentVideo.id), 10) || 10;

  const [targetReps, setTargetReps] = useState(initialTarget);
  const [repsDone, setRepsDone] = useState(
    getNumber(LS_KEYS.repsDone(currentVideo.id), 0)
  );
  const [sessions, setSessions] = useState(
    getNumber(LS_KEYS.sessions(currentVideo.id), 0)
  );

  // Coach state
  const [showCoach, setShowCoach] = useState(false);

  // Popup chúc mừng video / lesson
  const [showCongrats, setShowCongrats] = useState(false);
  const [showBigCongrats, setShowBigCongrats] = useState(false);

  // Khi đổi video -> nạp lại reps/sessions/target
  useEffect(() => {
    const metaTarget =
      typeof currentVideo?.reps === "number" && currentVideo.reps > 0
        ? currentVideo.reps
        : undefined;
    const newTarget =
      typeof metaTarget === "number"
        ? metaTarget
        : getNumber(LS_KEYS.targetReps(currentVideo.id), 10) || 10;

    setTargetReps(newTarget);
    setRepsDone(getNumber(LS_KEYS.repsDone(currentVideo.id), 0));
    setSessions(getNumber(LS_KEYS.sessions(currentVideo.id), 0));
    setShowCongrats(false);
    // auto bật coach nếu là 3 bài test
    // setShowCoach(isCoachSupported());
  }, [currentVideo.id]);

  // resume + percent ban đầu
  useEffect(() => {
    const p = getProgress(currentVideo.id);
    if (p?.time && p?.duration && p.time < p.duration - 3 && p.time > 3) {
      setResumeAt(p.time);
      setShowResume(true);
    } else {
      setResumeAt(null);
      setShowResume(false);
    }
    setPercent(
      p?.duration > 0
        ? Math.min(100, Math.round((p.time / p.duration) * 100))
        : 0
    );
    setLastWatched(currentVideo.id);
  }, [currentVideo.id]);

  // lưu khi rời trang
  useEffect(() => {
    const handleBeforeUnload = () => {
      const v = videoRef.current;
      if (!v) return;
      saveTime(currentVideo.id, v.currentTime, v.duration || 0);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentVideo.id]);

  // ====== Progress video ======
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    const now = v.currentTime || 0;
    const dur = v.duration || 0;
    if (Math.abs(now - lastSavedRef.current) >= SAVE_INTERVAL) {
      const rec = saveTime(currentVideo.id, now, dur);
      lastSavedRef.current = now;
      if (rec?.duration > 0)
        setPercent(Math.min(100, Math.round((rec.time / rec.duration) * 100)));
    }
  };

  // Kiểm tra đã hoàn tất toàn bộ lesson chưa
  const isLessonCompleted = () => {
    const list = getPlaylist(lesson.id);
    if (!list || !list.length) return false;
    return list.every((v) => isVideoCompleted(getProgress(v.id)));
  };

  // Reset toàn bộ tiến trình của lesson (video progress + reps/sessions)
  const resetAllForLesson = () => {
    const list = getPlaylist(lesson.id);
    list.forEach((v) => {
      setNumber(LS_KEYS.repsDone(v.id), 0);
      setNumber(LS_KEYS.sessions(v.id), 0);
      try {
        saveTime(v.id, 0, 0);
      } catch {}
    });
    setRepsDone(0);
    setSessions(0);
    setPercent(0);
    setShowCongrats(false);
    setShowBigCongrats(false);
    const first = list[0];
    if (first) navigate(`/lesson/${lesson.id}/watch?vid=${first.id}`);
  };

  // ====== Hoàn thành + chuyển tiếp ======
  const completeAndAdvance = () => {
    const v = videoRef.current;
    markCompleted(currentVideo.id, v?.duration || 0);
    setPercent(100);
    const newSessions = sessions + 1;
    setSessions(newSessions);
    setNumber(LS_KEYS.sessions(currentVideo.id), newSessions);
    setRepsDone(0);
    setNumber(LS_KEYS.repsDone(currentVideo.id), 0);

    if (next) {
      setShowCongrats(true);
      setTimeout(() => {
        setShowCongrats(false);
        navigate(`/lesson/${lesson.id}/watch?vid=${next.id}`);
      }, 1500);
    } else {
      if (isLessonCompleted()) setShowBigCongrats(true);
      else setShowCongrats(true);
    }
  };

  const onEnded = () => {
    completeAndAdvance();
  };

  // ====== Reps handlers ======
  const incRep = (n = 1) => {
    const val = Math.max(0, repsDone + n);
    setRepsDone(val);
    setNumber(LS_KEYS.repsDone(currentVideo.id), val);
  };
  const decRep = (n = 1) => {
    const val = Math.max(0, repsDone - n);
    setRepsDone(val);
    setNumber(LS_KEYS.repsDone(currentVideo.id), val);
  };
  const onToggleEnoughReps = () => {
    if (repsDone < targetReps) {
      setRepsDone(targetReps);
      setNumber(LS_KEYS.repsDone(currentVideo.id), targetReps);
    }
    completeAndAdvance();
  };
  const onChangeTarget = (raw) => {
    const parsed = parseInt(raw, 10);
    const v = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
    setTargetReps(v);
    setNumber(LS_KEYS.targetReps(currentVideo.id), v);
    if (repsDone > v) {
      setRepsDone(v);
      setNumber(LS_KEYS.repsDone(currentVideo.id), v);
    }
  };

  // Nhận dạng bài hỗ trợ Coach từ slug/title (từ /lib/lesson.js)
  const detectExercise = () => {
    const text = `${currentVideo?.slug || ""} ${currentVideo?.title || ""}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
    if (/(push|chong.?day)/.test(text)) return "pushup";
    if (/superman/.test(text)) return "superman";
    if (/squat/.test(text)) return "squat";
    return null;
  };
  const isCoachSupported = () => !!detectExercise();

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${ss}`;
  };

  const playlist = getPlaylist(lesson.id);
  const repsPercent =
    targetReps > 0
      ? Math.min(100, Math.round((repsDone / targetReps) * 100))
      : 0;

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">
            {currentVideo.title}
          </h1>
          <div className="mt-1 text-xs text-gray-400 capitalize">
            {lesson.category} • {currentVideo.level} • {currentVideo.duration}m
            • {currentVideo.kcal} kcal
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs">
            Progress: <b>{percent}%</b>
          </span>

          {/* Bật/tắt Camera Coach */}
          <button
            onClick={() => setShowCoach((v) => !v)}
            disabled={!isCoachSupported()}
            className={`px-3 py-1.5 rounded-xl border text-xs ${
              isCoachSupported()
                ? "border-[#1c2227] hover:bg-white/5"
                : "border-transparent text-gray-500 cursor-not-allowed"
            }`}
            title={
              isCoachSupported()
                ? "Bật/tắt Camera Coach"
                : "Bài này chưa hỗ trợ Camera Coach"
            }
          >
            {showCoach ? "Tắt FormCheck Camera" : "Bật FormCheck Camera"}
          </button>

          {/* Nút Reset toàn bộ quá trình */}
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Reset toàn bộ quá trình của lesson (reps/sessions/progress)?"
                )
              ) {
                resetAllForLesson();
              }
            }}
            className="px-3 py-1.5 rounded-xl border border-[#1c2227] hover:bg-white/5 text-xs"
            title="Reset reps/sessions & progress của toàn bộ video trong lesson"
          >
            Reset toàn bộ
          </button>

          {prev ? (
            <Link
              to={`/lesson/${lesson.id}/watch?vid=${prev.id}`}
              className="px-3 py-1.5 rounded-xl border border-[#1c2227] hover:bg-white/5"
            >
              ← Prev
            </Link>
          ) : (
            <span className="px-3 py-1.5 rounded-xl border border-transparent text-gray-500">
              ← Prev
            </span>
          )}
          {next ? (
            <Link
              to={`/lesson/${lesson.id}/watch?vid=${next.id}`}
              className="px-3 py-1.5 rounded-xl border border-[#1c2227] hover:bg-white/5"
            >
              Next →
            </Link>
          ) : (
            <span className="px-3 py-1.5 rounded-xl border border-transparent text-gray-500">
              Next →
            </span>
          )}
        </div>
      </div>

      {/* Player + playlist */}
      <div className="mt-4 grid grid-cols-12 gap-6">
        {/* Player */}
        <div className="col-span-12 xl:col-span-8 rounded-2xl overflow-hidden border border-[#1c2227] bg-black relative">
          <div className="relative aspect-video">
            <video
              ref={videoRef}
              controls
              playsInline
              poster={currentVideo.thumb || getPosterUrl(currentVideo.slug)}
              onTimeUpdate={onTimeUpdate}
              onEnded={onEnded}
              className="absolute inset-0 w-full h-full"
              src={getVideoUrl(currentVideo.slug)}
            />

            {showResume && (
              <div className="absolute left-4 bottom-4 flex items-center gap-2 bg-black/70 border border-white/10 rounded-xl px-3 py-2 backdrop-blur">
                <span className="text-sm">
                  Resume at <b>{fmt(resumeAt)}</b>?
                </span>
                <button
                  onClick={() => {
                    const v = videoRef.current;
                    if (!v || resumeAt == null) return;
                    v.currentTime = resumeAt;
                    setShowResume(false);
                    v.play().catch(() => {});
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#00B3A4] text-black text-sm font-semibold"
                >
                  Resume
                </button>
                <button
                  onClick={() => {
                    const v = videoRef.current;
                    if (!v) return;
                    v.currentTime = 0;
                    setShowResume(false);
                    v.play().catch(() => {});
                  }}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-sm hover:bg-white/10"
                >
                  Start over
                </button>
              </div>
            )}

            {/* % video */}
            <div className="absolute right-3 top-3 text-xs px-2 py-1 rounded-lg bg-black/60 border border-white/10">
              {percent}%
            </div>

            {/* Popup chúc mừng video */}
            {showCongrats && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                <div className="rounded-2xl border border-white/10 bg-[#0f1214] px-6 py-5 text-center">
                  <div className="text-2xl font-extrabold mb-1">
                    🎉 Chúc mừng!
                  </div>
                  <div className="text-sm text-gray-300">
                    Bạn đã hoàn thành bài tập này
                    {repsDone >= targetReps ? " và đủ số rep" : ""}.
                  </div>
                  {next ? (
                    <Link
                      to={`/lesson/${lesson.id}/watch?vid=${next.id}`}
                      className="inline-block mt-3 px-4 py-2 rounded-xl bg-[#00B3A4] text-black font-semibold"
                      onClick={() => setShowCongrats(false)}
                    >
                      Qua video kế tiếp →
                    </Link>
                  ) : (
                    <button
                      className="inline-block mt-3 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10"
                      onClick={() => setShowCongrats(false)}
                    >
                      Đóng
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Popup chúc mừng hoành tráng khi hoàn tất toàn bộ lesson */}
            {showBigCongrats && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1214] to-[#0b1412] px-8 py-8 text-center max-w-md">
                  <div className="text-3xl md:text-4xl font-extrabold">
                    🎊 Hoàn thành Lesson!
                  </div>
                  <p className="mt-2 text-sm text-gray-300">
                    Bạn đã hoàn thành tất cả video trong lesson này. Xuất sắc!
                  </p>
                  <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      onClick={() => setShowBigCongrats(false)}
                      className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10"
                    >
                      Ở lại trang
                    </button>
                    <button
                      onClick={resetAllForLesson}
                      className="px-4 py-2 rounded-xl bg-[#00B3A4] text-black font-semibold"
                    >
                      Reset toàn bộ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Camera Coach */}
          {showCoach && detectExercise() && (
            <div className="p-4 border-t border-[#1c2227]">
              <PoseCoach exercise={detectExercise()} onRep={() => incRep(1)} />
            </div>
          )}

          {/* Thanh điều khiển REP dưới player */}
          <div className="p-4 bg-[#0f1214] border-t border-[#1c2227]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Mục tiêu rep */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-300">Mục tiêu rep:</label>
                <input
                  type="number"
                  min={1}
                  value={targetReps}
                  onChange={(e) => onChangeTarget(e.target.value)}
                  className="w-20 rounded-lg bg-[#0b0e10] border border-white/10 px-2 py-1 text-sm"
                />
                <div className="text-xs text-gray-400">
                  (mặc định từ video hoặc 10)
                </div>
              </div>

              {/* Bộ đếm rep */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => decRep(1)}
                  className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5"
                >
                  −1
                </button>
                <button
                  onClick={() => incRep(1)}
                  className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5"
                >
                  +1
                </button>
                <button
                  onClick={() => incRep(5)}
                  className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 hidden sm:inline-block"
                >
                  +5
                </button>
                <div className="ml-2 text-sm">
                  Đã làm: <b>{repsDone}</b> / {targetReps} rep
                </div>
              </div>

              {/* Tiến độ reps + nút xác nhận */}
              <div className="flex items-center gap-3 min-w-[240px]">
                <div className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
                  <div
                    className="h-2 bg-[#00B3A4]"
                    style={{ width: `${repsPercent}%` }}
                  />
                </div>
                <button
                  onClick={onToggleEnoughReps}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${
                    repsDone >= targetReps
                      ? "bg-[#00B3A4] text-black"
                      : "border border-white/10 hover:bg-white/10"
                  }`}
                  title="Đánh dấu đã đủ rep và hoàn thành bài"
                >
                  {repsDone >= targetReps ? "Đã đủ rep ✓" : "Đánh dấu đủ rep"}
                </button>
              </div>
            </div>

            {/* Số lần đã tập bài này */}
            <div className="mt-3 text-xs text-gray-400">
              Bạn đã tập bài này <b>{sessions}</b> lần.
            </div>
          </div>
        </div>

        {/* Playlist của lesson */}
        <aside className="col-span-12 xl:col-span-4">
          <div className="rounded-2xl border border-[#1c2227] bg-[#0f1214] p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Playlist</div>
              <span className="text-xs text-gray-400">
                {playlist.length} videos
              </span>
            </div>
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {playlist.map((v) => {
                const p = getProgress(v.id);
                const pr =
                  p?.duration > 0
                    ? Math.min(100, Math.round((p.time / p.duration) * 100))
                    : 0;
                const active = v.id === currentVideo.id;

                // % reps hiển thị nhỏ ở thumbnail
                const reps = getNumber(LS_KEYS.repsDone(v.id), 0);
                const tg =
                  typeof v?.reps === "number" && v.reps > 0
                    ? v.reps
                    : getNumber(LS_KEYS.targetReps(v.id), 10) || 10;
                const rp =
                  tg > 0 ? Math.min(100, Math.round((reps / tg) * 100)) : 0;

                return (
                  <Link
                    key={v.id}
                    to={`/lesson/${lesson.id}/watch?vid=${v.id}`}
                    className={`w-full flex items-center gap-3 rounded-xl border px-2 py-2 ${
                      active
                        ? "border-[#00B3A4] bg-[#0b1412]"
                        : "border-[#1c2227] bg-[#15191d] hover:bg-[#151b1f]"
                    }`}
                  >
                    <div className="relative w-24 h-16 shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={v.thumb}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt={v.title}
                      />
                      <div className="absolute left-1 top-1 text-[10px] px-1.5 py-[2px] rounded bg-black/60 border border-white/10">
                        {v.duration}m
                      </div>
                      {!!pr && (
                        <div className="absolute right-1 top-1 text-[10px] px-1.5 py-[2px] rounded bg-black/60 border border-white/10">
                          {pr}%
                        </div>
                      )}
                      {!!rp && (
                        <div className="absolute right-1 bottom-1 text-[10px] px-1.5 py-[2px] rounded bg-black/60 border border-white/10">
                          rep {rp}%
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium line-clamp-2">
                        {v.title}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 capitalize">
                        {v.level} • {v.kcal} kcal
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded bg-white/10 overflow-hidden">
                        <div
                          className="h-1.5 bg-[#00B3A4]"
                          style={{ width: `${pr}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
