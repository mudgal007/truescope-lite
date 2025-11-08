/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Create claim sidebar state
  const [showCreateSidebar, setShowCreateSidebar] = useState(false);
  const [createMode, setCreateMode] = useState<"url" | "text">("url");
  const [createUrl, setCreateUrl] = useState("");
  const [createText, setCreateText] = useState("");
  const [createTags, setCreateTags] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Claims list state
  const [items, setItems] = useState<Claim[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Filters
  const [q, setQ] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [tag, setTag] = useState<string>("");

  // Paging
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);

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
      setItems(res.data);
    } catch (e: any) {
      setError(e?.message || "Failed to load claims");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleCreateClaim(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(false);

    const valid =
      createMode === "url"
        ? /^https?:\/\//.test(createUrl.trim())
        : createText.trim().length >= 10;

    if (!valid) {
      setCreateError(
        createMode === "url"
          ? "URL must start with http:// or https://"
          : "Text must be at least 10 characters."
      );
      return;
    }

    setCreateSubmitting(true);
    try {
      const tags = Array.from(
        new Set(
          createTags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
        )
      );

      const body =
        createMode === "url"
          ? { type: "url" as const, url: createUrl.trim(), tags }
          : { type: "text" as const, text: createText.trim(), tags };

      await api.post("/claims", body);

      setCreateSuccess(true);
      setCreateUrl("");
      setCreateText("");
      setCreateTags("");
      fetchClaims(); // Refresh the list
      
      // Auto-close sidebar after 2 seconds
      setTimeout(() => {
        setShowCreateSidebar(false);
        setCreateSuccess(false);
      }, 2000);
    } catch (err: any) {
      setCreateError(err?.message || "Failed to create claim");
    } finally {
      setCreateSubmitting(false);
    }
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      verified_true: "#10b981",
      misleading: "#f59e0b",
      false: "#ef4444",
      under_review: "#3b82f6",
      unverified: "#6b7280",
    };
    return colors[status] || "#6b7280";
  }

  function formatStatus(status: string) {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  async function handleVerifyClaim(claimId: string, e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    try {
      setError(null);
      setSuccess(null);
      setVerifyingId(claimId);
      const res = await api.post(`/claims/${claimId}/verify`);
      fetchClaims();
      setSuccess(`Status updated to ${res.data?.status ?? 'unknown'}`);
    } catch (err: any) {
      setError(err?.message || "Verification failed");
    }
    finally {
      setVerifyingId(null);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      {/* Header */}
      <header
        style={{
          background: "#fff",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#667eea" }}>
          TrueScope
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button
            onClick={() => setShowCreateSidebar(true)}
            style={{
              padding: "10px 20px",
              background: "#667eea",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#5568d3";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#667eea";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Create Claim
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "#333" }}>👤</span>
            <span style={{ color: "#333", fontWeight: 500 }}>{user?.name || "User"}</span>
            <button
              onClick={logout}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid #ddd",
                borderRadius: "6px",
                cursor: "pointer",
                color: "#666",
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#ef4444";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#ddd";
                e.currentTarget.style.color = "#666";
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: "flex", position: "relative" }}>
        {/* Claims List */}
        <main
          style={{
            flex: 1,
            padding: "32px",
            maxWidth: showCreateSidebar ? "calc(100% - 400px)" : "100%",
            transition: "max-width 0.3s ease",
          }}
        >
          <h2 style={{ marginBottom: "24px", color: "#333", fontSize: "28px" }}>
            Claims Dashboard
          </h2>

          {/* Filters */}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "24px",
              background: "#fff",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <input
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", flex: 1, minWidth: "200px" }}
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
            >
              <option value="">All statuses</option>
              <option value="unverified">Unverified</option>
              <option value="under_review">Under review</option>
              <option value="verified_true">Verified true</option>
              <option value="misleading">Misleading</option>
              <option value="false">False</option>
            </select>
            <input
              placeholder="Tags"
              value={tag}
              onChange={(e) => setTag(e.target.value.trim().toLowerCase())}
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", width: "150px" }}
            />
            <button
              onClick={() => {
                setPage(1);
                fetchClaims();
              }}
              disabled={loading}
              style={{
                padding: "10px 20px",
                background: "#667eea",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Apply
            </button>
            <button
              onClick={() => {
                setQ("");
                setStatus("");
                setTag("");
                setPage(1);
                fetchClaims({ page: 1, limit });
              }}
              disabled={loading || (!q && !status && !tag)}
              style={{
                padding: "10px 20px",
                background: "#f3f4f6",
                color: "#666",
                border: "1px solid #ddd",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>

          {/* Results Info */}
          {!loading && !error && (
            <div style={{ marginBottom: "16px", color: "#666" }}>
              Showing {items.length} results - Page {page}
            </div>
          )}

          {/* Loading/Error */}
          {loading && <div style={{ padding: "24px", textAlign: "center" }}>Loading…</div>}
          {error && <div style={{ color: "crimson", padding: "16px", background: "#fee", borderRadius: "8px" }}>{error}</div>}
          {success && <div style={{ color: "#065f46", padding: "16px", background: "#d1fae5", borderRadius: "8px" }}>{success}</div>}

          {/* Claims List */}
          {!loading && !error && items.length === 0 && (
            <div style={{ padding: "48px", textAlign: "center", color: "#666", background: "#fff", borderRadius: "8px" }}>
              No claims match your filters.
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div style={{ display: "grid", gap: "12px" }}>
              {items.map((it) => {
                const fallback = it.text || it.url || "";
                const rawTitle = it.og?.title || fallback;
                const title = rawTitle.length > 100 ? rawTitle.slice(0, 100) + "…" : rawTitle;

                return (
                  <div
                    key={it._id}
                    style={{
                      padding: "20px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      background: "#fff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    onClick={() => navigate(`/claims/${it._id}`)}
                  >
                    <div style={{ fontWeight: 600, marginBottom: "8px", fontSize: "18px", color: "#333" }}>
                      {title || "(no title)"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#666", marginBottom: "12px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      {it.tags && it.tags.length > 0 && (
                        <span>
                          <b>Tags:</b> {it.tags.join(", ")}
                        </span>
                      )}
                      <span>
                        <b>Created:</b> {new Date(it.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          background: getStatusColor(it.status),
                          color: "#fff",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {formatStatus(it.status)}
                      </span>
                      {it.type === "url" && it.url && (
                        <a
                          href={it.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: "#667eea",
                            textDecoration: "none",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          Open source →
                        </a>
                      )}
                      <button
                        onClick={(e) => handleVerifyClaim(it._id, e)}
                        style={{
                          padding: "6px 10px",
                          background: "#111827",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        {verifyingId === it._id ? "Verifying…" : "Verify with AI"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div style={{ display: "flex", gap: "8px", marginTop: "24px", alignItems: "center" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={loading || page === 1}
              style={{
                padding: "8px 16px",
                background: page === 1 ? "#f3f4f6" : "#fff",
                color: page === 1 ? "#9ca3af" : "#333",
                border: "1px solid #ddd",
                borderRadius: "6px",
                cursor: page === 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
              style={{
                padding: "8px 16px",
                background: "#fff",
                color: "#333",
                border: "1px solid #ddd",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Next
            </button>
            <div style={{ padding: "8px 16px", color: "#666" }}>Page {page}</div>
          </div>
        </main>

        {/* Create Claim Sidebar */}
        {showCreateSidebar && (
          <aside
            style={{
              position: "fixed",
              right: 0,
              top: 0,
              bottom: 0,
              width: "400px",
              background: "#fff",
              boxShadow: "-4px 0 16px rgba(0,0,0,0.1)",
              padding: "24px",
              overflowY: "auto",
              zIndex: 100,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#333" }}>Create Claim</h3>
              <button
                onClick={() => {
                  setShowCreateSidebar(false);
                  setCreateError(null);
                  setCreateSuccess(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                  padding: "4px 8px",
                }}
              >
                ×
              </button>
            </div>

            {/* Mode Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "2px solid #e5e7eb" }}>
              <button
                onClick={() => {
                  setCreateMode("url");
                  setCreateError(null);
                }}
                style={{
                  padding: "10px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: createMode === "url" ? "3px solid #667eea" : "3px solid transparent",
                  color: createMode === "url" ? "#667eea" : "#666",
                  fontWeight: createMode === "url" ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                URL
              </button>
              <button
                onClick={() => {
                  setCreateMode("text");
                  setCreateError(null);
                }}
                style={{
                  padding: "10px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: createMode === "text" ? "3px solid #667eea" : "3px solid transparent",
                  color: createMode === "text" ? "#667eea" : "#666",
                  fontWeight: createMode === "text" ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Text
              </button>
            </div>

            <form onSubmit={handleCreateClaim}>
              {createMode === "url" ? (
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#333" }}>
                    URL (must start with http:// or https://)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/article"
                    value={createUrl}
                    onChange={(e) => setCreateUrl(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      marginBottom: "16px",
                    }}
                    required
                  />
                </div>
              ) : (
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#333" }}>
                    Claim Text (min 10 characters)
                  </label>
                  <textarea
                    placeholder="Describe the claim clearly…"
                    value={createText}
                    onChange={(e) => setCreateText(e.target.value)}
                    rows={6}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      marginBottom: "8px",
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                    required
                  />
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "16px" }}>
                    {createText.trim().length} / 10+
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#333" }}>
                  Tags (comma separated)
                </label>
                <input
                  placeholder="politics, india"
                  value={createTags}
                  onChange={(e) => setCreateTags(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    marginBottom: "16px",
                  }}
                />
              </div>

              {createError && (
                <div style={{ color: "crimson", marginBottom: "16px", padding: "12px", background: "#fee", borderRadius: "8px" }}>
                  {createError}
                </div>
              )}
              {createSuccess && (
                <div style={{ color: "#10b981", marginBottom: "16px", padding: "12px", background: "#d1fae5", borderRadius: "8px" }}>
                  Claim created successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={createSubmitting || (createMode === "url" ? !/^https?:\/\//.test(createUrl.trim()) : createText.trim().length < 10)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#667eea",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: createSubmitting ? "not-allowed" : "pointer",
                  opacity: createSubmitting ? 0.6 : 1,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!createSubmitting) {
                    e.currentTarget.style.background = "#5568d3";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!createSubmitting) {
                    e.currentTarget.style.background = "#667eea";
                  }
                }}
              >
                {createSubmitting ? "Creating…" : "Create"}
              </button>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
}

