/* eslint-disable no-unsafe-finally */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/ClaimDetailPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

type ClaimStatus =
  | "unverified"
  | "under_review"
  | "verified_true"
  | "misleading"
  | "false";

type Claim = {
  _id: string;
  type: "text" | "url";
  text?: string;
  url?: string;
  tags?: string[];
  status: ClaimStatus;
  createdAt: string;
  og?: { title?: string; siteName?: string; description?: string };
};

export default function ClaimDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState<Claim | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // reviewer UI state
  const [nextStatus, setNextStatus] = useState<ClaimStatus>("unverified");
  const [note, setNote] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const canReview = user?.role === "reviewer" || user?.role === "admin";

  useEffect(() => {
    if (!id) {
      setError("Missing claim id in URL.");
      setLoading(false);
      return;
    }
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/claims/${id}`);
        if (!alive) return;
        // If your API returns { item }, use res.data.item
        setItem(res.data);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load claim");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  // keep nextStatus in sync with the loaded claim
  useEffect(() => {
    if (item?.status) setNextStatus(item.status);
  }, [item?.status]);

  const rawTitle =
    item?.og?.title ||
    (item?.type === "text" ? item.text : undefined) ||
    item?.url ||
    "(no title)";
  const title =
    rawTitle && rawTitle.length > 120 ? rawTitle.slice(0, 120) + "…" : rawTitle;

  function statusColor(s: ClaimStatus): string {
    switch (s) {
      case "unverified":
        return "#6b7280"; // gray
      case "under_review":
        return "#f59e0b"; // amber
      case "verified_true":
        return "#10b981"; // green
      case "misleading":
        return "#ef4444"; // red
      case "false":
        return "#b91c1c"; // dark red
      default:
        return "#6b7280";
    }
  }

  // optional: limit selectable options based on workflow
  function allowedNextOptions(current: ClaimStatus): ClaimStatus[] {
    if (current === "unverified") return ["unverified", "under_review"];
    if (current === "under_review")
      return ["under_review", "verified_true", "misleading", "false"];
    return [current]; // final states can't move further
  }

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 12 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => nav(-1)}>← Back</button>
        <button type="button" onClick={() => nav("/claims")}>All Claims</button>
      </div>

      {loading && <div style={{ padding: 12 }}>Loading…</div>}
      {error && <div style={{ color: "crimson", padding: 12 }}>{error}</div>}
      {!loading && !error && !item && <div style={{ padding: 12 }}>Not found.</div>}

      {!loading && !error && item && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <h2 style={{ margin: 0 }}>{title}</h2>

          {/* status + meta */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: 999,
                background: statusColor(item.status),
                color: "white",
                fontSize: 12,
              }}
              title={`Status: ${item.status}`}
            >
              {item.status}
            </span>

            <span style={{ fontSize: 12, color: "#4b5563" }}>
              Created: {new Date(item.createdAt).toLocaleString()}
            </span>

            {item.og?.siteName && (
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                Source: {item.og.siteName}
              </span>
            )}
          </div>

          {/* tags */}
          <div style={{ fontSize: 12, color: "#4b5563", marginTop: 8 }}>
            <b>Tags:</b> {item.tags?.length ? item.tags.join(", ") : "—"}
          </div>

          {/* content */}
          <div style={{ marginTop: 16, lineHeight: 1.55 }}>
            {item.type === "text" && item.text && (
              <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{item.text}</p>
            )}
            {item.type === "url" && item.url && (
              <>
                {item.og?.description && (
                  <p style={{ color: "#374151", marginTop: 0 }}>
                    {item.og.description}
                  </p>
                )}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#2563eb" }}
                >
                  Open source ↗
                </a>
              </>
            )}
          </div>

          {/* Reviewer/Admin controls */}
          {canReview && (
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #eee" }}>
              <h4 style={{ margin: 0, marginBottom: 8 }}>Reviewer Actions</h4>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as ClaimStatus)}
                  style={{ padding: 8 }}
                  disabled={saving}
                >
                  {allowedNextOptions(item.status).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Note (optional, max 200)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={200}
                  style={{ padding: 8, minWidth: 260 }}
                  disabled={saving}
                />

                <button
                  disabled={
                    saving ||
                    !nextStatus ||
                    nextStatus === item.status
                  }
                  onClick={async () => {
                    setSaving(true);
                    setSaveError(null);
                    try {
                      await api.put(`/claims/${item._id}/status`, {
                        status: nextStatus,
                        note,
                      });
                      // Update local status (or refetch)
                      setItem((prev) =>
                        prev ? { ...prev, status: nextStatus } : prev
                      );
                    } catch (e: any) {
                      setSaveError(e?.message || "Failed to update status");
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>

              {saveError && (
                <div style={{ color: "crimson", marginTop: 8 }}>{saveError}</div>
              )}

              <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                Allowed flow: <code>unverified → under_review → (verified_true | misleading | false)</code>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
