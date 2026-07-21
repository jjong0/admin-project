import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { apiFetch, getToken, setToken as persistToken } from "@/lib/api-client";
import type { AdminInfo } from "@/lib/api-types";

type AuthState = {
  admin: AdminInfo | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(() => !!getToken());

  useEffect(() => {
    if (!getToken()) return;
    apiFetch<{ admin: AdminInfo }>("/api/auth/me")
      .then((data) => setAdmin(data.admin))
      .catch(() => persistToken(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const data = await apiFetch<{ token: string; admin: AdminInfo }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    persistToken(data.token);
    setAdmin(data.admin);
  }

  function logout() {
    persistToken(null);
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook is co-located with its provider by design
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
