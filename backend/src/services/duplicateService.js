import Incident from "../models/Incident.js";

function tokenize(text = "") {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4)
  );
}

function jaccard(a, b) {
  const inter = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size ? inter.size / union.size : 0;
}

export async function findDuplicateCandidate({ description, coordinates }) {
  const since = new Date(Date.now() - 2 * 60 * 60 * 1000);

  const nearby = await Incident.find({
    createdAt: { $gte: since },
    mergedInto: null,
    location: {
      $near: {
        $geometry: { type: "Point", coordinates },
        $maxDistance: 200,
      },
    },
  }).limit(20);

  const a = tokenize(description);
  let best = null;
  let bestScore = 0;

  for (const item of nearby) {
    const b = tokenize(item.description);
    const score = jaccard(a, b);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  if (best && bestScore >= 0.35) return { duplicateOf: best, similarity: bestScore };
  return null;
}
