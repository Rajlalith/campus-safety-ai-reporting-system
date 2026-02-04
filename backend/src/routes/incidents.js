// src/routes/incidents.js
import express from "express";
import { nanoid } from "nanoid";

import Incident from "../models/Incident.js";
import { analyzeIncidentAI } from "../services/aiService.js";
import { findDuplicateCandidate } from "../services/duplicateService.js";
import { upload } from "../middleware/upload.js";
import { analyzeImage } from "../services/visionService.js";

const router = express.Router();

/**
 * Helper: parse location safely.
 * Supports:
 * 1) JSON body: location is already an object
 * 2) FormData: location comes as a JSON string
 */
function parseLocation(rawLocation) {
  if (!rawLocation) return null;

  if (typeof rawLocation === "object") return rawLocation;

  if (typeof rawLocation === "string") {
    try {
      return JSON.parse(rawLocation);
    } catch {
      return null;
    }
  }

  return null;
}

function isValidPoint(location) {
  return (
    location &&
    location.type === "Point" &&
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2 &&
    Number.isFinite(Number(location.coordinates[0])) &&
    Number.isFinite(Number(location.coordinates[1]))
  );
}

/**
 * POST /api/incidents
 * Submit a new anonymous incident
 * Accepts:
 * - application/json (no image)
 * - multipart/form-data (with optional image file field: "photo")
 */
router.post("/", upload.single("photo"), async (req, res, next) => {
  try {
    const io = req.app.get("io"); // socket.io (optional)
    const { description, category } = req.body;

    const location = parseLocation(req.body.location);

    // validation
    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description is required" });
    }

    if (!isValidPoint(location)) {
      return res.status(400).json({ message: "Valid location coordinates required" });
    }

    // check for duplicate incidents nearby (text + geo)
    const duplicate = await findDuplicateCandidate({
      description: description.trim(),
      coordinates: location.coordinates,
    });

    if (duplicate?.duplicateOf) {
      await Incident.updateOne(
        { _id: duplicate.duplicateOf._id },
        { $inc: { duplicateOfCount: 1 } }
      );

      // optional: notify admins that a duplicate merged
      io?.emit?.("incident:merged", {
        reportCode: duplicate.duplicateOf.reportCode,
        similarity: duplicate.similarity,
      });

      return res.status(201).json({
        message: "Similar report already exists — merged for faster handling",
        reportCode: duplicate.duplicateOf.reportCode,
        merged: true,
        similarity: duplicate.similarity,
      });
    }

    // generate tracking code
    const reportCode = nanoid(10);

    // AI analysis (text)
    const ai = await analyzeIncidentAI({
      description: description.trim(),
      userCategory: category?.trim() || undefined,
    });

    // optional image analysis (computer vision)
    const attachments = [];
    if (req.file) {
      const fileUrl = `/uploads/${req.file.filename}`;

      // Best effort: don't fail report if vision fails
      const vision = await analyzeImage(req.file.path).catch(() => ({
        caption: "",
        safetyTags: [],
        ocrText: "",
      }));

      attachments.push({
        url: fileUrl,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname,
        caption: vision.caption || "",
        safetyTags: Array.isArray(vision.safetyTags) ? vision.safetyTags : [],
        ocrText: vision.ocrText || "",
      });
    }

    // save incident
    const incident = await Incident.create({
      reportCode,
      description: description.trim(),
      category: ai.category,
      urgencyScore: ai.urgencyScore,
      adminSummary: ai.adminSummary,
      aiMeta: ai.aiMeta,
      location,
      attachments,
    });

    // optional: realtime push to admin dashboard
    io?.emit?.("incident:new", {
      _id: incident._id,
      reportCode: incident.reportCode,
      category: incident.category,
      urgencyScore: incident.urgencyScore,
      createdAt: incident.createdAt,
      location: incident.location,
      attachments: incident.attachments?.map((a) => ({
        url: a.url,
        caption: a.caption,
        safetyTags: a.safetyTags,
      })),
    });

    return res.status(201).json({
      message: "Incident reported successfully",
      reportCode: incident.reportCode,
      category: incident.category,
      urgencyScore: incident.urgencyScore,
      adminSummary: incident.adminSummary,
      attachments: incident.attachments?.map((a) => ({
        url: a.url,
        caption: a.caption,
        safetyTags: a.safetyTags,
        ocrText: a.ocrText,
      })),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/incidents/track/:reportCode
 * Student checks report status
 */
router.get("/track/:reportCode", async (req, res, next) => {
  try {
    const { reportCode } = req.params;

    const incident = await Incident.findOne({ reportCode }).select(
      "status priority category urgencyScore createdAt adminNotes attachments"
    );

    if (!incident) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.json(incident);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/incidents/public?range=24h|7d
 * Privacy-safe incidents for live map
 */
router.get("/public", async (req, res, next) => {
  try {
    const range = String(req.query.range || "24h").toLowerCase();

    const ms = range === "7d" ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const since = new Date(Date.now() - ms);

    const incidents = await Incident.find({
      createdAt: { $gte: since },
      mergedInto: null,
    })
      .select("category urgencyScore location createdAt attachments")
      .sort({ createdAt: -1 })
      .limit(500);

    // return minimal attachment info (privacy-safe)
    return res.json(
      incidents.map((i) => ({
        _id: i._id,
        category: i.category,
        urgencyScore: i.urgencyScore,
        location: i.location,
        createdAt: i.createdAt,
        attachments: (i.attachments || []).map((a) => ({
          url: a.url,
          caption: a.caption,
          safetyTags: a.safetyTags,
        })),
      }))
    );
  } catch (err) {
    next(err);
  }
});

export default router;
