/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

// ---- tiny types
type Role = "user" | "reviewer" | "admin";
type User = { id: string; name: string; email: string; role: Role; createdAt?: string };

type Ctx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

// ---- context
const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState<boolean>(!!token);

  // hydrate on mount if token exists
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!token) return setLoading(false);
      try {
        const res = await api.get("/auth/me"); // baseURL=/api
        if (alive) setUser(res.data.user);
      } catch {
        // bad token, clear it
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [token]);

  // auto-logout on 401 from interceptor
  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, []);

  async function login(email: string, password: string) {
    try {
      const res = await api.post("/auth/login", { email, password });
      // Backend returns: { token, id, name, email, role }
      const { token, id, name, email: userEmail, role } = res.data;
      if (token && id) {
        localStorage.setItem("token", token);
        setToken(token);
        setUser({ id, name, email: userEmail, role });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login error", err);
      return false;
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      // Backend register endpoint doesn't return a token - user needs to login
      // Just confirm registration was successful (user was created)
      // The response contains: { id, name, email, role }
      if (res.data && res.data.id) {
        // Registration successful - don't set token, user needs to login
        return true;
      }
      return false;
    } catch (err) {
      console.error("Register error", err);
      return false;
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  const value: Ctx = { user, token, loading, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
