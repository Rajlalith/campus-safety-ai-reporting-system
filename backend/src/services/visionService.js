import fs from "fs";
import sharp from "sharp";

const HF_API_TOKEN = process.env.HF_API_TOKEN;
const HF_BASE = "https://api-inference.huggingface.co/models";

async function hfRequest(model, imageBuffer) {
  if (!HF_API_TOKEN) throw new Error("Missing HF_API_TOKEN");
  const res = await fetch(`${HF_BASE}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_TOKEN}`,
      "Content-Type": "application/octet-stream",
    },
    body: imageBuffer,
  });

  // HF sometimes returns 503 when model spins up
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HF error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function analyzeImage(filePath) {
  // Normalize image to jpeg, max width 960px
  const input = fs.readFileSync(filePath);
  const normalized = await sharp(input)
    .resize({ width: 960, withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  // 1) Captioning (human readable)
  let caption = "";
  try {
    const cap = await hfRequest("Salesforce/blip-image-captioning-base", normalized);
    caption = Array.isArray(cap) ? (cap[0]?.generated_text || "") : (cap?.generated_text || "");
  } catch {
    caption = "";
  }

  // 2) “Safety context” classification via zero-shot on image embeddings
  // Using CLIP-style zero-shot (general purpose)
  // NOTE: HF has multiple; this one is commonly available, but availability can vary.
  // If it errors, we still keep caption + skip this.
  const labels = [
    "medical emergency",
    "theft or burglary",
    "vandalism",
    "harassment",
    "suspicious activity",
    "fire or smoke",
    "weapon visible",
    "crowd disturbance",
    "normal scene",
  ];

  let safetyTags = [];
  try {
    const zs = await hfRequest("openai/clip-vit-base-patch32", normalized);
    // CLIP endpoint output formats vary by deployment; we’ll keep it robust:
    // If it returns embeddings, you’d need local scoring. If it returns labels directly, use those.
    // Many HF instances don’t do labels here; so treat as best-effort.
    // For reliability, we’ll fallback to caption-only if zs not label-based.
    if (Array.isArray(zs) && zs[0]?.label && zs[0]?.score != null) {
      safetyTags = zs.slice(0, 3).map(x => ({ label: x.label, score: x.score }));
    }
  } catch {
    safetyTags = [];
  }

  return { caption, safetyTags };
}
