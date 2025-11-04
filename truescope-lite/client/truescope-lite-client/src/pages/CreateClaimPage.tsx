/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/CreateClaimPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

type Mode = "url" | "text";

export default function CreateClaimPage() {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const nav = useNavigate(); // optional — use to go back to list after success

  const valid =
    mode === "url"
      ? /^https?:\/\//.test(url.trim())
      : text.trim().length >= 10;

  function resetFeedback() {
    setError(null);
    setSuccess(false);
  }

  function onModeChange(next: Mode) {
    if (next === mode) return;
    setMode(next);
    // clear active fields when switching
    setUrl("");
    setText("");
    resetFeedback();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    resetFeedback();
    if (!valid) {
      setError(
        mode === "url"
          ? "URL must start with http:// or https://"
          : "Text must be at least 10 characters."
      );
      return;
    }

    setSubmitting(true);
    try {
      // normalize tags: trim, lowercase, unique, drop empties
      const tags = Array.from(
        new Set(
          tagsInput
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
        )
      );

      const body =
        mode === "url"
          ? { type: "url" as const, url: url.trim(), tags }
          : { type: "text" as const, text: text.trim(), tags };

      await api.post("/claims", body); // backend will fetch OG if type=url

      // success UX
      setSuccess(true);
      setUrl("");
      setText("");
      setTagsInput("");

      // OPTIONAL: navigate back to list instead of showing “Created!”
      // nav("/claims");

    } catch (err: any) {
      // Axios interceptor normalizes: { status, message, data }
      setError(err?.message || "Failed to create claim");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "32px auto", padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Create Claim</h2>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
        <label style={{ cursor: "pointer" }}>
          <input
            type="radio"
            name="mode"
            checked={mode === "url"}
            onChange={() => onModeChange("url")}
          />{" "}
          URL
        </label>
        <label style={{ cursor: "pointer" }}>
          <input
            type="radio"
            name="mode"
            checked={mode === "text"}
            onChange={() => onModeChange("text")}
          />{" "}
          Text
        </label>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {mode === "url" ? (
          <>
            <label htmlFor="url" style={{ display: "block", marginTop: 8 }}>
              URL (must start with http:// or https://)
            </label>
            <input
              id="url"
              type="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{ width: "100%", padding: 10, marginTop: 6 }}
              required
            />
          </>
        ) : (
          <>
            <label htmlFor="text" style={{ display: "block", marginTop: 8 }}>
              Claim Text (min 10 characters)
            </label>
            <textarea
              id="text"
              placeholder="Describe the claim clearly…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              style={{ width: "100%", padding: 10, marginTop: 6, resize: "vertical" }}
              required
            />
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              {text.trim().length} / 10+
            </div>
          </>
        )}

        <label htmlFor="tags" style={{ display: "block", marginTop: 12 }}>
          Tags (comma separated, optional)
        </label>
        <input
          id="tags"
          placeholder="politics, india"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        />

        {error && (
          <div style={{ color: "crimson", marginTop: 10 }}>{error}</div>
        )}
        {success && (
          <div style={{ color: "green", marginTop: 10 }}>
            Created! You can add another or go back to the list.
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !valid}
          style={{ marginTop: 14, padding: "10px 14px" }}
        >
          {submitting ? "Creating…" : "Create Claim"}
        </button>

        <button
          type="button"
          onClick={() => nav("/claims")}
          style={{ marginTop: 14, marginLeft: 8, padding: "10px 14px" }}
        >
          Back to Claims
        </button>
      </form>
    </div>
  );
}
