// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import fs from "fs";
import { Server } from "socket.io";

import connectDB from "./src/config/db.js";
import incidentsRoutes from "./src/routes/incidents.js";
import adminRoutes from "./src/routes/admin.js";
import alertsRoutes from "./src/routes/alerts.js";
import { notFound, errorHandler } from "./src/middleware/error.js";

dotenv.config();

const app = express();

/* =======================
   Config
======================= */
const PORT = process.env.PORT || 5001;
const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN || "http://localhost:5173"; // set in backend/.env for prod

/* =======================
   Middleware
======================= */
app.use(
  cors({
    origin: [CLIENT_ORIGIN, "http://127.0.0.1:5173"],
    credentials: true,
  })
);

// Increase if you ever send large base64 payloads; files should be multipart
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =======================
   Static Files (Uploads)
======================= */
const uploadsDir = path.join(process.cwd(), "src/uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

/* =======================
   Health Check
======================= */
app.get("/", (req, res) => res.send("Campus Safety API running ✅"));
app.get("/health", (req, res) => res.json({ ok: true }));

/* =======================
   HTTP + Socket.IO
======================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [CLIENT_ORIGIN, "http://127.0.0.1:5173"],
    credentials: true,
  },
});

// allow routes/controllers to emit events
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  // Optional: join rooms if you later add auth/admin rooms
  // socket.on("join", (room) => socket.join(room));

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

/* =======================
   Routes
======================= */
app.use("/api/incidents", incidentsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/alerts", alertsRoutes);

/* =======================
   Error Handling
======================= */
app.use(notFound);
app.use(errorHandler);

/* =======================
   Server Startup
======================= */
async function start() {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`🌐 CORS allowed origin: ${CLIENT_ORIGIN}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
}

start();
