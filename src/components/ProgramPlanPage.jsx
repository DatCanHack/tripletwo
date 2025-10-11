import { DAYS, getPlan, getCoverSources, isRestDay } from "../lib/plans";

export default function ProgramPlanPage({ planKey }) {
  const plan = getPlan(planKey);
  const cover = getCoverSources(plan);

  return (
    <div className="container py-10">
      {/* Header + cover */}
      <div className="grid lg:grid-cols-2 gap-6 items-center">
        <div>
          <h1 className="text-3xl font-extrabold">{plan.name}</h1>
          <p className="mt-2 text-gray-300">{plan.summary}</p>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="px-3 py-1 rounded-lg border border-white/10 bg-white/5">
              Buổi/tuần: <b>{plan.stats.sessionsPerWeek}</b>
            </span>
            <span className="px-3 py-1 rounded-lg border border-white/10 bg-white/5">
              Thời lượng: <b>{plan.stats.duration}</b>
            </span>
            <span className="px-3 py-1 rounded-lg border border-white/10 bg-white/5">
              Mục tiêu: <b>{plan.stats.goal}</b>
            </span>
          </div>

          <ul className="mt-4 list-disc pl-6 text-sm text-gray-300 space-y-1">
            {plan.guide.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0f1317]">
          <picture>
            <source srcSet={cover.avif} type="image/avif" />
            <source srcSet={cover.webp} type="image/webp" />
            <img
              src={cover.jpg}
              alt={plan.name}
              className="w-full h-full object-cover"
            />
          </picture>
        </div>
      </div>

      {/* Weekly table */}
      <div className="mt-10 space-y-6">
        {plan.weeks.map((w) => (
          <WeekCard key={w.week} week={w} accent={plan.color} />
        ))}
      </div>
    </div>
  );
}

function WeekCard({ week, accent }) {
  return (
    <div className="rounded-2xl border border-[#1c2227] bg-[#0f1317] overflow-hidden">
      <div
        className="px-4 py-2 text-sm font-semibold"
        style={{ background: `${accent}22`, color: "#fff" }}
      >
        Tuần {week.week}
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-3 text-sm">
          {DAYS.map((d, i) => {
            const title = week.days[i] ?? "Rest";
            const rest = isRestDay(title);
            return (
              <div
                key={d}
                className={[
                  "rounded-xl p-3 border",
                  rest
                    ? "border-white/10 bg-white/5 text-gray-400"
                    : "border-white/10 bg-white/5 hover:bg-white/10",
                ].join(" ")}
              >
                <div className="text-xs text-gray-400">{d}</div>
                <div className="mt-1 font-medium">{title}</div>
                {rest && (
                  <div className="mt-2 text-[11px] opacity-80">Hồi phục</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
