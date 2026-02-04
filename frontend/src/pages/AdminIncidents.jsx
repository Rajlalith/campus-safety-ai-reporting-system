import { useEffect, useState } from "react";
import IncidentTable from "../components/IncidentTable";
import { adminGetIncidents } from "../api/admin";

export default function AdminIncidents() {
  const [status, setStatus] = useState("");
  const [minUrgency, setMinUrgency] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      setLoading(true);
      const data = await adminGetIncidents({
        status: status || undefined,
        q: q || undefined,
        minUrgency: minUrgency || undefined,
        limit: 100,
        sort: "createdAt:desc",
      });
      setIncidents(data?.items || data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Incidents</h1>
        <p className="text-gray-300 mt-1">Filter, triage, and open incidents for review.</p>
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            className="rounded-xl bg-gray-950 border border-gray-800 p-3 outline-none focus:border-gray-600"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="received">received</option>
            <option value="reviewing">reviewing</option>
            <option value="resolved">resolved</option>
          </select>

          <input
            className="rounded-xl bg-gray-950 border border-gray-800 p-3 outline-none focus:border-gray-600"
            value={minUrgency}
            onChange={(e) => setMinUrgency(e.target.value)}
            placeholder="Min urgency (e.g. 50)"
          />

          <input
            className="rounded-xl bg-gray-950 border border-gray-800 p-3 outline-none focus:border-gray-600"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search (description/reportCode)"
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="rounded-xl bg-white text-gray-900 font-semibold px-4 py-2 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Apply"}
          </button>
          {error ? <div className="text-sm text-red-200">{error}</div> : null}
        </div>

        <div className="mt-4">
          <IncidentTable incidents={incidents} />
        </div>
      </div>
    </div>
  );
}
