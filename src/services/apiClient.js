// src/services/apiClient.js

// Chuẩn hoá API base; rơi về localhost:5500 nếu chưa set VITE_API_URL
const API_URL = String(
  import.meta.env.VITE_API_URL || "http://localhost:5500"
).replace(/\/+$/, "");

/* ================= Token store (in-memory) ================= */
let accessToken = null;
export const tokenStore = {
  set(t) {
    accessToken = t || null;
  },
  get() {
    return accessToken;
  },
  clear() {
    accessToken = null;
  },
};

/* ================= Utils ================= */
function buildURL(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_URL + p;
}

async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ================= Core request ================= */
/**
 * @param {string} path
 * @param {{
 *  method?: string,
 *  json?: any,
 *  headers?: Record<string,string>,
 *  retry?: boolean,
 *  timeout?: number,
 *  skipAuth?: boolean,       // ✅ mới: không tự gắn Authorization
 *  noCache?: boolean         // ✅ mới: thêm Cache-Control: no-store
 * }} options
 */
async function request(
  path,
  {
    method = "GET",
    json,
    headers,
    retry = true, // chỉ refresh 1 lần khi 401
    timeout = 30000,
    skipAuth = false,
    noCache = true,
  } = {}
) {
  const h = { Accept: "application/json", ...(headers || {}) };
  if (json !== undefined) h["Content-Type"] = "application/json";
  if (noCache) {
    h["Cache-Control"] = "no-store";
    h["Pragma"] = "no-cache";
  }

  if (!skipAuth) {
    const token = tokenStore.get();
    if (token) h["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeout);

  let res;
  try {
    res = await fetch(buildURL(path), {
      method,
      headers: h,
      body: json !== undefined ? JSON.stringify(json) : undefined,
      credentials: "include",
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(to);
    if (e?.name === "AbortError") {
      const err = new Error("Yêu cầu quá thời gian. Vui lòng thử lại.");
      err.code = "TIMEOUT";
      throw err;
    }
    const err = new Error("Không thể kết nối đến máy chủ.");
    err.code = "NETWORK_ERROR";
    throw err;
  } finally {
    clearTimeout(to);
  }

  // Nếu 401 -> thử refresh 1 lần rồi gọi lại (chỉ cho các request thường)
  if (res.status === 401 && retry && !skipAuth) {
    const ok = await refresh();
    if (ok) {
      return request(path, {
        method,
        json,
        headers,
        retry: false,
        timeout,
        skipAuth,
        noCache,
      });
    }
  }

  const data = await safeJson(res);
  if (!res.ok) {
    const err = new Error(data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.code = data?.error;
    err.data = data;
    throw err;
  }

  return data;
}

/* ================= Refresh qua cookie ================= */
/**
 * Gọi /auth/refresh dùng cookie, KHÔNG gắn Authorization.
 * Có backoff ngắn khi server đang warm-up (503).
 */
export async function refresh() {
  try {
    // thử tối đa 2 lần nếu gặp 503 (DB warm-up)
    for (let i = 0; i < 2; i++) {
      try {
        const data = await request("/auth/refresh", {
          method: "POST",
          retry: false,
          timeout: 30000,
          skipAuth: true, // ✅ quan trọng
        });
        if (data?.accessToken) {
          tokenStore.set(data.accessToken);
          return true;
        }
        tokenStore.clear();
        return false;
      } catch (e) {
        // nếu DB_TIMEOUT/503 thì backoff 1s rồi thử lại 1 lần
        if (e?.status === 503 || e?.code === "DB_TIMEOUT") {
          await sleep(1000);
          continue;
        }
        throw e;
      }
    }
    tokenStore.clear();
    return false;
  } catch {
    tokenStore.clear();
    return false;
  }
}

/* Dùng chung cho FE khác (ChatBot, v.v.): trả token hiện tại; nếu rỗng -> refresh */
export async function ensureAccess() {
  const t = tokenStore.get();
  if (t) return t;
  const ok = await refresh().catch(() => false);
  return ok ? tokenStore.get() : null;
}

/* ======================= Public API ======================= */
// Google login: chấp nhận access_token (Implicit) hoặc id_token/credential (One Tap)
async function loginWithGoogle({ access_token, id_token, credential } = {}) {
  const payload = access_token
    ? { access_token }
    : { id_token: id_token || credential };

  const data = await request("/auth/google", {
    method: "POST",
    json: payload,
    retry: false,
    timeout: 45000, // tăng thời gian cho lần cold-start
  });
  tokenStore.set(data?.accessToken || null);
  return data;
}

export const api = {
  /* ---------- Auth ---------- */
  async login({ email, password }) {
    const data = await request("/auth/login", {
      method: "POST",
      json: { email, password },
      retry: false,
      timeout: 45000, // ✅ tăng timeout cho lần đầu server warm-up
    });
    tokenStore.set(data?.accessToken || null);
    return data;
  },

  async signup({ name, email, password }) {
    return request("/auth/register", {
      method: "POST",
      json: { name, email, password },
      retry: false,
      timeout: 45000,
    });
  },

  async logout() {
    tokenStore.clear();
    try {
      await request("/auth/logout", { method: "POST", retry: false });
    } catch {}
  },

  me() {
    return request("/account/me");
  },

  updateProfile(patch) {
    return request("/account/me", { method: "PATCH", json: patch });
  },

  updateSubscription({ plan, billing }) {
    return request("/account/me/subscription", {
      method: "PATCH",
      json: { plan, billing },
    });
  },

  lessons() {
    return request("/content/lessons");
  },

  programs(params = {}) {
    const q = new URLSearchParams(params).toString();
    return request(`/content/programs${q ? `?${q}` : ""}`);
  },

  // expose cho AuthContext
  refresh: () => refresh(),
  loginWithGoogle,

  /* ---------- AI (tiện dụng cho ChatBot) ---------- */
  async aiChat(payload) {
    // luôn cố có Bearer trước
    const access = await ensureAccess();
    const headers = { "Content-Type": "application/json" };
    if (access) headers["Authorization"] = `Bearer ${access}`;

    // gọi lần 1
    let res = await fetch(buildURL("/ai/chat"), {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });

    // nếu 401 -> refresh rồi gọi lại 1 lần
    if (res.status === 401) {
      const ok = await refresh().catch(() => false);
      if (ok) {
        const access2 = tokenStore.get();
        const headers2 = { "Content-Type": "application/json" };
        if (access2) headers2["Authorization"] = `Bearer ${access2}`;
        res = await fetch(buildURL("/ai/chat"), {
          method: "POST",
          headers: headers2,
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }
    }

    // parse & throw nếu lỗi
    const data = await safeJson(res);
    if (!res.ok) {
      const err = new Error(data?.message || `HTTP ${res.status}`);
      err.status = res.status;
      err.code = data?.error;
      err.data = data;
      throw err;
    }
    return data;
  },

  /* ---------- VietQR Payments ---------- */
  async createVietQRInvoice(payload) {
    await ensureAccess(); // nạp token từ cookie refresh nếu cần
    return request("/pay/create", {
      method: "POST",
      json: payload,
      retry: true,
    });
  },

  async getInvoice(invoiceId) {
    await ensureAccess();
    return request(`/pay/invoice/${invoiceId}`, { retry: true });
  },

  async cancelInvoice(invoiceId) {
    await ensureAccess();
    return request(`/pay/invoice/${invoiceId}`, {
      method: "DELETE",
      retry: true,
    });
  },

  async waitInvoicePaid(
    invoiceId,
    { interval = 3000, timeout = 5 * 60 * 1000 } = {}
  ) {
    const start = Date.now();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const inv = await this.getInvoice(invoiceId);
      if (inv?.status === "PAID" || inv?.status === "SUCCEEDED") return inv;
      if (Date.now() - start > timeout) {
        const err = new Error("Hết thời gian chờ thanh toán.");
        err.code = "PAY_TIMEOUT";
        throw err;
      }
      await sleep(interval);
    }
  },

  // ===== Alias để tương thích code cũ =====
  createVietQR(payload) {
    return this.createVietQRInvoice(payload);
  },
  getPayment(invoiceId) {
    return this.getInvoice(invoiceId);
  },
  waitPayment(invoiceId, opts) {
    return this.waitInvoicePaid(invoiceId, opts);
  },
};

/* (Tuỳ chọn) helper */
export function getApiBase() {
  return API_URL;
}

/* ====================== Admin API ====================== */
export const adminApi = {
  listUsers(params = {}) {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/users${q ? `?${q}` : ""}`);
  },
  getUser(id) {
    return request(`/admin/users/${id}`);
  },
  setRole(id, role) {
    return request(`/admin/users/${id}/role`, {
      method: "PATCH",
      json: { role },
    });
  },
  setSubscription(id, { plan, billing }) {
    return request(`/admin/users/${id}/subscription`, {
      method: "PATCH",
      json: { plan, billing },
    });
  },
  setActive(id, active) {
    return request(`/admin/users/${id}`, {
      method: "PATCH",
      json: { active },
    });
  },
  deleteUser(id) {
    return request(`/admin/users/${id}`, { method: "DELETE" });
  },
};
