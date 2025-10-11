import { useEffect, useMemo } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/apiClient";
import {
  LESSONS,
  getLessonById,
  getPosterUrl,
  CATEGORY_META,
  sectionizeLessons,
  getPlaylist,
  getWeeks,
  getLessonProgress,
  bindProgressToUser,
} from "../lib/lesson";

export default function LessonDetail() {
  const { user, booted } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  // Gắn progress với user (đồng bộ server nếu có)
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

  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  const prev = LESSONS[idx - 1] || null;
  const next = LESSONS[idx + 1] || null;

  const sections = useMemo(() => sectionizeLessons(LESSONS), []);
  const group = (sections[lesson.category] || []).filter(
    (s) => s.id !== lesson.id
  );

  const playlist = getPlaylist(lesson.id);
  const weeks = getWeeks(lesson.id);
  const prog = getLessonProgress(lesson.id);

  const firstVid = playlist[0] || null;

  return (
    <div className="w-full">
      {/* HERO */}
      <section className="relative border-b border-[#12171b]">
        <div className="relative container py-6">
          <div className="relative w-full rounded-2xl overflow-hidden border border-white/10">
            <img
              src={lesson.cover || getPosterUrl(lesson.slug)}
              className="w-full h-[38vh] md:h-[52vh] object-cover"
              alt={lesson.title}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent" />
            <div className="absolute left-6 top-6 text-xs px-2 py-1 rounded bg-black/60 border border-white/10 capitalize">
              {CATEGORY_META[lesson.category]?.label || lesson.category}
            </div>
            <div className="absolute left-6 bottom-6 max-w-xl">
              <h1 className="text-2xl md:text-3xl font-extrabold">
                {lesson.title}
              </h1>
              <p className="mt-2 text-gray-300">
                {lesson.intro || "Bài tập chi tiết."}
              </p>
              <div className="mt-3 text-xs text-gray-400">
                {playlist.length} video • {prog.percent}% hoàn thành
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {firstVid && (
                  <button
                    onClick={() =>
                      navigate(`/lesson/${lesson.id}/watch?vid=${firstVid.id}`)
                    }
                    className="px-4 py-2 rounded-xl bg-[#00B3A4] text-black font-semibold"
                  >
                    Bắt đầu học
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLAYLIST / WEEKS */}
      <section className="container mt-8">
        {weeks.length ? (
          weeks.map((w) => (
            <div key={w.title} className="mt-6 first:mt-0">
              <div className="mb-2 font-semibold">{w.title}</div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {w.items.map((v) => (
                  <Link
                    key={v.id}
                    to={`/lesson/${lesson.id}/watch?vid=${v.id}`}
                    className="rounded-xl border border-[#1c2227] bg-[#0f1317] overflow-hidden hover:translate-y-[-2px] transition"
                  >
                    <div className="relative aspect-[16/9]">
                      <img
                        src={v.thumb}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt={v.title}
                      />
                      <div className="absolute left-2 top-2 text-[11px] px-2 py-1 rounded bg-black/60 border border-white/10">
                        {v.duration}m
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="font-medium line-clamp-2">{v.title}</div>
                      <div className="text-[11px] text-gray-400 mt-1 capitalize">
                        {v.level} • {v.kcal} kcal
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="mb-2 font-semibold">Playlist</div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlist.map((v) => (
                <Link
                  key={v.id}
                  to={`/lesson/${lesson.id}/watch?vid=${v.id}`}
                  className="rounded-xl border border-[#1c2227] bg-[#0f1317] overflow-hidden hover:translate-y-[-2px] transition"
                >
                  <div className="relative aspect-[16/9]">
                    <img
                      src={v.thumb}
                      className="absolute inset-0 w-full h-full object-cover"
                      alt={v.title}
                    />
                    <div className="absolute left-2 top-2 text-[11px] px-2 py-1 rounded bg-black/60 border border-white/10">
                      {v.duration}m
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="font-medium line-clamp-2">{v.title}</div>
                    <div className="text-[11px] text-gray-400 mt-1 capitalize">
                      {v.level} • {v.kcal} kcal
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Gợi ý cùng chủ đề */}
      <section className="container mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Cùng chủ đề</h2>
          <div className="text-xs text-gray-400">{group.length} bài</div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
          {group.map((l) => (
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
              </div>
              <div className="p-3">
                <div className="font-medium line-clamp-2">{l.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Prev / Next */}
      <section className="container mt-8">
        <div className="flex items-center justify-between">
          <div></div>
          <div></div>
        </div>
      </section>
    </div>
  );
}
