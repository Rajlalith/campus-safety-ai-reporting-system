import { Link } from "react-router-dom";

function pill(score) {
  if (score >= 75) return "bg-red-500/10 border-red-500/30 text-red-200";
  if (score >= 40) return "bg-yellow-500/10 border-yellow-500/30 text-yellow-200";
  return "bg-green-500/10 border-green-500/30 text-green-200";
}

export default function IncidentTable({ incidents = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-gray-400">
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 pr-4">Created</th>
            <th className="text-left py-3 pr-4">Category</th>
            <th className="text-left py-3 pr-4">Urgency</th>
            <th className="text-left py-3 pr-4">Status</th>
            <th className="text-left py-3 pr-4">Report</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((i) => (
            <tr key={i._id} className="border-b border-gray-900 hover:bg-gray-950/40">
              <td className="py-3 pr-4 text-gray-300">
                {i.createdAt ? new Date(i.createdAt).toLocaleString() : "-"}
              </td>
              <td className="py-3 pr-4">{i.category || "Other"}</td>
              <td className="py-3 pr-4">
                <span className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1 ${pill(i.urgencyScore || 0)}`}>
                  {i.urgencyScore ?? 0}
                </span>
              </td>
              <td className="py-3 pr-4 text-gray-300">{i.status || "received"}</td>
              <td className="py-3 pr-4">
                <Link className="text-white underline" to={`/admin/incidents/${i._id}`}>
                  Open
                </Link>
              </td>
            </tr>
          ))}
          {incidents.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-6 text-gray-500">
                No incidents found.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
