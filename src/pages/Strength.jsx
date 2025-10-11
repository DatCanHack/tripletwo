import { useEffect, useState } from "react";
import ProgramPlanPage from "../components/ProgramPlanPage";
import { api } from "../services/apiClient";

export default function Strength() {
  return (
    <>
      <ProgramPlanPage planKey="strength" />
      <ProgramsSection category="strength" />
    </>
  );
}

function ProgramsSection({ category }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .programs({ category })
      .then((r) => setItems(r?.items || []))
      .catch((e) => setErr(e?.message || "Không tải được chương trình"))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="container pb-14">
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Chương trình theo chủ đề:{" "}
          <span className="capitalize">{category}</span>
        </h2>
      </div>

      {loading ? (
        <GridSkeleton />
      ) : err ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {err}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6 text-gray-300">
          Chưa có chương trình phù hợp.
        </div>
      ) : (
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <ProgramCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProgramCard({ p }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f1317] overflow-hidden">
      <div className="aspect-[16/9] bg-gradient-to-br from-amber-600/30 to-yellow-500/20" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug">{p.title}</h3>
          <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10">
            Yêu cầu: {p.planMin}
          </span>
        </div>
        <div className="mt-2 text-sm text-gray-400 capitalize">
          Chủ đề: {p.category}
        </div>
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 overflow-hidden"
        >
          <div className="aspect-[16/9] bg-white/5 animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-5 w-3/4 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
