import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

export default function Account() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", avatar: null });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (user)
      setForm({
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || null,
      });
  }, [user]);

  const onPickAvatar = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return setMsg("File phải là ảnh.");
    if (f.size > 2 * 1024 * 1024) return setMsg("Ảnh tối đa 2MB.");
    const dataUrl = await fileToDataUrl(f); // lưu base64 vào localStorage
    setForm((s) => ({ ...s, avatar: dataUrl }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setMsg("");
    if (!form.name.trim()) return setMsg("Tên không được trống.");
    if (!emailOk(form.email)) return setMsg("Email không hợp lệ.");
    updateProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      avatar: form.avatar || null,
    });
    setMsg("Đã lưu thay đổi ✔");
  };

  if (!user) {
    return (
      <div className="container py-16">
        <div>Vui lòng đăng nhập để chỉnh sửa hồ sơ.</div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-6">
        Account settings
      </h1>

      <form onSubmit={onSubmit} className="grid grid-cols-12 gap-6">
        {/* Avatar */}
        <div className="col-span-12 md:col-span-4">
          <div className="rounded-2xl border border-[#1c2227] bg-[#15191d] p-5 flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border border-[#1c2227] bg-black/20">
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full grid place-items-center text-4xl font-bold text-black"
                  style={{ backgroundColor: "#00B3A4" }}
                >
                  {(form.name || user.email || "?").slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <label className="px-4 py-2 rounded-xl border border-[#1c2227] hover:bg-white/5 cursor-pointer text-sm">
              Upload avatar
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickAvatar}
              />
            </label>
            {form.avatar && (
              <button
                type="button"
                onClick={() => setForm((s) => ({ ...s, avatar: null }))}
                className="text-xs text-gray-400 hover:text-white"
              >
                Remove avatar
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="col-span-12 md:col-span-8">
          <div className="rounded-2xl border border-[#1c2227] bg-[#15191d] p-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400">Name</label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, name: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl bg-[#0f1214] border border-[#1c2227] px-3 py-2 focus:outline-none focus:border-[#00B3A4]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Email</label>
                <input
                  value={form.email}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, email: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl bg-[#0f1214] border border-[#1c2227] px-3 py-2 focus:outline-none focus:border-[#00B3A4]"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {msg && <div className="mt-3 text-sm text-[#00B3A4]">{msg}</div>}

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-semibold text-black"
                style={{ backgroundColor: "#00B3A4" }}
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    name: user.name || "",
                    email: user.email || "",
                    avatar: user.avatar || null,
                  })
                }
                className="px-5 py-2.5 rounded-xl border border-[#1c2227] hover:bg-white/5"
              >
                Reset
              </button>
            </div>
          </div>

          {/* tip box */}
          <div className="mt-6 rounded-2xl border border-[#1c2227] bg-[#15191d] p-5 text-sm text-gray-300">
            <div className="font-semibold mb-2">Ghi chú</div>
            <ul className="list-disc pl-5 space-y-1">
              <li></li>
              <li>Nếu xoá cache/localStorage, hồ sơ & avatar sẽ mất.</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
