// src/pages/Login.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google"; // ✅ dùng GoogleLogin (trả credential)

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const from = location.state?.from?.pathname || "/";

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const err = {};
    if (!form.email) err.email = "Vui lòng nhập email";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      err.email = "Email không hợp lệ";
    if (!form.password) err.password = "Vui lòng nhập mật khẩu";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setServerError("");
    setSubmitting(true);
    try {
      const user = await login({
        email: form.email,
        password: form.password,
        remember: form.remember,
      });
      if (!user) throw new Error("Email hoặc mật khẩu không đúng.");
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err?.message || "Email hoặc mật khẩu không đúng.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Login"
      subtitle="Chào mừng quay lại. Hãy tiếp tục hành trình luyện tập!"
      altLink={{
        text: "Chưa có tài khoản?",
        cta: "Tạo tài khoản",
        to: "/signup",
      }}
    >
      {serverError && (
        <div
          className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          role="alert"
          aria-live="polite"
        >
          {serverError}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            aria-invalid={!!errors.email}
            className={`w-full rounded-xl bg-[#0f1317] border px-4 py-3 outline-none ${
              errors.email
                ? "border-red-500"
                : "border-[#1c2227] focus:border-[#00B3A4]"
            }`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm mb-1">Mật khẩu</label>
          <div
            className={`flex items-center rounded-xl bg-[#0f1317] border ${
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
              autoComplete="current-password"
              className="w-full bg-transparent px-4 py-3 outline-none"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="px-3 text-xs text-gray-300 hover:text-white"
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password}</p>
          )}
        </div>

        {/* Remember + forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={onChange}
              className="accent-[#00B3A4]"
            />
            Remember me
          </label>
          <Link to="#" className="text-sm text-[#00B3A4] hover:underline">
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#00B3A4] text-black font-semibold py-3 disabled:opacity-60"
        >
          {submitting ? "Đang đăng nhập…" : "Login"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px bg-[#1c2227] w-full" /> OR{" "}
          <div className="h-px bg-[#1c2227] w-full" />
        </div>

        {/* GOOGLE LOGIN — trả về credential để gửi lên /auth/google */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={async (resp) => {
              try {
                setServerError("");
                const credential = resp?.credential;
                if (!credential)
                  throw new Error("Không nhận được Google credential.");
                await loginWithGoogle({ credential }); // FE -> BE
                navigate(from, { replace: true });
              } catch (err) {
                setServerError(err?.message || "Đăng nhập Google thất bại.");
              }
            }}
            onError={() =>
              setServerError("Đăng nhập Google bị hủy hoặc thất bại.")
            }
            theme="outline"
            size="large"
            width="320"
          />
        </div>
      </form>
    </AuthLayout>
  );
}
