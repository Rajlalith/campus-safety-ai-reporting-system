const HF_MODEL = "facebook/bart-large-mnli";
const HF_API = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

const LABELS = ["Harassment", "Theft", "Suspicious Activity", "Medical", "Vandalism", "Other"];

function keywordBoost(text = "") {
  const t = text.toLowerCase();
  let score = 0;

  const high = ["weapon","gun","knife","blood","attack","assault","stalking","follow","unconscious","overdose","fire","threat"];
  const med = ["harass","steal","theft","rob","suspicious","vandal","injury","hurt","unsafe","creepy"];

  for (const w of high) if (t.includes(w)) score += 18;
  for (const w of med) if (t.includes(w)) score += 8;

  return Math.min(score, 60);
}

function baseFromCategory(cat) {
  switch (cat) {
    case "Medical": return 65;
    case "Harassment": return 55;
    case "Suspicious Activity": return 50;
    case "Theft": return 40;
    case "Vandalism": return 30;
    default: return 20;
  }
}

function makeSummary(category, description) {
  const short = description.length > 160 ? description.slice(0, 160) + "…" : description;
  return `${category}: ${short}`;
}

async function hfZeroShot(text) {
  const res = await fetch(HF_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: text,
      parameters: { candidate_labels: LABELS },
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `HF error ${res.status}`);

  return {
    category: data.labels?.[0] || "Other",
    confidence: data.scores?.[0] ?? 0,
  };
}

export async function analyzeIncidentAI({ description, userCategory }) {
  // fallback if no HF token
  if (!process.env.HF_API_TOKEN) {
    const category = userCategory || "Other";
    const urgencyScore = Math.min(100, Math.round(baseFromCategory(category) + keywordBoost(description)));
    return {
      category,
      urgencyScore,
      adminSummary: makeSummary(category, description),
      aiMeta: { model: "fallback-keywords", confidence: 0 },
    };
  }

  try {
    const text = userCategory ? `UserCategory: ${userCategory}. ${description}` : description;
    const { category, confidence } = await hfZeroShot(text);

    const urgencyScore = Math.min(
      100,
      Math.round(baseFromCategory(category) + keywordBoost(description) + Math.round(confidence * 20))
    );

    return {
      category,
      urgencyScore,
      adminSummary: makeSummary(category, description),
      aiMeta: { model: HF_MODEL, confidence },
    };
  } catch (err) {
    const category = userCategory || "Other";
    const urgencyScore = Math.min(100, Math.round(baseFromCategory(category) + keywordBoost(description)));
    return {
      category,
      urgencyScore,
      adminSummary: makeSummary(category, description),
      aiMeta: { model: "fallback-keywords", confidence: 0 },
      warning: err.message,
    };
  }
}
