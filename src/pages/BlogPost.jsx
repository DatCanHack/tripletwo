// src/pages/BlogPost.jsx
import { Link, Navigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getBlogBySlug, getRelated } from "../lib/blogs";

export default function BlogPost() {
  const { slug } = useParams();
  const post = getBlogBySlug(slug);
  const related = useMemo(() => getRelated(slug, 3), [slug]);

  // progress đọc bài
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    function onScroll() {
      const el = document.getElementById("article");
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const h = el.scrollHeight - window.innerHeight * 0.6;
      const scrolled = Math.min(
        1,
        Math.max(0, (window.scrollY - (el.offsetTop - 80)) / h)
      );
      setProgress(scrolled * 100);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [slug]);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <div className="w-full">
      {/* progress bar đọc */}
      <div className="sticky top-0 z-30 h-1 bg-transparent">
        <div className="h-1 bg-emerald-400" style={{ width: `${progress}%` }} />
      </div>

      {/* Hero */}
      <section className="relative h-[220px] md:h-[300px] overflow-hidden">
        <img
          src={post.cover}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
        <div className="absolute inset-0 container flex items-end pb-6">
          <div>
            <Link to="/blog" className="text-sm text-gray-300 hover:text-white">
              ← Quay lại Blog
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold mt-2 max-w-[28ch]">
              {post.title}
            </h1>
            <div className="mt-2 text-sm text-gray-300 flex items-center gap-3">
              <span className="px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 text-xs">
                {post.tag}
              </span>
              <span>{post.mins} phút đọc</span>
              <span>•</span>
              <span>{new Date(post.date).toLocaleDateString("vi-VN")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Nội dung */}
      <section id="article" className="container py-8 grid grid-cols-12 gap-8">
        <article className="col-span-12 lg:col-span-8">
          {/* Author */}
          <div className="flex items-center gap-3 text-sm text-gray-300 mb-6">
            <img
              src={post.author?.avatar}
              alt={post.author?.name}
              className="w-8 h-8 rounded-full object-cover border border-white/10"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <div>
              <div className="font-medium">{post.author?.name}</div>
              <div className="text-xs text-gray-400">
                Cập nhật {new Date(post.date).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>

          <p className="text-gray-300 text-lg leading-relaxed">{post.intro}</p>

          <div className="prose prose-invert prose-emerald max-w-none mt-6">
            {post.content.map((b, i) => {
              if (b.type === "h2") return <h2 key={i}>{b.text}</h2>;
              if (b.type === "quote")
                return (
                  <blockquote key={i} className="border-l-4 pl-4 italic">
                    {b.text}
                  </blockquote>
                );
              if (b.type === "ul")
                return (
                  <ul key={i}>
                    {b.items.map((li, k) => (
                      <li key={k}>{li}</li>
                    ))}
                  </ul>
                );
              return <p key={i}>{b.text}</p>;
            })}
          </div>
        </article>

        {/* Sidebar: bài liên quan */}
        <aside className="col-span-12 lg:col-span-4 space-y-4">
          <div className="text-sm uppercase tracking-wide text-gray-400">
            Bài liên quan
          </div>
          {related.map((r) => (
            <Link
              key={r.slug}
              to={`/blog/${r.slug}`}
              className="flex gap-3 rounded-xl overflow-hidden border border-[#1c2227] bg-[#15191d] hover:bg-white/5"
            >
              <div className="relative w-28 shrink-0 bg-[#0f1214]">
                <img
                  src={r.cover}
                  alt={r.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
              <div className="p-3">
                <div className="text-sm font-medium line-clamp-2">
                  {r.title}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {r.tag} • {r.mins} phút
                </div>
              </div>
            </Link>
          ))}
        </aside>
      </section>
    </div>
  );
}
