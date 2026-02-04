import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function AdminAlerts() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function sendAlert(e) {
    e.preventDefault();
    setStatus("");

    if (!title.trim()) return setStatus("Title required");
    if (!message.trim()) return setStatus("Message required");

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, severity }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to send alert");

      setStatus("✅ Sent! Everyone online will see it instantly.");
      setTitle("");
      setMessage("");
      setSeverity("info");
    } catch (err) {
      setStatus(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">Admin: Send Alert</h1>
        <p className="text-gray-300 mt-1">This broadcasts a real-time notification via Socket.io.</p>

        <form onSubmit={sendAlert} className="mt-6 space-y-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <div>
            <label className="text-sm text-gray-300">Title</label>
            <input
              className="mt-1 w-full rounded-xl bg-gray-950 border border-gray-800 p-3 outline-none focus:border-gray-600"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Emergency / Warning / Info…"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Message</label>
            <textarea
              className="mt-1 w-full rounded-xl bg-gray-950 border border-gray-800 p-3 outline-none focus:border-gray-600 min-h-[120px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What should students do?"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">Severity</label>
            <select
              className="mt-1 w-full rounded-xl bg-gray-950 border border-gray-800 p-3 outline-none focus:border-gray-600"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {status && (
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-3 text-sm text-gray-200">
              {status}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-white text-gray-900 font-semibold py-3 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Alert"}
          </button>
        </form>
      </div>
    </div>
  );
}
