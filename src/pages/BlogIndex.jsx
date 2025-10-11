// src/pages/BlogIndex.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BLOGS, TAGS } from "../lib/blogs";

export default function BlogIndex() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("All");

  const items = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return BLOGS.filter((b) => {
      const okTag = tag === "All" || b.tag === tag;
      const okKw =
        !kw ||
        b.title.toLowerCase().includes(kw) ||
        b.intro.toLowerCase().includes(kw) ||
        b.tag.toLowerCase().includes(kw);
      return okTag && okKw;
    });
  }, [q, tag]);

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Blog</h1>
          <p className="text-gray-400 mt-1">
            Kiến thức tập luyện & dinh dưỡng hữu ích.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="rounded-xl bg-[#0f1317] border border-[#1c2227] px-3 py-2"
          >
            {TAGS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm bài viết…"
            className="rounded-xl bg-[#0f1317] border border-[#1c2227] px-3 py-2 min-w-[240px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mt-6">
        {items.map((b) => (
          <Link
            key={b.slug}
            to={`/blog/${b.slug}`}
            className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-2xl overflow-hidden border border-[#1c2227] bg-[#15191d] hover:-translate-y-0.5 transition"
          >
            <div className="relative aspect-[16/10] bg-[#0f1214]">
              <img
                src={b.cover}
                alt={b.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div className="absolute left-3 top-3 text-xs px-2 py-1 rounded-lg bg-black/60 border border-white/10">
                {b.tag} • {b.mins} phút
              </div>
            </div>
            <div className="p-4">
              <div className="font-semibold">{b.title}</div>
              <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                {b.intro}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
