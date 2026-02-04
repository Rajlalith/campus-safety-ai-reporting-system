import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { adminGetIncidentById, adminUpdateIncident } from "../api/admin";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function AdminIncidentDetail() {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [status, setStatus] = useState("received");
  const [priority, setPriority] = useState("low");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    const data = await adminGetIncidentById(id);
    setIncident(data);
    setStatus(data.status || "received");
    setPriority(data.priority || "low");
    setAdminNotes(data.adminNotes || "");
  }

  useEffect(() => {
    load().catch((e) => setMsg(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function save() {
    setMsg("");
    try {
      setSaving(true);
      const updated = await adminUpdateIncident(id, { status, priority, adminNotes });
      setIncident(updated);
      setMsg("✅ Saved");
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (!incident) {
    return (
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <div className="text-gray-300">Loading… {msg ? `(${msg})` : ""}</div>
      </div>
    );
  }

  const attachments = incident.attachments || [];

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-gray-400">Report Code</div>
            <div className="text-xl font-bold font-mono">{incident.reportCode}</div>
            <div className="text-sm text-gray-400 mt-1">
              Created: {incident.createdAt ? new Date(incident.createdAt).toLocaleString() : "-"}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-400">AI Category</div>
            <div className="font-semibold">{incident.category || "Other"}</div>
            <div className="text-sm text-gray-400 mt-1">
              Urgency: <span className="text-white font-semibold">{incident.urgencyScore ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-400">Description</div>
          <div className="mt-1 text-gray-200 whitespace-pre-wrap">{incident.description}</div>
        </div>

        {incident.adminSummary ? (
          <div className="mt-4 bg-gray-950 border border-gray-800 rounded-2xl p-4">
            <div className="text-sm text-gray-400">AI Admin Summary</div>
            <div className="mt-1 text-gray-200 whitespace-pre-wrap">{incident.adminSummary}</div>
          </div>
        ) : null}
      </div>

      {/* Attachments */}
      {attachments.length > 0 ? (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <div className="font-semibold">Attachments</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {attachments.map((a, idx) => (
              <div key={idx} className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                <a
                  href={`${API_URL}${a.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white underline"
                >
                  Open image
                </a>
                {a.caption ? <div className="text-sm text-gray-200 mt-2">Caption: {a.caption}</div> : null}
                {a.ocrText ? <div className="text-sm text-gray-300 mt-2">OCR: {a.ocrText}</div> : null}
                {Array.isArray(a.safetyTags) && a.safetyTags.length > 0 ? (
                  <div className="text-sm text-gray-300 mt-2">
                    Tags: {a.safetyTags.map((t) => t.label).filter(Boolean).join(", ")}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Updates */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div className="font-semibold">Review & Update</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm text-gray-400">Status</label>
            <select
              className="mt-1 w-full rounded-xl bg-gray-950 border border-gray-800 p-3 outline-none focus:border-gray-600"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="received">received</option>
              <option value="reviewing">reviewing</option>
              <option value="resolved">resolved</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400">Priority</label>
            <select
              className="mt-1 w-full rounded-xl bg-gray-950 border border-gray-800 p-3 outline-none focus:border-gray-600"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400">Admin Notes</label>
          <textarea
            className="mt-1 w-full rounded-xl bg-gray-950 border border-gray-800 p-3 outline-none focus:border-gray-600 min-h-[120px]"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Internal notes for follow-up…"
          />
        </div>

        {msg ? <div className="text-sm text-gray-200">{msg}</div> : null}

        <button
          disabled={saving}
          onClick={save}
          className="w-full rounded-xl bg-white text-gray-900 font-semibold py-3 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Updates"}
        </button>
      </div>
    </div>
  );
}
