/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/ClaimsListPage.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

type Claim = {
  _id: string;
  type: "text" | "url";
  text?: string;
  url?: string;
  tags?: string[];
  status: "unverified" | "under_review" | "verified_true" | "misleading" | "false";
  createdAt: string;
  og?: { title?: string; siteName?: string };
};

export default function ClaimsListPage() {
  const { user } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isAuthed = !!user || !!token;

  // data + ui
  const [items, setItems] = useState<Claim[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [q, setQ] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [tag, setTag] = useState<string>("");

  // paging
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10); // fixed for now

  function buildParams() {
    const params: Record<string, any> = { page, limit };
    if (q.trim()) params.q = q.trim();
    if (status) params.status = status;
    if (tag) params.tag = tag;
    return params;
  }

  async function fetchClaims(custom?: Record<string, any>) {
    setLoading(true);
    setError(null);
    try {
      const params = custom ?? buildParams();
      const res = await api.get("/claims", { params });
      // If your API returns { items, total }, use: setItems(res.data.items)
      setItems(res.data);
    } catch (e: any) {
      setError(e?.message || "Failed to load claims");
    } finally {
      setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refetch on page change
  useEffect(() => {
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Redirect authenticated users to dashboard
  if (isAuthed) {
    return <Navigate to="/dashboard" replace />;
  }

  const applyDisabled = loading;
  const resetDisabled = loading || (!q && !status && !tag);

  return (
    <div style={{ maxWidth: 960, margin: "24px auto", padding: 12 }}>
      <h2>Claims</h2>

      {/* TOP CONTROLS */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          margin: "12px 0",
        }}
      >
        <input
          placeholder="Search text or URL…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ width: 260, padding: 8 }}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: 8 }}
        >
          <option value="">All statuses</option>
          <option value="unverified">Unverified</option>
          <option value="under_review">Under review</option>
          <option value="verified_true">Verified true</option>
          <option value="misleading">Misleading</option>
          <option value="false">False</option>
        </select>

        <input
          placeholder="Tag (e.g. india)"
          value={tag}
          onChange={(e) => setTag(e.target.value.trim().toLowerCase())}
          style={{ width: 180, padding: 8 }}
        />

        <button
          style={{ padding: "8px 12px" }}
          disabled={applyDisabled}
          onClick={() => {
            setPage(1);
            fetchClaims();
          }}
        >
          Apply
        </button>

        <button
          style={{ padding: "8px 12px" }}
          disabled={resetDisabled}
          onClick={() => {
            setQ("");
            setStatus("");
            setTag("");
            setPage(1);
            fetchClaims({ page: 1, limit });
          }}
        >
          Reset
        </button>
      </div>

      {/* FEEDBACK STATES */}
      {loading && <div style={{ padding: 8 }}>Loading…</div>}
      {error && <div style={{ color: "crimson", padding: 8 }}>{error}</div>}

      {/* LIST */}
      {!loading && !error && items.length === 0 && (
        <div style={{ padding: 8, color: "#666" }}>No claims match your filters.</div>
      )}

      {!loading && !error && items.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((it) => {
            const fallback = it.text || it.url || "";
            const rawTitle = it.og?.title || fallback;
            const title =
              rawTitle.length > 100 ? rawTitle.slice(0, 100) + "…" : rawTitle;

            return (
              <div
                key={it._id}
                style={{
                  padding: 12,
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  {title || "(no title)"}
                </div>

                <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>
                  <b>Status:</b> {it.status} &nbsp; • &nbsp;
                  <b>Tags:</b> {it.tags?.length ? it.tags.join(", ") : "—"} &nbsp; • &nbsp;
                  <b>Created:</b> {new Date(it.createdAt).toLocaleString()}
                </div>

                {it.type === "url" && it.url && (
                  <a href={it.url} target="_blank" rel="noreferrer">
                    Open source
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={loading || page === 1}
        >
          Prev
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={loading /* or add a flag when server says no more */}
        >
          Next
        </button>
        <div style={{ padding: "6px 8px" }}>Page {page}</div>
      </div>
    </div>
  );
}
