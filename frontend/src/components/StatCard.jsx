export default function StatCard({ label, value, sub }) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sub ? <div className="text-xs text-gray-500 mt-1">{sub}</div> : null}
    </div>
  );
}
