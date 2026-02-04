// frontend/src/api.js
import { getToken } from "./auth";

const API = import.meta.env.VITE_API_URL;

/**
 * Low-level request helper
 */
async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, options);

  // Try to return helpful error text
  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try {
      const text = await res.text();
      if (text) msg = text;
    } catch {}
    throw new Error(msg);
  }

  // Some endpoints might return empty
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

/* =========================
   PUBLIC (Students)
   ========================= */

/**
 * POST /api/incidents
 * Submit anonymous report
 */
export function createIncident(payload) {
  return request("/api/incidents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/**
 * GET /api/incidents/track/:reportCode
 * Track report status (no login)
 */
export function trackIncident(reportCode) {
  return request(`/api/incidents/track/${encodeURIComponent(reportCode)}`);
}

/**
 * GET /api/incidents/public?range=24h|7d
 * Privacy-safe map data (no login)
 */
export function getPublicIncidents(range = "24h") {
  return request(`/api/incidents/public?range=${encodeURIComponent(range)}`);
}

/* =========================
   ADMIN (JWT protected)
   ========================= */

/**
 * POST /api/admin/login
 * Returns { token }
 */
export function adminLogin(email, password) {
  return request("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

/**
 * POST /api/admin/seed
 * Create a demo admin (dev only)
 */
export function adminSeed(email = "admin@test.com", password = "Admin123!") {
  return request("/api/admin/seed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

/**
 * GET /api/admin/incidents
 * Admin: list incidents
 */
export function adminGetIncidents() {
  const token = getToken();
  return request("/api/admin/incidents", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * PATCH /api/admin/incidents/:id
 * Admin: update status/priority/adminNotes, etc.
 */
export function adminUpdateIncident(id, patch) {
  const token = getToken();
  return request(`/api/admin/incidents/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(patch),
  });
}

/**
 * POST /api/alerts
 * Admin: broadcast a real-time alert (Socket.io emits to students)
 * Payload example: { message, area, level }
 */
export function adminSendAlert(payload) {
  const token = getToken();
  return request("/api/alerts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}
