// src/models/Alert.js
import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    severity: { type: String, enum: ["info", "warning", "critical"], default: "info" },

    // optional controls
    active: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },

    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true }
);

// helpful indexes
AlertSchema.index({ createdAt: -1 });
AlertSchema.index({ active: 1, expiresAt: 1 });

export default mongoose.model("Alert", AlertSchema);
