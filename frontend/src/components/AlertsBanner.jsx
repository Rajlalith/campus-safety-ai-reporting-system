import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function AlertsBanner() {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const onNew = (a) => setAlert(a);
    const onDeactivate = (payload) => {
      if (alert?._id === payload._id) setAlert(null);
    };

    socket.on("alert:new", onNew);
    socket.on("alert:deactivated", onDeactivate);

    return () => {
      socket.off("alert:new", onNew);
      socket.off("alert:deactivated", onDeactivate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert?._id]);

  if (!alert) return null;

  const severityStyle =
    alert.severity === "critical"
      ? "border-red-500/40 bg-red-500/10 text-red-100"
      : alert.severity === "warning"
      ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-100"
      : "border-blue-500/40 bg-blue-500/10 text-blue-100";

  return (
    <div className={`mx-auto max-w-6xl mt-4 px-4`}>
      <div className={`rounded-2xl border p-4 ${severityStyle}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-bold">{alert.title}</div>
            <div className="text-sm opacity-90 mt-1">{alert.message}</div>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="rounded-lg border border-white/20 px-3 py-1 text-sm"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
