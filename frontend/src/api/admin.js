const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function getToken() {
  return localStorage.getItem("adminToken");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`);
  return data;
}

export function adminLogin(email, password) {
  return request("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function adminLogout() {
  localStorage.removeItem("adminToken");
}

export function adminGetStats() {
  return request("/api/admin/stats"); // you can implement this backend
}

export function adminGetIncidents(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`/api/admin/incidents${qs ? `?${qs}` : ""}`);
}

export function adminGetIncidentById(id) {
  return request(`/api/admin/incidents/${id}`);
}

export function adminUpdateIncident(id, updates) {
  return request(`/api/admin/incidents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
}

export function adminCreateAlert(payload) {
  return request("/api/alerts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
