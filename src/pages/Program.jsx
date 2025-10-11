import { Link } from "react-router-dom";
import { PLANS, getCoverSources } from "../lib/plans";

export default function ProgramPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-extrabold mb-6">Chọn Lộ Trình Tập Luyện</h1>
      <p className="text-gray-300 mb-10 max-w-[60ch]">
        Lộ trình 4 tuần giúp bạn tập trung theo mục tiêu: giảm mỡ, tăng sức mạnh
        hoặc cải thiện sự dẻo dai với Yoga. Mỗi plan có lịch tập gợi ý và video
        hướng dẫn chi tiết.
      </p>

      {/* Grid hiển thị các plan */}
      <div className="grid grid-cols-12 gap-6">
        {Object.values(PLANS).map((p) => {
          const cover = getCoverSources(p);
          return (
            <Link
              key={p.key}
              to={`/program/${p.key}`} // link tới ProgramPlanPage
              className="col-span-12 sm:col-span-6 lg:col-span-4 rounded-2xl overflow-hidden border border-[#1c2227] bg-[#15191d] hover:translate-y-[-2px] transition"
            >
              {/* Cover ảnh */}
              <div className="relative aspect-[16/9]">
                <picture>
                  <source srcSet={cover.avif} type="image/avif" />
                  <source srcSet={cover.webp} type="image/webp" />
                  <img
                    src={cover.jpg}
                    alt={`${p.name} cover`}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-lg font-semibold">
                  {p.name}
                </div>
              </div>

              {/* Tóm tắt */}
              <div className="p-4 text-sm text-gray-300">{p.summary}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
