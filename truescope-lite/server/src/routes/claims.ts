/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import { z } from "zod";
import axios from "axios";
import Claim from "../models/Claim";
import { requireAuth } from "../middleware/auth";

const r = Router();

const createSchema = z.union([
  z.object({ type: z.literal("url"), url: z.string().url(), tags: z.string().array().optional() }),
  z.object({ type: z.literal("text"), text: z.string().min(10), tags: z.string().array().optional() }),
]);

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
  } catch { return {}; }
}

r.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const input = parsed.data as any;
  const tags = (input.tags ?? []).map((t: string) => t.trim().toLowerCase()).filter(Boolean);
  let og = {};
  if (input.type === "url") og = await fetchOG(input.url);

  const doc = await Claim.create({
    type: input.type,
    url: input.url,
    text: input.text,
    og,
    tags: Array.from(new Set(tags)),
    submittedBy: (req as any).user!.id,
  });
  res.status(201).json(doc);
});

r.get("/", async (req, res) => {
    const { q, status, tag, page = "1", limit = "10" } = req.query as Record<string,string>;
    const filter: any = {};
    if (status) filter.status = status;
    if (tag) filter.tags = tag;
    let query = Claim.find(filter);
  
    if (q) {
      query = Claim.find({ ...filter, $text: { $search: q } });
    }
  
    const p = Math.max(1, parseInt(page));
    const l = Math.min(50, Math.max(1, parseInt(limit)));
    const items = await query.sort({ createdAt: -1 }).skip((p-1)*l).limit(l).lean();
    res.json(items);
  });
  
  r.get("/:id", async (req, res) => {
    const item = await Claim.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  });
  

export default r;
