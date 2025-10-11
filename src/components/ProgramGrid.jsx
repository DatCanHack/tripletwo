// src/components/ProgramGrid.jsx
import { Link } from "react-router-dom";

export default function ProgramGrid({
  items = [],
  loading,
  error,
  title,
  plan,
}) {
  if (loading) {
    return (
      <div className="container py-10">
        <Header title={title} plan={plan} total={0} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <Header title={title} plan={plan} total={0} />
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Header title={title} plan={plan} total={items.length} />

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-[#1c2227] bg-[#0f1317] p-10 text-center">
          <div className="text-xl font-semibold">
            Chưa có chương trình phù hợp
          </div>
          <p className="mt-2 text-gray-400">
            Thử chuyển sang danh mục khác, hoặc nâng cấp gói nếu cần.
          </p>
          <Link
            to="/pricing"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-[#00B3A4] text-black font-semibold"
          >
            Xem gói
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {items.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-[#1c2227] overflow-hidden bg-[#0f1317] group"
            >
              {/* cover (nếu sau có) */}
              <div className="aspect-[16/9] w-full bg-gradient-to-br from-emerald-800/40 to-cyan-700/30" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold leading-snug">
                    {p.title || "Program"}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/5 border border-white/10 capitalize">
                    {p.category?.toLowerCase?.() ?? "program"}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Yêu cầu tối thiểu:{" "}
                  <span className="font-semibold uppercase text-[#00B3A4]">
                    {p.planMin}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Link
                    to={`/program/${(p.category || "").toLowerCase()}`}
                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-[#00B3A4] text-black hover:opacity-90"
                  >
                    Xem lộ trình
                  </Link>
                  <div className="text-xs text-gray-500">
                    #{String(p.id).slice(0, 6)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Header({ title, plan, total }) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="mt-1 text-sm text-gray-400">
            {typeof total === "number" ? `${total} chương trình` : ""}
          </div>
        </div>
        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10">
          Gói hiện tại:{" "}
          <span className="text-[#00B3A4] font-bold uppercase">{plan}</span>
        </span>
      </div>
    </>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-[#1c2227] overflow-hidden">
      <div className="aspect-[16/9] bg-white/5 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
        <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
      </div>
    </div>
  );
}
