// src/pages/Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    agree: true,
  });
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  // UI errors
  const [errors, setErrors] = useState({}); // { name, email, password, confirm, agree }
  const [apiError, setApiError] = useState(""); // lỗi tổng từ BE
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { signup } = useAuth();

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));

    // Khi người dùng sửa field, xoá lỗi field đó + clear lỗi tổng
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (apiError) setApiError("");
  };

  // validate đơn giản phía client
  const validate = () => {
    const err = {};
    if (!form.name) err.name = "Vui lòng nhập tên";
    if (!form.email) err.email = "Vui lòng nhập email";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      err.email = "Email không hợp lệ";
    if (!form.password) err.password = "Vui lòng nhập mật khẩu";
    else if (form.password.length < 6)
      err.password = "Mật khẩu tối thiểu 6 ký tự";
    if (form.confirm !== form.password)
      err.confirm = "Mật khẩu nhập lại không khớp";
    if (!form.agree) err.agree = "Bạn cần đồng ý với điều khoản";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // Nhận lỗi từ apiClient / BE -> đổ vào UI
  const handleApiError = (e) => {
    // apiClient đã ném Error với { message, status, code, data }
    const data = e?.data || e;

    // reset hiển thị cũ
    setApiError("");
    // không xoá toàn bộ errors để giữ lại những field đã có từ validate client
    setErrors((prev) => ({ ...prev }));

    // Zod issues -> map xuống field
    if (data?.issues?.length) {
      const fe = {};
      for (const it of data.issues) {
        const field = Array.isArray(it.path) ? it.path[0] : it.path;
        if (field) fe[field] = it.message;
      }
      setErrors((prev) => ({ ...prev, ...fe }));
      setApiError(data?.message || "Dữ liệu không hợp lệ");
      return;
    }

    // Lỗi field đơn lẻ (BE trả { field, message })
    if (data?.field && data?.message) {
      setErrors((prev) => ({ ...prev, [data.field]: data.message }));
      setApiError(data.message);
      return;
    }

    // Email đã tồn tại
    if (data?.error === "EMAIL_EXISTS" || e?.status === 409) {
      const msg = data?.message || "Email đã được đăng ký.";
      setErrors((prev) => ({ ...prev, email: msg }));
      setApiError(msg);
      return;
    }

    // lỗi tổng quát
    setApiError(
      data?.message ||
        e?.message ||
        "Đăng ký thất bại. Vui lòng thử lại sau ít phút."
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      // Đăng ký OK -> sang trang đăng nhập (có thể autofill email từ state)
      navigate("/login", {
        replace: true,
        state: { email: form.email.trim() },
      });
    } catch (err) {
      handleApiError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Tạo tài khoản để lưu lộ trình tập luyện của bạn."
      altLink={{ text: "Đã có tài khoản?", cta: "Đăng nhập", to: "/login" }}
    >
      {/* Alert lỗi tổng */}
      {apiError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <div className="font-semibold mb-0.5">Không thể tạo tài khoản</div>
          <div>{apiError}</div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Họ và tên</label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            className={`w-full rounded-xl bg-[#0f1317] border px-4 py-3 outline-none
              ${
                errors.name
                  ? "border-red-500"
                  : "border-[#1c2227] focus:border-[#00B3A4]"
              }`}
            placeholder="Nguyen Van A"
            disabled={submitting}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            className={`w-full rounded-xl bg-[#0f1317] border px-4 py-3 outline-none
              ${
                errors.email
                  ? "border-red-500"
                  : "border-[#1c2227] focus:border-[#00B3A4]"
              }`}
            placeholder="you@example.com"
            disabled={submitting}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Mật khẩu</label>
          <div
            className={`flex items-center rounded-xl bg-[#0f1317] border 
              ${
                errors.password
                  ? "border-red-500"
                  : "border-[#1c2227] focus-within:border-[#00B3A4]"
              }`}
          >
            <input
              name="password"
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={onChange}
              autoComplete="new-password"
              className="w-full bg-transparent px-4 py-3 outline-none"
              placeholder="••••••••"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="px-3 text-xs text-gray-300 hover:text-white"
              disabled={submitting}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Nhập lại mật khẩu</label>
          <div
            className={`flex items-center rounded-xl bg-[#0f1317] border 
              ${
                errors.confirm
                  ? "border-red-500"
                  : "border-[#1c2227] focus-within:border-[#00B3A4]"
              }`}
          >
            <input
              name="confirm"
              type={showPw2 ? "text" : "password"}
              value={form.confirm}
              onChange={onChange}
              autoComplete="new-password"
              className="w-full bg-transparent px-4 py-3 outline-none"
              placeholder="••••••••"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowPw2((v) => !v)}
              className="px-3 text-xs text-gray-300 hover:text-white"
              disabled={submitting}
            >
              {showPw2 ? "Hide" : "Show"}
            </button>
          </div>
          {errors.confirm && (
            <p className="mt-1 text-xs text-red-400">{errors.confirm}</p>
          )}
        </div>

        <label className="flex items-start gap-3 text-sm text-gray-300">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={onChange}
            className="mt-1 accent-[#00B3A4]"
            disabled={submitting}
          />
          Tôi đồng ý với{" "}
          <Link to="#" className="text-[#00B3A4] hover:underline">
            Điều khoản & Chính sách
          </Link>
          .
        </label>
        {errors.agree && (
          <p className="mt-1 text-xs text-red-400">{errors.agree}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full rounded-xl font-semibold py-3 ${
            submitting
              ? "bg-[#00B3A4]/60 text-black cursor-not-allowed"
              : "bg-[#00B3A4] text-black"
          }`}
        >
          {submitting ? "Đang tạo tài khoản..." : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
