import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PLAN_META } from "../lib/subscription";

export default function FeatureLock({
  allowedPlans = ["pro", "elite"],
  children,
}) {
  const { currentPlan } = useAuth();
  const ok = allowedPlans.includes(currentPlan);
  if (ok) return children;
  return (
    <div className="rounded-xl border border-[#1c2227] p-4">
      <div className="font-semibold mb-1">Yêu cầu gói cao hơn</div>
      <div className="text-sm text-gray-400">
        Tính năng này cần gói {allowedPlans.join(" / ").toUpperCase()}.
      </div>
      <Link
        to="/pricing"
        className="inline-block mt-2 px-3 py-1.5 rounded-lg font-semibold bg-[#00B3A4] text-black"
      >
        Upgrade →
      </Link>
    </div>
  );
}
