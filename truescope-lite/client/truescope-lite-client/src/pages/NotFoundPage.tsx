import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={{ maxWidth: 560, margin: "64px auto", textAlign: "center" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>404 — Not Found</h1>
      <p style={{ color: "#555", marginBottom: 20 }}>
        The page you’re looking for doesn’t exist.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <Link to="/claims">Go to Claims</Link>
        <span>•</span>
        <Link to="/login">Login</Link>
      </div>
    </div>
  );
}
