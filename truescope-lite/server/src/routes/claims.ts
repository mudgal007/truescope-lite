/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import { z } from "zod";
import axios from "axios";
import Claim from "../models/Claim";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole"; // ✅ import Role (and the guard)
import { Status, canTransition } from "../features/claims/transition"; // ✅ need canTransition for rules

const r = Router();

/** ---------- Create schema (url OR text) ---------- */
const createSchema = z.union([
  z.object({
    type: z.literal("url"),
    url: z.string().url(),
    tags: z.string().array().optional(),
  }),
  z.object({
    type: z.literal("text"),
    text: z.string().min(10),
    tags: z.string().array().optional(),
  }),
]);

/** ---------- Helper to fetch very-basic OG tags ---------- */
async function fetchOG(url: string) {
  try {
    const { data } = await axios.get(url, { timeout: 5000 });
    const g = String(data);
    const pick = (p: RegExp) => (g.match(p)?.[1] ?? "").slice(0, 300);
    return {
      title: pick(/property=["']og:title["']\s+content=["']([^"']+)/i),
      description: pick(/property=["']og:description["']\s+content=["']([^"']+)/i),
      image: pick(/property=["']og:image["']\s+content=["']([^"']+)/i),
      siteName: pick(/property=["']og:site_name["']\s+content=["']([^"']+)/i),
    };
  } catch {
    return {};
  }
}

/** ---------- POST /api/claims  (create) ---------- */
r.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  const input = parsed.data as any;
  const tags = (input.tags ?? [])
    .map((t: string) => t.trim().toLowerCase())
    .filter(Boolean);

  let og = {};
  if (input.type === "url") og = await fetchOG(input.url);

  const doc = await Claim.create({
    type: input.type,
    url: input.url,
    text: input.text,
    og,
    tags: Array.from(new Set(tags)),
    submittedBy: (req as any).user!.id, // set by requireAuth
  });

  return res.status(201).json(doc);
});

/** ---------- GET /api/claims  (list with filters) ---------- */
r.get("/", async (req, res) => {
  const { q, status, tag, page = "1", limit = "10" } = req.query as Record<
    string,
    string
  >;

  const filter: any = {};
  if (status) filter.status = status;
  if (tag) filter.tags = tag;

  // start with base filter
  let query = Claim.find(filter);

  // if q provided, use $text (ensure text index exists on Claim model)
  if (q) {
    query = Claim.find({ ...filter, $text: { $search: q } });
  }

  const p = Math.max(1, parseInt(page));
  const l = Math.min(50, Math.max(1, parseInt(limit)));

  const items = await query
    .sort({ createdAt: -1 })
    .skip((p - 1) * l)
    .limit(l)
    .lean();

  return res.json(items); // If you later add total, return { items, total }
});

/** ---------- GET /api/claims/:id  (detail) ---------- */
r.get("/:id", async (req, res) => {
  const item = await Claim.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ error: "Not found" });
  return res.json(item);
});

/** ---------- PUT /api/claims/:id/status  (reviewer/admin only) ---------- */

// Validate body.status strictly
const statusBody = z.object({
  status: z.enum([
    "unverified",
    "under_review",
    "verified_true",
    "misleading",
    "false",
  ]),
  note: z.string().max(200).optional(), // optional audit note
});

r.put(
  "/:id/status",
  requireAuth,
  requireRole("reviewer", "admin"),
  async (req, res) => {
    // 1) Validate payload
    const parsed = statusBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid body" });
    }
    const next: Status = parsed.data.status;

    // 2) Load claim
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    const from = claim.status as Status;

    // 3) Enforce allowed transitions
    if (!canTransition(from, next)) {
      return res
        .status(400)
        .json({ message: `Invalid transition: ${from} → ${next}` });
    }

    // 4) Update + save
    claim.status = next;
    await claim.save();

    // 5) (Optional) Insert audit event here with req.user.id & parsed.data.note

    return res.json(claim.toObject()); // return updated doc
  }
);

export default r;
