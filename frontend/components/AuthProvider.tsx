"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { User } from "@/types";

type Ctx = { user: User | null; loading: boolean; refresh: () => Promise<void>; logout: () => Promise<void>; setUser: (u: User | null) => void };
const AuthCtx = createContext<Ctx>({ user: null, loading: true, refresh: async () => {}, logout: async () => {}, setUser: () => {} });
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try { setUser(await api<User>("/auth/me")); } catch { setUser(null); } finally { setLoading(false); }
  }, []);
  const logout = useCallback(async () => { await api("/auth/logout", { method: "POST" }).catch(() => {}); setUser(null); }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return <AuthCtx.Provider value={{ user, loading, refresh, logout, setUser }}>{children}</AuthCtx.Provider>;
}
