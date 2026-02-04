import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Incident from "../models/Incident.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// DEV seed admin (remove in production)
router.post("/seed", async (req, res) => {
  const { email = "admin@test.com", password = "Admin123!" } = req.body || {};
  const existing = await Admin.findOne({ email });
  if (existing) return res.json({ message: "Admin already exists", email });

  const passwordHash = await bcrypt.hash(password, 10);
  await Admin.create({ email, passwordHash, role: "admin" });
  res.json({ message: "Admin created", email, password });
});

// POST /api/admin/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

// GET /api/admin/incidents
router.get("/incidents", requireAdmin, async (req, res) => {
  const items = await Incident.find({ mergedInto: null }).sort({ createdAt: -1 }).limit(1000);
  res.json(items);
});

// PATCH /api/admin/incidents/:id
router.patch("/incidents/:id", requireAdmin, async (req, res) => {
  const { status, priority, adminNotes } = req.body || {};

  const update = {};
  if (status) update.status = status;
  if (priority) update.priority = priority;
  if (adminNotes !== undefined) update.adminNotes = adminNotes;

  const incident = await Incident.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!incident) return res.status(404).json({ message: "Incident not found" });

  res.json(incident);
});

export default router;
