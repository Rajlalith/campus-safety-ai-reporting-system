// src/routes/alerts.js
import express from "express";
import Alert from "../models/Alert.js";

const router = express.Router();

// POST /api/alerts  -> create + broadcast
router.post("/", async (req, res, next) => {
  try {
    const io = req.app.get("io");
    const { title, message, severity, expiresAt } = req.body;

    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
    if (!message?.trim()) return res.status(400).json({ message: "Message is required" });

    const alert = await Alert.create({
      title: title.trim(),
      message: message.trim(),
      severity: ["info", "warning", "critical"].includes(severity) ? severity : "info",
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      active: true,
      createdBy: req.user?.email || "admin", // if you add auth later
    });

    // ✅ broadcast realtime
    io?.emit?.("alert:new", {
      _id: alert._id,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      createdAt: alert.createdAt,
      expiresAt: alert.expiresAt,
    });

    return res.status(201).json(alert);
  } catch (err) {
    next(err);
  }
});

// GET /api/alerts?active=true&limit=20
router.get("/", async (req, res, next) => {
  try {
    const activeOnly = String(req.query.active || "").toLowerCase() === "true";
    const limit = Math.min(Number(req.query.limit || 20), 100);

    const now = new Date();
    const filter = {};

    if (activeOnly) {
      filter.active = true;
      filter.$or = [{ expiresAt: null }, { expiresAt: { $gt: now } }];
    }

    const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(limit);
    return res.json(alerts);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/alerts/:id/deactivate
router.patch("/:id/deactivate", async (req, res, next) => {
  try {
    const io = req.app.get("io");
    const { id } = req.params;

    const updated = await Alert.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!updated) return res.status(404).json({ message: "Alert not found" });

    io?.emit?.("alert:deactivated", { _id: updated._id });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
