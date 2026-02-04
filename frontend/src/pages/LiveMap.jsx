// frontend/src/pages/LiveMap.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { io } from "socket.io-client";
import { getPublicIncidents } from "../api";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function LiveMap() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [range, setRange] = useState("24h");
  const [alert, setAlert] = useState(null);

  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");

  // Center near Sac State (adjust if you want)
  const defaultCenter = useMemo(() => [-121.4241, 38.5617], []);

  // Init map (safe against StrictMode double mount)
  useEffect(() => {
    console.log("MAPBOX TOKEN loaded?", !!import.meta.env.VITE_MAPBOX_TOKEN);

    if (!import.meta.env.VITE_MAPBOX_TOKEN) {
      setError("Missing VITE_MAPBOX_TOKEN. Add it to frontend/.env and restart npm run dev.");
      return;
    }
    if (mapRef.current) return;
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: defaultCenter,
      zoom: 14,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      // cleanup
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [defaultCenter]);

  // Realtime alerts (Socket.io)
  useEffect(() => {
    // You can listen without token (broadcasts are public)
    const socket = io(import.meta.env.VITE_API_URL, { transports: ["websocket"] });

    socket.on("connect", () => {
      console.log("socket connected:", socket.id);
    });

    socket.on("campus_alert", (payload) => {
      setAlert(payload);
    });

    socket.on("connect_error", (err) => {
      console.warn("socket error:", err?.message || err);
    });

    return () => socket.disconnect();
  }, []);

  async function loadPins() {
    if (!mapRef.current) return;

    setLoading(true);
    setError("");

    try {
      const data = await getPublicIncidents(range);
      setCount(Array.isArray(data) ? data.length : 0);

      // remove old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (!Array.isArray(data) || data.length === 0) return;

      // add markers
      for (const item of data) {
        const coords = item?.location?.coordinates;
        if (!Array.isArray(coords) || coords.length !== 2) continue;

        const [lng, lat] = coords;

        const el = document.createElement("div");
        el.className = "w-3 h-3 rounded-full";
        el.style.boxShadow = "0 0 0 2px rgba(0,0,0,.35)";

        // urgency-based colors
        const score = Number(item.urgencyScore ?? 0);
        el.style.background =
          score >= 80 ? "#ef4444" : score >= 50 ? "#f59e0b" : "#22c55e";

        const popupHtml = `
          <div style="font-size:12px; line-height:1.3">
            <div><b>${item.category || "Unknown"}</b></div>
            <div>Urgency: ${score}</div>
            <div style="opacity:.7">${new Date(item.createdAt).toLocaleString()}</div>
          </div>
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup({ offset: 12 }).setHTML(popupHtml))
          .addTo(mapRef.current);

        markersRef.current.push(marker);
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to load incidents for the map.");
      setCount(0);
    } finally {
      setLoading(false);
    }
  }

  // Reload pins when range changes
  useEffect(() => {
    loadPins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Live Safety Map</h1>
            <p className="text-gray-300">
              Privacy-safe incident pins + real-time alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="rounded-xl bg-gray-900 border border-gray-800 px-3 py-2"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
            </select>

            <button
              onClick={loadPins}
              className="rounded-xl bg-white text-gray-900 font-semibold px-4 py-2 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Helpful status lines */}
        {!error && (
          <div className="text-sm text-gray-400">
            Showing <b className="text-gray-200">{count}</b> incidents for{" "}
            <b className="text-gray-200">{range}</b>.
          </div>
        )}

        {count === 0 && !loading && !error && (
          <div className="text-sm text-gray-400">
            No incidents found in this range yet. Submit a test report to see pins.
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 rounded-2xl p-4">
            {error}
          </div>
        )}

        {/* Realtime alert banner */}
        {alert && (
          <div className="border border-red-500/30 bg-red-500/10 text-red-100 rounded-2xl p-4 flex justify-between items-start gap-3">
            <div>
              <div className="font-bold">🚨 Campus Alert</div>
              <div className="mt-1">{alert.message}</div>
              {alert.area && (
                <div className="text-sm opacity-80 mt-1">Area: {alert.area}</div>
              )}
              <div className="text-xs opacity-70 mt-2">
                {new Date(alert.createdAt || Date.now()).toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => setAlert(null)}
              className="text-sm opacity-80 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Map */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
          {/* IMPORTANT: must have height */}
          <div ref={mapContainerRef} className="h-[650px] w-full" />
        </div>
      </div>
    </div>
  );
}
