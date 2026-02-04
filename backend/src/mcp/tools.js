import { analyzeIncidentAI } from "../services/aiService.js";
import { analyzeImage } from "../services/visionService.js";
import { findDuplicateCandidate } from "../services/duplicateService.js";

export const tools = {
  classify_text: async (ctx) => analyzeIncidentAI({ description: ctx.description, userCategory: ctx.userCategory }),
  detect_duplicate: async (ctx) => findDuplicateCandidate({ description: ctx.description, coordinates: ctx.coordinates }),
  analyze_image: async (ctx) => (ctx.filePath ? analyzeImage(ctx.filePath) : { caption: "", safetyTags: [] }),
};
