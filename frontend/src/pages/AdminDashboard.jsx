// AdminDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminGetIncidents, adminSendAlert, adminUpdateIncident } from "../api";
import { clearToken } from "../auth";
import { socket } from "../socket";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function AdminDashboard() {
  const nav = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  // alert modal fields
  const [alertMsg, setAlertMsg] = useState("");
  const [alertArea, setAlertArea] = useState("");
  const [sendingAlert, setSendingAlert] = useState(false);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [savingPatch, setSavingPatch] = useState(false);

  async function load() {
    try {
      setErr("");
      setLoading(true);

      const data = await adminGetIncidents();
      setIncidents(Array.isArray(data) ? data : data?.items || []);

      // refresh selected incident from latest list
      if (selected?._id) {
        const refreshed = (Array.isArray(data) ? data : data?.items || []).find(
          (x) => x._id === selected._id
        );
        if (refreshed) setSelected(refreshed);
      }
    } catch (e) {
      setErr("Failed to load incidents. You may be logged out.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  // ✅ Real-time updates (if backend emits these events)
  useEffect(() => {
    const onNew = () => load();
    const onMerged = () => load();
    const onUpdated = () => load();

    socket.on("incident:new", onNew);
    socket.on("incident:merged", onMerged);
    socket.on("incident:updated", onUpdated);

    return () => {
      socket.off("incident:new", onNew);
      socket.off("incident:merged", onMerged);
      socket.off("incident:updated", onUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?._id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return incidents;
    return incidents.filter((x) =>
      `${x.reportCode || ""} ${x.category || ""} ${x.status || ""} ${x.priority || ""} ${
        x.description || ""
      }`
        .toLowerCase()
        .includes(q)
    );
  }, [incidents, query]);

  async function patchSelected(patch) {
    if (!selected) return;

    // optimistic update
    const prevSelected = selected;
    const nextSelected = { ...selected, ...patch };
    setSelected(nextSelected);
    setIncidents((prev) => prev.map((x) => (x._id === selected._id ? { ...x, ...patch } : x)));

    try {
      setSavingPatch(true);
      const updated = await adminUpdateIncident(selected._id, patch);

      setSelected(updated);
      setIncidents((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
    } catch (e) {
      // rollback
      setSelected(prevSelected);
      setIncidents((prev) => prev.map((x) => (x._id === prevSelected._id ? prevSelected : x)));

      const msg = e?.message || "Failed to update incident";
      setErr(msg);

      // if backend says unauthorized, force logout
      if (String(msg).toLowerCase().includes("unauthorized")) {
        clearToken();
        nav("/admin/login");
      }
    } finally {
      setSavingPatch(false);
    }
  }

  async function saveNotes() {
    if (!selected) return;
    await patchSelected({ adminNotes: selected.adminNotes || "" });
  }

  async function sendAlert() {
    if (!alertMsg.trim()) return;
    try {
      setSendingAlert(true);
      await adminSendAlert({
        message: alertMsg.trim(),
        area: alertArea.trim(),
        level: "warning",
      });
      setAlertMsg("");
      setAlertArea("");
      alert("Alert sent ✅");
    } catch (e) {
      setErr(e?.message || "Failed to send alert");
    } finally {
      setSendingAlert(false);
    }
  }

  function logout() {
    clearToken();
    nav("/admin/login");
  }

  const selectedAttachments = selected?.attachments || [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-300">Review incidents, update status/priority, send alerts.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={load}
              className="rounded-xl bg-white text-gray-900 font-semibold px-4 py-2"
            >
              Refresh
            </button>
            <button
              onClick={logout}
              className="rounded-xl border border-gray-700 px-4 py-2 hover:bg-gray-900"
            >
              Logout
            </button>
          </div>
        </div>

        {err && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-3 rounded-xl">
            {err}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {/* LEFT: table */}
          <div className="lg:col-span-2 bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reportCode/category/status/priority/description..."
              className="w-full rounded-xl bg-gray-950 border border-gray-800 p-3 outline-none focus:border-gray-600"
            />

            <div className="mt-4 overflow-auto max-h-[520px] border border-gray-800 rounded-2xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-950 sticky top-0">
                  <tr className="text-left text-gray-300">
                    <th className="p-3">Category</th>
                    <th className="p-3">Urgency</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Time</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td className="p-3 text-gray-400" colSpan={5}>
                        Loading...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td className="p-3 text-gray-400" colSpan={5}>
                        No incidents found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((x) => (
                      <tr
                        key={x._id}
                        onClick={() => setSelected(x)}
                        className={`border-t border-gray-800 cursor-pointer hover:bg-gray-900 ${
                          selected?._id === x._id ? "bg-gray-900" : ""
                        }`}
                      >
                        <td className="p-3">
                          <div className="font-medium">{x.category || "Other"}</div>
                          <div className="text-xs text-gray-500 font-mono">{x.reportCode}</div>
                        </td>
                        <td className="p-3">{x.urgencyScore ?? 0}</td>
                        <td className="p-3">{x.status || "received"}</td>
                        <td className="p-3">{x.priority || "low"}</td>
                        <td className="p-3">{x.createdAt ? new Date(x.createdAt).toLocaleString() : "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: alert + selected */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 space-y-4">
            {/* Alerts */}
            <div>
              <div className="font-semibold">Broadcast Alert</div>
              <input
                value={alertArea}
                onChange={(e) => setAlertArea(e.target.value)}
                className="mt-2 w-full rounded-xl bg-gray-950 border border-gray-800 p-3 outline-none focus:border-gray-600"
                placeholder="Area (optional) e.g., Library"
              />
              <textarea
                value={alertMsg}
                onChange={(e) => setAlertMsg(e.target.value)}
                className="mt-2 w-full rounded-xl bg-gray-950 border border-gray-800 p-3 min-h-[90px] outline-none focus:border-gray-600"
                placeholder="Alert message..."
              />
              <button
                onClick={sendAlert}
                disabled={sendingAlert}
                className="mt-2 w-full rounded-xl bg-white text-gray-900 font-semibold py-3 disabled:opacity-60"
              >
                {sendingAlert ? "Sending..." : "Send Alert"}
              </button>
            </div>

            {/* Selected Incident */}
            <div className="border-t border-gray-800 pt-4">
              <div className="font-semibold">Selected Incident</div>

              {!selected ? (
                <div className="text-gray-400 text-sm mt-2">Click an incident in the table.</div>
              ) : (
                <div className="mt-2 space-y-3 text-sm">
                  <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 space-y-2">
                    <div className="text-xs text-gray-500 font-mono">Report: {selected.reportCode}</div>

                    <div className="text-gray-300">
                      <b>AI Summary:</b> {selected.adminSummary || "—"}
                    </div>

                    <div className="text-gray-400 whitespace-pre-wrap">{selected.description}</div>
                  </div>

                  {/* ✅ Attachments preview */}
                  {Array.isArray(selectedAttachments) && selectedAttachments.length > 0 && (
                    <div className="bg-gray-950 border border-gray-800 rounded-xl p-3">
                      <div className="text-xs text-gray-400 mb-2">Attachments</div>

                      <div className="grid gap-3">
                        {selectedAttachments.map((a, idx) => (
                          <div key={idx} className="border border-gray-800 rounded-xl p-3">
                            <a
                              href={`${API_URL}${a.url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-white underline text-xs"
                            >
                              Open image
                            </a>

                            {a.caption ? (
                              <div className="mt-2 text-gray-200 text-xs">
                                <b>Caption:</b> {a.caption}
                              </div>
                            ) : null}

                            {Array.isArray(a.safetyTags) && a.safetyTags.length > 0 ? (
                              <div className="mt-2 text-gray-300 text-xs">
                                <b>Tags:</b>{" "}
                                {a.safetyTags
                                  .map((t) => t?.label)
                                  .filter(Boolean)
                                  .join(", ")}
                              </div>
                            ) : null}

                            <img
                              src={`${API_URL}${a.url}`}
                              alt={`attachment-${idx}`}
                              className="mt-2 w-full max-h-44 object-contain rounded-lg border border-gray-800"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Status</div>
                      <select
                        value={selected.status}
                        onChange={async (e) => {
                          const status = e.target.value;
                          setSelected((s) => ({ ...s, status }));
                          await patchSelected({ status });
                        }}
                        disabled={savingPatch}
                        className="w-full rounded-xl bg-gray-950 border border-gray-800 p-2"
                      >
                        <option value="received">received</option>
                        <option value="reviewing">reviewing</option>
                        <option value="resolved">resolved</option>
                      </select>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400 mb-1">Priority</div>
                      <select
                        value={selected.priority}
                        onChange={async (e) => {
                          const priority = e.target.value;
                          setSelected((s) => ({ ...s, priority }));
                          await patchSelected({ priority });
                        }}
                        disabled={savingPatch}
                        className="w-full rounded-xl bg-gray-950 border border-gray-800 p-2"
                      >
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 mb-1">Admin Notes (visible in Track page)</div>
                    <textarea
                      value={selected.adminNotes || ""}
                      onChange={(e) => setSelected((s) => ({ ...s, adminNotes: e.target.value }))}
                      className="w-full rounded-xl bg-gray-950 border border-gray-800 p-3 min-h-[90px]"
                      placeholder="Add notes..."
                    />
                    <button
                      onClick={saveNotes}
                      disabled={savingPatch}
                      className="mt-2 w-full rounded-xl border border-gray-700 py-2 hover:bg-gray-900 disabled:opacity-60"
                    >
                      {savingPatch ? "Saving..." : "Save Notes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
