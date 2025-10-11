// src/pages/admin/Users.jsx
import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";

const PLAN_OPTS = ["FREE", "BASIC", "PRO", "ELITE"];
const BILLING_OPTS = ["MONTHLY", "YEARLY"];

export default function AdminUsers() {
  const { user } = useAuth(); // để ẩn trang nếu không phải ADMIN (phòng hờ)
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const pages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  const load = async (opts = {}) => {
    setLoading(true);
    setErr("");
    try {
      const data = await adminApi.listUsers({
        q: opts.q ?? q,
        page: opts.page ?? page,
        limit,
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
      if (typeof opts.page === "number") setPage(opts.page);
    } catch (e) {
      setErr(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actions
  const updateRole = async (id, role) => {
    await adminApi.setRole(id, role);
    await load();
  };
  const updatePlan = async (id, plan, billing) => {
    await adminApi.setSubscription(id, { plan, billing });
    await load();
  };
  const updateActive = async (id, active) => {
    await adminApi.setActive(id, active);
    await load();
  };
  const removeUser = async (id) => {
    if (!confirm("Xoá user này?")) return;
    await adminApi.deleteUser(id);
    await load();
  };

  if (user?.role !== "ADMIN") {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-red-300 mt-2">Bạn không có quyền truy cập.</p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Users</h1>

      <div className="flex gap-3 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name/email…"
          className="w-[320px] rounded-xl bg-[#0b0e11] border border-[#1c2227] px-3 py-2 outline-none"
        />
        <button
          onClick={() => load({ q, page: 1 })}
          className="px-4 py-2 rounded-xl bg-[#00B3A4] text-black font-semibold"
        >
          Search
        </button>
      </div>

      {err && (
        <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {err}
        </div>
      )}

      <div className="rounded-2xl border border-[#1c2227] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Plan</th>
              <th className="text-left p-3">Billing</th>
              <th className="text-left p-3">Active</th>
              <th className="text-left p-3">Created</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4 text-gray-400" colSpan={8}>
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="p-4 text-gray-400" colSpan={8}>
                  No users
                </td>
              </tr>
            ) : (
              items.map((u) => (
                <tr key={u.id} className="border-t border-[#1c2227]">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.name || "-"}</td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      className="bg-[#0b0e11] border border-[#1c2227] rounded-lg px-2 py-1"
                    >
                      <option>USER</option>
                      <option>ADMIN</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      value={u.subscriptionPlan || "FREE"}
                      onChange={(e) =>
                        updatePlan(
                          u.id,
                          e.target.value,
                          u.subscriptionBilling || null
                        )
                      }
                      className="bg-[#0b0e11] border border-[#1c2227] rounded-lg px-2 py-1"
                    >
                      {PLAN_OPTS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      value={u.subscriptionBilling || ""}
                      onChange={(e) =>
                        updatePlan(
                          u.id,
                          u.subscriptionPlan || "FREE",
                          e.target.value || null
                        )
                      }
                      className="bg-[#0b0e11] border border-[#1c2227] rounded-lg px-2 py-1"
                    >
                      <option value="">—</option>
                      {BILLING_OPTS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!u.active}
                        onChange={(e) => updateActive(u.id, e.target.checked)}
                        className="accent-[#00B3A4]"
                      />
                      <span>{u.active ? "Yes" : "No"}</span>
                    </label>
                  </td>
                  <td className="p-3">
                    {new Date(u.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => removeUser(u.id)}
                      className="px-2 py-1 rounded-lg text-red-300 hover:bg-white/5"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          disabled={page <= 1}
          onClick={() => load({ page: Math.max(1, page - 1) })}
          className="px-3 py-1.5 rounded-lg border border-[#1c2227] disabled:opacity-50"
        >
          Prev
        </button>
        <div>
          Page <b>{page}</b> / {pages}
        </div>
        <button
          disabled={page >= pages}
          onClick={() => load({ page: Math.min(pages, page + 1) })}
          className="px-3 py-1.5 rounded-lg border border-[#1c2227] disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
