// Report.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createIncident } from "../api";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function Report() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geoControlRef = useRef(null);

  // ✅ NEW: file input ref so we can fully reset it
  const fileInputRef = useRef(null);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [coords, setCoords] = useState(null); // [lng, lat]

  // image upload
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const defaultCenter = useMemo(() => [-121.4241, 38.5617], []);

  function setPin(picked, fly = false) {
    setCoords(picked);

    const map = mapRef.current;
    if (!map) return;

    if (markerRef.current) markerRef.current.remove();
    markerRef.current = new mapboxgl.Marker({ color: "#22c55e" }).setLngLat(picked).addTo(map);

    if (fly) {
      map.flyTo({ center: picked, zoom: Math.max(map.getZoom(), 15), essential: true });
    }
  }

  function clearPin() {
    setCoords(null);
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }

  function clearPhoto() {
    setPhoto(null);

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview("");

    // ✅ IMPORTANT: reset the actual file input value so the old file is gone
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  useEffect(() => {
    setError("");
    // eslint-disable-next-line no-console
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

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
      showUserHeading: true,
      showUserLocation: true,
    });

    geoControlRef.current = geolocate;
    map.addControl(geolocate, "top-right");

    map.on("click", (e) => {
      setResult(null);
      setError("");
      setPin([e.lngLat.lng, e.lngLat.lat], false);
    });

    geolocate.on("geolocate", (pos) => {
      const picked = [pos.coords.longitude, pos.coords.latitude];
      setResult(null);
      setError("");
      setPin(picked, true);
    });

    mapRef.current = map;

    return () => {
      try {
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        geoControlRef.current = null;
      } catch {
        // no-op
      }
    };
  }, [defaultCenter]);

  // cleanup preview url when component unmounts
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!description.trim()) return setError("Please enter a description.");
    if (!coords) return setError("Please click the map to drop a pin.");

    try {
      setLoading(true);

      const base = {
        description: description.trim(),
        category: category.trim() || undefined,
        location: { type: "Point", coordinates: coords },
      };

      // If photo exists -> send multipart FormData (backend expects field name "photo")
      let payloadToSend = base;

      if (photo) {
        const form = new FormData();
        form.append("description", base.description);
        if (base.category) form.append("category", base.category);
        form.append("location", JSON.stringify(base.location));
        form.append("photo", photo);
        payloadToSend = form;
      }

      const data = await createIncident(payloadToSend);
      setResult(data);

      // clear form (keep pin, clear photo)
      setDescription("");
      setCategory("");
      clearPhoto();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit report. Check backend is running and CORS is enabled.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const prettyCoords = coords ? `${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}` : "None";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 grid gap-6 lg:grid-cols-2">
        {/* Left: form */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Anonymous Safety Report</h1>
              <p className="text-gray-300 mt-1">
                Click the map to drop a pin (or use your location). Describe the incident. Optionally
                attach photo evidence for AI vision analysis.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setError("");
                setResult(null);
                clearPin();
              }}
              className="shrink-0 rounded-xl border border-gray-800 bg-gray-950 px-4 py-2 text-sm text-gray-200 hover:border-gray-600"
              title="Remove selected pin"
            >
              Clear Pin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-gray-300">Category (optional)</label>
              <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <select
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 p-3 outline-none focus:border-gray-600"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select a category…</option>
                  <option value="theft">Theft</option>
                  <option value="suspicious activity">Suspicious activity</option>
                  <option value="harassment">Harassment</option>
                  <option value="medical">Medical</option>
                  <option value="assault">Assault</option>
                  <option value="fire">Fire</option>
                  <option value="other">Other</option>
                </select>

                <input
                  className="w-full rounded-xl bg-gray-950 border border-gray-800 p-3 outline-none focus:border-gray-600"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Or type your own…"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-300">Description</label>
              <textarea
                className="mt-1 w-full rounded-xl bg-gray-950 border border-gray-800 p-3 outline-none focus:border-gray-600 min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What happened? Any details that help response?"
              />
              <div className="mt-1 text-xs text-gray-400">
                Tip: include time, direction, landmarks, and whether anyone needs immediate help.
              </div>
            </div>

            {/* Photo evidence */}
            <div>
              <label className="text-sm text-gray-300">Photo evidence (optional)</label>
              <div className="mt-1 rounded-xl border border-gray-800 bg-gray-950 p-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-200 file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-gray-900 file:font-semibold hover:file:opacity-90"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;

                    // revoke old preview before creating a new one
                    if (photoPreview) URL.revokeObjectURL(photoPreview);

                    setPhoto(file);
                    setPhotoPreview(file ? URL.createObjectURL(file) : "");
                  }}
                />

                {photoPreview && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        Attached: <span className="text-gray-200">{photo?.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={clearPhoto}
                        className="text-xs text-gray-300 hover:text-white"
                      >
                        Remove
                      </button>
                    </div>

                    <img
                      src={photoPreview}
                      alt="preview"
                      className="mt-2 w-full max-h-56 object-contain rounded-xl border border-gray-800"
                    />
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-400">
                  Supported: JPG/PNG/WEBP. Keep it clear (signs/screenshots work best for OCR).
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-gray-300">
                Pin selected: <span className="text-white">{prettyCoords}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setResult(null);
                  const ctrl = geoControlRef.current;
                  if (ctrl && typeof ctrl.trigger === "function") ctrl.trigger();
                  else setError("Geolocation not available here. Click the map to drop a pin.");
                }}
                className="rounded-xl border border-gray-800 bg-gray-950 px-4 py-2 text-sm text-gray-200 hover:border-gray-600"
              >
                Use My Location
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-3 rounded-xl">
                {error}
              </div>
            )}

            {result?.reportCode && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-200 p-3 rounded-xl space-y-1">
                <div>
                  Submitted ✅ Tracking code:{" "}
                  <span className="font-mono font-bold">{result.reportCode}</span>
                </div>

                {result.merged && <div>Duplicate detected → merged ✅</div>}

                {result.category && (
                  <div>
                    AI Category: <b>{result.category}</b>
                  </div>
                )}

                {typeof result.urgencyScore === "number" && (
                  <div>
                    Urgency Score: <b>{result.urgencyScore}</b>
                  </div>
                )}

                {Array.isArray(result.attachments) && result.attachments.length > 0 && (
                  <div className="pt-2 text-sm text-gray-200">
                    <div className="font-semibold">Image Analysis</div>
                    {result.attachments.map((a, idx) => (
                      <div key={idx} className="mt-1 text-gray-200">
                        {a.caption ? (
                          <div>
                            Caption: <span className="text-white">{a.caption}</span>
                          </div>
                        ) : null}
                        {Array.isArray(a.safetyTags) && a.safetyTags.length > 0 ? (
                          <div>
                            Safety Tags: <span className="text-white">{a.safetyTags.join(", ")}</span>
                          </div>
                        ) : null}
                        {a.ocrText ? (
                          <div className="text-gray-300">
                            OCR: <span className="text-white">{a.ocrText}</span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full rounded-xl bg-white text-gray-900 font-semibold py-3 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </div>

        {/* Right: map */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden relative">
          <div className="px-4 py-3 border-b border-gray-800">
            <div className="font-semibold">Select Location</div>
            <div className="text-sm text-gray-300">
              Click the map to drop a pin. Or press “Use My Location”.
            </div>
          </div>

          <div ref={mapContainerRef} className="h-[520px] w-full" />

          {loading && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
              <div className="rounded-xl border border-gray-800 bg-gray-950 px-4 py-2 text-sm text-gray-200">
                Submitting…
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
