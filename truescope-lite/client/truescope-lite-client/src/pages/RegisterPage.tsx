/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/RegisterPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled =
    submitting ||
    name.trim().length < 2 ||
    !email.trim() ||
    password.length < 6;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const ok = await register(name.trim(), email.trim(), password);
      if (ok) {
        // Logout user and redirect to login (user needs to login after registration)
        logout();
        // Show success message and redirect to login
        navigate("/login", { state: { message: "Registration successful! Please login to continue." } });
      } else {
        setError("Failed to register. Please check your details.");
      }
    } catch (err: any) {
      // Axios interceptor normalizes error: { status, message, data }
      setError(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h2 style={{ marginBottom: 16 }}>Register</h2>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="name" style={{ display: "block", marginTop: 12 }}>
          Name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          minLength={2}
          autoFocus
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        />

        <label htmlFor="email" style={{ display: "block", marginTop: 12 }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        />

        <label htmlFor="password" style={{ display: "block", marginTop: 12 }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          autoComplete="new-password"
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
          {submitting ? "Registering…" : "Register"}
        </button>
      </form>

      <div style={{ marginTop: 12, textAlign: "center" }}>
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}
