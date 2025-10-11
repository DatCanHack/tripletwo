// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, tokenStore } from "../services/apiClient";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booted, setBooted] = useState(false);

  // Khởi động: nếu có refresh cookie -> refresh -> /me
  useEffect(() => {
    (async () => {
      try {
        const ok = await api.refresh();
        if (ok) {
          const { user } = await api.me();
          setUser(user);
        }
      } catch {}
      setBooted(true);
    })();
  }, []);

  /* ---------------- Email/Password ---------------- */
  const login = async (payload) => {
    const data = await api.login(payload); // { accessToken, user }
    setUser(data.user);
    return data.user;
  };

  const signup = async (payload) => {
    const data = await api.signup(payload);
    // BE của bạn đang trả { ok: true } sau register; nếu muốn auto-login có thể gọi login() luôn.
    return data;
  };

  /* ---------------- Google Login ---------------- */
  /**
   * Đăng nhập Google.
   * Truyền MỘT trong các trường sau: { access_token } (implicit),
   * { id_token } hoặc { credential } (Google One Tap).
   */
  const loginWithGoogle = async (params = {}) => {
    const { access_token, id_token, credential } = params;

    if (!access_token && !id_token && !credential) {
      throw new Error("Thiếu Google token (access_token/id_token/credential).");
    }

    // api.loginWithGoogle đã chuẩn hoá tokenStore.set(accessToken)
    const data = await api.loginWithGoogle({
      access_token,
      id_token,
      credential,
    });

    // data: { accessToken, user }
    setUser(data.user);
    return data.user;
  };

  /* ---------------- Misc ---------------- */
  const logout = async () => {
    tokenStore.clear();
    await api.logout();
    setUser(null);
  };

  const updateProfile = async (patch) => {
    const { user } = await api.updateProfile(patch);
    setUser(user);
    return user;
  };

  const activatePlan = async ({ plan, billing }) => {
    const { user } = await api.updateSubscription({ plan, billing });
    setUser(user);
    return user;
  };

  const currentPlan = user?.subscriptionPlan?.toLowerCase?.() || "free";

  const value = useMemo(
    () => ({
      user,
      booted,
      // email/password
      login,
      signup,
      // google
      loginWithGoogle,
      // misc
      logout,
      updateProfile,
      activatePlan,
      currentPlan,
    }),
    [user, booted]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
