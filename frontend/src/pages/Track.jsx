import { useState } from "react";
import { trackIncident } from "../api";

export default function Track() {
  const [code, setCode] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTrack(e) {
    e.preventDefault();
    setError("");
    setData(null);

    if (!code.trim()) {
      setError("Enter your report code.");
      return;
    }

    try {
      setLoading(true);
      const res = await trackIncident(code.trim());
      setData(res);
    } catch (err) {
      setError(err?.message || "No report found with that code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <h1 className="text-2xl font-bold">Track Report Status</h1>
          <p className="text-gray-300 mt-1">
            Paste your tracking code from the report submission.
          </p>

          <form onSubmit={handleTrack} className="mt-6 flex gap-2">
            <input
              className="flex-1 rounded-xl bg-gray-950 border border-gray-800 p-3 outline-none focus:border-gray-600 font-mono"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. AbC9X2KpQw"
            />
            <button
              className="rounded-xl bg-white text-gray-900 font-semibold px-5 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "..." : "Track"}
            </button>
          </form>

          {!error && !data && (
            <div className="mt-4 text-gray-400 text-sm">
              Nothing loaded yet — enter a code and click Track.
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-200 p-3 rounded-xl">
              {error}
            </div>
          )}

          {data && (
            <div className="mt-5 bg-gray-950 border border-gray-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className="font-semibold">{data.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Priority</span>
                <span className="font-semibold">{data.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Category</span>
                <span className="font-semibold">{data.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Urgency</span>
                <span className="font-semibold">{data.urgencyScore}</span>
              </div>

              <div className="text-xs text-gray-500 pt-2">
                Submitted: {new Date(data.createdAt).toLocaleString()}
              </div>

              {data.adminNotes && (
                <div className="pt-2 text-sm text-gray-300">
                  <span className="text-gray-400">Admin notes:</span> {data.adminNotes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
