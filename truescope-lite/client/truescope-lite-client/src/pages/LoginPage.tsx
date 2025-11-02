/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = submitting || !email.trim() || password.length < 6;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const ok = await login(email.trim(), password);
      if (ok) {
        navigate("/claims");
      } else {
        setError("Invalid email or password");
      }
    } catch (err: any) {
      // Axios interceptor normalizes: { status, message, data }
      setError(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h2 style={{ marginBottom: 16 }}>Login</h2>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email" style={{ display: "block", marginTop: 12 }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoFocus
          required
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        />

        <label htmlFor="password" style={{ display: "block", marginTop: 12 }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          minLength={6}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        />

        {error && (
          <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={disabled}
          style={{ marginTop: 16, padding: "10px 14px", width: "100%" }}
        >
          {submitting ? "Signing in…" : "Login"}
        </button>
      </form>

      <div style={{ marginTop: 12, textAlign: "center" }}>
        New here? <Link to="/register">Create an account</Link>
      </div>
    </div>
  );
}
