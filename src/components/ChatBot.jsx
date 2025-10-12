// src/components/ChatBot.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, tokenStore } from "../services/apiClient";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5500"
).replace(/\/+$/, "");

/* ---------- Icon Bot (SVG) ---------- */
function BotIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7 10a5 5 0 0 1 10 0v1.5a4.5 4.5 0 0 1-4.5 4.5h-1A4.5 4.5 0 0 1 7 11.5V10Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9.5 10.5h.01M14.49 10.5h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M12 4V2M5 9H3M21 9h-2M8 18l-1.2 2a1 1 0 0 0 .86 1.5h8.68a1 1 0 0 0 .86-1.5L16 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------- Utils ---------- */
const uuid = () =>
  globalThis.crypto?.randomUUID?.() ||
  `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

async function safeJson(res) {
  const t = await res.text();
  try {
    return t ? JSON.parse(t) : {};
  } catch {
    return {};
  }
}

/* Lấy access token từ memory; nếu hết hạn thì gọi refresh() */
async function ensureAccess() {
  let t = tokenStore.get();
  if (t) return t;
  const ok = await api.refresh().catch(() => false);
  if (ok) return tokenStore.get();
  return null;
}

export default function ChatBot() {
  const { user, booted } = useAuth();

  // Lấy plan từ user (hỗ trợ nhiều cấu trúc)
  const plan = (() => {
    const p = user?.subscription?.plan || user?.subscriptionPlan || "FREE";
    return String(p).toUpperCase();
  })();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState([
    {
      id: "hello",
      role: "assistant",
      content:
        "Chào bạn! Mình là trợ lý dinh dưỡng & tập luyện của TripleTwo. Bạn muốn gợi ý bữa ăn, tính macro hay lên lịch tập 3 buổi/tuần?",
    },
  ]);

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs, open]);

  if (!booted) return null;

  async function callChatAPI(payload, triedRefresh = false) {
    const access = await ensureAccess(); // lấy token, tự refresh nếu rỗng
    const headers = { "Content-Type": "application/json" };
    if (access) headers["Authorization"] = `Bearer ${access}`;

    let res = await fetch(`${API_BASE}/ai/chat`, {
      method: "POST",
      headers,
      credentials: "include", // gửi cookie (refresh) kèm luôn
      body: JSON.stringify(payload),
    });

    // Nếu 401 và chưa thử refresh thì thử 1 lần
    if (res.status === 401 && !triedRefresh) {
      const ok = await api.refresh().catch(() => false);
      if (ok) {
        const access2 = tokenStore.get();
        const headers2 = { "Content-Type": "application/json" };
        if (access2) headers2["Authorization"] = `Bearer ${access2}`;
        res = await fetch(`${API_BASE}/ai/chat`, {
          method: "POST",
          headers: headers2,
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }
    }
    return res;
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    if (!user) {
      setOpen(true);
      return;
    }

    const userMsg = { id: uuid(), role: "user", content: text };
    const nextHistory = [
      ...msgs.slice(-9).map(({ role, content }) => ({ role, content })),
      { role: "user", content: text },
    ];

    setInput("");
    setMsgs((m) => [...m, userMsg]);
    setBusy(true);

    try {
      const data = await api.aiChat({
        message: text,
        plan,
        history: nextHistory,
      });
      setMsgs((m) => [
        ...m,
        {
          id: uuid(),
          role: "assistant",
          content: data?.reply || "Mình chưa rõ ý bạn, bạn nói lại giúp nhé?",
        },
      ]);
    } catch (e) {
      console.error('AI Chat error:', e);
      let errorMessage = "Mạng chập chờ̀n, bạn thử lại giúp mình nhé.";
      
      // nếu BE vẫn trả 401 vì hết refresh => báo đăng nhập
      if (e?.status === 401) {
        errorMessage = "Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục dùng AI Coach.";
      } else if (e?.code === 'NETWORK_ERROR') {
        errorMessage = "Không thể kết nối đến máy chủ. Kiểm tra mạng và thử lại.";
      } else if (e?.code === 'TIMEOUT') {
        errorMessage = "AI đang bận, bạn chờ chút và thử lại nhé.";
      } else if (e?.status === 500) {
        errorMessage = "AI đang bảo trì, bạn thử lại sau vài phút nhé.";
      }
      
      setMsgs((m) => [
        ...m,
        {
          id: uuid(),
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function press(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const toggleOpen = () => {
    setOpen((v) => !v);
  };

  return (
    <>
      {/* ===== Floating AI button ===== */}
      <button
        onClick={toggleOpen}
        aria-label={open ? "Đóng AI Coach" : "Mở AI Coach"}
        className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-50 group"
      >
        <span className="relative inline-flex items-center justify-center w-14 h-14 rounded-full text-black bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_12px_30px_rgba(0,179,164,.35)] ring-1 ring-white/20 transition-all duration-200 hover:scale-105 active:scale-95">
          <span className="absolute inset-0 rounded-full blur-md bg-emerald-400/40 opacity-40 group-hover:opacity-60 transition-opacity" />
          <span className="relative z-10">
            <BotIcon className="w-6 h-6" />
          </span>
        </span>
        {!open && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-300 ring-2 ring-[#0f1214] animate-pulse" />
        )}
      </button>

      {/* ===== Nếu chưa đăng nhập: Gate nhỏ yêu cầu đăng nhập ===== */}
      {open && !user && (
        <div className="fixed right-4 bottom-20 md:right-6 md:bottom-24 z-50 w-[min(360px,94vw)] rounded-2xl border border-[#1c2227] bg-[#0f1214] shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1c2227] flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300">
                <BotIcon className="w-3.5 h-3.5" />
              </span>
              TripleTwo – AI Coach
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white rounded-lg px-2 py-1"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="text-sm text-gray-300">
              Vui lòng <span className="font-semibold">đăng nhập</span> để sử
              dụng AI Coach.
            </div>
            <div className="flex gap-2">
              <Link
                to="/login"
                className="flex-1 px-3 py-2 rounded-xl text-black font-semibold bg-emerald-400 hover:bg-emerald-300 text-center"
                onClick={() => setOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link
                to="/signup"
                className="flex-1 px-3 py-2 rounded-xl border border-[#1c2227] hover:bg-white/5 text-center"
                onClick={() => setOpen(false)}
              >
                Đăng ký
              </Link>
            </div>
            <div className="text-[11px] text-gray-500">
              (Tính năng chỉ dành cho thành viên để bảo vệ quyền riêng tư của
              bạn.)
            </div>
          </div>
        </div>
      )}

      {/* ===== Đã đăng nhập: Chat window ===== */}
      {open && user && (
        <div className="fixed right-4 bottom-20 md:right-6 md:bottom-24 z-50 w-[min(380px,94vw)] rounded-2xl border border-[#1c2227] bg-[#0f1214] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#1c2227] flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300">
                <BotIcon className="w-3.5 h-3.5" />
              </span>
              TripleTwo – AI Coach
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white rounded-lg px-2 py-1"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="max-h-[55vh] overflow-y-auto p-4 space-y-3"
            aria-live="polite"
          >
            {msgs.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 border border-white/10 text-sm whitespace-pre-wrap ${
                    m.role === "user" ? "bg-emerald-500/20" : "bg-white/5"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-3 py-2 border border-white/10 text-sm bg-white/5 text-gray-300">
                  Đang soạn trả lời…
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#1c2227]">
            <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar">
              {[
                "Gợi ý bữa ~500 kcal giàu protein",
                "Lịch tập 3 buổi/tuần cho người mới",
                "Ăn gì trước/sau tập?",
              ].map((t) => (
                <button
                  key={t}
                  onClick={() => setInput(t)}
                  className="px-2 py-1 rounded-xl text-xs bg-white/5 border border-white/10 hover:bg-white/10"
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={press}
                placeholder="Nhập câu hỏi về ăn uống/tập luyện…"
                className="flex-1 resize-none rounded-xl bg-[#0b0e11] border border-[#1c2227] px-3 py-2 outline-none"
              />
              <button
                onClick={send}
                disabled={busy || !input.trim()}
                className="px-3 py-2 rounded-xl text-black font-semibold disabled:opacity-50 bg-emerald-400 hover:bg-emerald-300"
              >
                Gửi
              </button>
            </div>

            <div className="mt-2 text-[11px] text-gray-500">
              Nội dung chỉ mang tính tham khảo. Nếu có bệnh nền, hãy hỏi bác
              sĩ/HLV.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
