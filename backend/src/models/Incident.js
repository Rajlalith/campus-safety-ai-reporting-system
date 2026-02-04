// src/models/Incident.js
import mongoose from "mongoose";

/* =======================
   Attachment Subschema
======================= */
const AttachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    mimeType: { type: String, default: "" },
    originalName: { type: String, default: "" },

    // Computer Vision outputs
    caption: { type: String, default: "" }, // image caption
    ocrText: { type: String, default: "" }, // OCR extracted text

    safetyTags: [
      {
        label: { type: String },
        score: { type: Number }, // confidence score
      },
    ],
  },
  { _id: false }
);

/* =======================
   Incident Schema
======================= */
const IncidentSchema = new mongoose.Schema(
  {
    reportCode: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "Other",
    },

    urgencyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },

    status: {
      type: String,
      enum: ["received", "reviewing", "resolved"],
      default: "received",
    },

    adminNotes: {
      type: String,
      default: "",
    },

    adminSummary: {
      type: String,
      default: "",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    // ✅ Image / evidence support (Computer Vision)
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },

    // AI metadata (text + vision)
    aiMeta: {
      model: { type: String, default: "" },
      confidence: { type: Number, default: 0 },
    },

    // Duplicate handling
    mergedInto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
      default: null,
    },

    duplicateOfCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* =======================
   Indexes
======================= */
IncidentSchema.index({ location: "2dsphere" });
IncidentSchema.index({ createdAt: -1 });
IncidentSchema.index({ urgencyScore: -1 });
IncidentSchema.index({ category: 1 });

export default mongoose.model("Incident", IncidentSchema);
