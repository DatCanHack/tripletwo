// src/pages/Checkout.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/apiClient";

import {
  PLANS as PLAN_DEF, // { BASIC:{key:'BASIC', name:'Basic'}, PRO:{...}, ELITE:{...} }
  getPriceUSD, // (planKey, "MONTHLY"|"YEARLY") -> number
} from "../lib/plan";

const formatVND = (n) =>
  typeof n === "number" ? n.toLocaleString("vi-VN") + " đ" : "";

/* ---------- Chuẩn hoá nguồn QR từ nhiều kiểu field ---------- */
function pickQrSource(payload) {
  const d = payload || {};
  const svgCandidates = [
    d?.qr?.svg,
    d?.svg,
    typeof d?.qr === "string" && d.qr.startsWith("<svg") ? d.qr : null,
  ].filter(Boolean);
  const svg = svgCandidates.find(
    (s) => typeof s === "string" && s.includes("<svg")
  );
  if (svg) return { svg, src: "" };

  const urlCandidates = [
    d?.qr?.url,
    d?.qr?.dataURL,
    d?.qr?.imageUrl,
    d?.qr?.image,
    d?.qr?.png || d?.qr?.PNG,
    d?.qrUrl,
    d?.qrDataURL,
    d?.qrPNG,
    d?.imageUrl,
    d?.image,
    d?.url,
    d?.dataURL,
    typeof d?.qr === "string" && !d.qr.startsWith("<svg") ? d.qr : null,
  ].filter((v) => typeof v === "string" && v.length > 8);

  let cand = urlCandidates[0] || "";
  if (/^data:image\/svg\+xml[,;]/i.test(cand)) return { svg: "", src: cand };
  if (/^(https?:)?\/\//i.test(cand) || /^data:image\//i.test(cand))
    return { svg: "", src: cand };
  if (cand) return { svg: "", src: `data:image/png;base64,${cand}` };
  return { svg: "", src: "" };
}

/* ---------- Chuẩn hoá & lấy giá an toàn (hoa/thường) ---------- */
function normalizeBilling(raw) {
  const v = String(raw || "").toUpperCase();
  return v === "YEARLY" ? "YEARLY" : "MONTHLY";
}
function findPlanMeta(raw) {
  if (!raw) return null;
  const s = String(raw);
  const up = s.toUpperCase();
  const lo = s.toLowerCase();
  return (
    Object.values(PLAN_DEF).find((p) => p.key === up) ||
    Object.values(PLAN_DEF).find((p) => p.key.toLowerCase() === lo) ||
    null
  );
}
function getPriceUSDCompat(planKey, billing) {
  // thử theo nhiều biến thể để chắc chắn khớp lib/plan hiện tại
  const upPlan = String(planKey || "").toUpperCase();
  const loPlan = String(planKey || "").toLowerCase();
  const upBil = normalizeBilling(billing);
  const loBil = upBil.toLowerCase();

  let v =
    getPriceUSD?.(upPlan, upBil) ??
    getPriceUSD?.(upPlan, loBil) ??
    getPriceUSD?.(loPlan, upBil) ??
    getPriceUSD?.(loPlan, loBil);

  if (typeof v !== "number" || Number.isNaN(v)) {
    // fallback cuối cùng về PRO MONTHLY để không vỡ UI
    v = getPriceUSD?.(PLAN_DEF.PRO.key, "MONTHLY");
  }
  return v;
}

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Đọc query từ Pricing
  const q = new URLSearchParams(location.search);
  const planParam = q.get("plan"); // "basic" | "BASIC" | ...
  const billingParam = q.get("billing"); // "monthly" | "yearly" | ...

  // Chuẩn hoá
  const planMeta = findPlanMeta(planParam) || PLAN_DEF.PRO; // mặc định Pro nếu query sai

  const billing = normalizeBilling(billingParam);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [coupon, setCoupon] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // VietQR modal data: { invoice:{id,amount,addInfo,status}, bank:{...}, qr:{url?,svg?} }
  const [qrData, setQrData] = useState(null);
  const [showQR, setShowQR] = useState(false);

  // Giá USD hiển thị phải khớp Pricing
  const summary = useMemo(() => {
    const price = getPriceUSDCompat(planMeta.key, billing);
    return { price, total: price };
  }, [planMeta.key, billing]);

  async function handlePay(e) {
    e?.preventDefault?.();
    setServerError("");
    setSubmitting(true);
    try {
      // Gửi đúng enum cho BE
      const resp = await api.createVietQRInvoice({
        plan: planMeta.key, // "BASIC" | "PRO" | "ELITE"
        billing, // "MONTHLY" | "YEARLY"
        name,
        email,
        coupon,
      });
      setQrData(resp);
      setShowQR(true);
    } catch (err) {
      console.error('Payment creation error:', err);
      let errorMessage = "Không tạo được VietQR, thử lại nhé.";
      
      if (err?.code === 'NETWORK_ERROR') {
        errorMessage = "Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng và thử lại.";
      } else if (err?.code === 'TIMEOUT') {
        errorMessage = "Yêu cầu quá thời gian. Vui lòng thử lại.";
      } else if (err?.status === 401) {
        errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setServerError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  // Poll trạng thái thanh toán -> /pay/invoice/:id
  useEffect(() => {
    if (!showQR || !qrData?.invoice?.id) return;
    let timerId;
    const poll = async () => {
      try {
        const inv = await api.getInvoice(qrData.invoice.id);
        if (inv?.status === "PAID" || inv?.status === "SUCCEEDED") {
          setShowQR(false);
          navigate("/thank-you", { replace: true });
          return;
        }
      } catch {}
      timerId = setTimeout(poll, 3000);
    };
    poll();
    return () => clearTimeout(timerId);
  }, [showQR, qrData?.invoice?.id, navigate]);

  // Thông tin hiển thị QR
  const amountVND =
    qrData?.invoice?.amount != null
      ? formatVND(qrData.invoice.amount)
      : qrData?.amount != null
      ? formatVND(qrData.amount)
      : "";

  const { svg: qrSvg, src: qrSrc } = pickQrSource(qrData);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {serverError && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {serverError}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Form */}
        <form
          onSubmit={handlePay}
          className="md:col-span-2 space-y-6 rounded-2xl border border-[#1c2227] bg-[#0f1214] p-4"
        >
          <section className="space-y-3">
            <h2 className="font-semibold">Contact</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="rounded-xl bg-[#0b0e11] border border-[#1c2227] px-3 py-2 outline-none"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="rounded-xl bg-[#0b0e11] border border-[#1c2227] px-3 py-2 outline-none"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold">Payment</h2>
            <div className="grid md:grid-cols-3 gap-3">
              <input
                className="rounded-xl bg-[#0b0e11] border border-[#1c2227] px-3 py-2 outline-none md:col-span-2"
                placeholder="Coupon (optional)"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
              />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#00B3A4] text-black font-semibold px-4 py-2 disabled:opacity-60"
              >
                {submitting ? "Đang tạo QR…" : `Pay $${summary.total}`}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Nhấn “Pay” để tạo mã <b>VietQR</b> và quét thanh toán bằng app
              ngân hàng. Hệ thống sẽ tự động xác nhận sau khi nhận tiền.
            </p>
          </section>
        </form>

        {/* Order summary */}
        <aside className="space-y-3 rounded-2xl border border-[#1c2227] bg-[#0f1214] p-4">
          <h2 className="font-semibold">Order Summary</h2>
          <div className="flex items-center justify-between text-sm">
            <span>
              {planMeta.name} ({billing.toLowerCase()})
            </span>
            <span>${summary.price}</span>
          </div>
          <div className="border-t border-[#1c2227] my-2" />
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span>${summary.total}</span>
          </div>
          <ul className="mt-3 text-sm text-gray-300 space-y-1">
            <li>✔ Tất cả lessons</li>
            <li>✔ Video 1080p</li>
            <li>✔ Program 4 tuần</li>
            <li>✔ Menu chuyên biệt</li>
          </ul>
        </aside>
      </div>

      {/* ===== VietQR Modal ===== */}
      {showQR && qrData && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-[min(460px,95vw)] rounded-2xl border border-[#1c2227] bg-[#0f1214] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                Quét VietQR để thanh toán
              </h3>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {qrSvg ? (
                <div
                  className="mx-auto rounded-lg bg-white p-2 w-[280px] max-w-full"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : qrSrc ? (
                <>
                  <img
                    src={qrSrc}
                    alt="VietQR"
                    className="mx-auto rounded-lg bg-white p-2 w-[280px] max-w-full h-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="text-center">
                    <a
                      href={qrSrc}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-[#00B3A4] underline"
                    >
                      Mở ảnh QR trong tab mới
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center text-sm text-red-300">
                  Không nhận được ảnh QR từ server
                </div>
              )}

              <div className="text-sm bg-white/5 rounded-xl p-3 space-y-1">
                {amountVND && (
                  <div>
                    Số tiền: <b>{amountVND}</b>
                  </div>
                )}
                {qrData?.bank?.accountName && (
                  <div>
                    Tên TK: <b>{qrData.bank.accountName}</b>
                  </div>
                )}
                {qrData?.bank?.accountNo && (
                  <div>
                    Số TK: <b>{qrData.bank.accountNo}</b>
                  </div>
                )}
                {(qrData?.invoice?.addInfo || qrData?.transfer) && (
                  <div>
                    Nội dung:{" "}
                    <b>{qrData?.invoice?.addInfo || qrData?.transfer}</b>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400">
                Sau khi chuyển khoản, trang sẽ tự xác nhận trong vài giây. Nếu
                QR hết hạn, hãy đóng và bấm “Pay” để tạo lại.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
