import { tools } from "./tools.js";

export async function runTriagePipeline(input) {
  const ctx = { ...input, steps: [] };

  // 1) Duplicate detection first
  const dup = await tools.detect_duplicate(ctx).catch(() => null);
  ctx.steps.push({ tool: "detect_duplicate", output: dup });

  // 2) Text AI classification + urgency
  const ai = await tools.classify_text(ctx);
  ctx.steps.push({ tool: "classify_text", output: ai });

  // 3) Optional image analysis
  const vision = await tools.analyze_image(ctx).catch(() => ({ caption: "", safetyTags: [] }));
  ctx.steps.push({ tool: "analyze_image", output: vision });

  // Merge outputs
  return {
    duplicate: dup,
    category: ai.category,
    urgencyScore: ai.urgencyScore,
    adminSummary: ai.adminSummary,
    vision,
    toolTrace: ctx.steps, // 💥 interview gold
  };
}
