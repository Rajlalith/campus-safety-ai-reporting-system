import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  Search,
  MapPinned,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-950/40 p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white text-gray-900 flex items-center justify-center">
          <Icon size={18} />
        </div>
        <div className="font-bold">{title}</div>
      </div>
      <div className="text-sm text-gray-300 mt-3">{desc}</div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* HERO SECTION */}
      <div className="rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-950/60 via-gray-950/30 to-gray-900/60 p-8 md:p-10">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Sparkles size={16} />
          AI-powered campus safety platform
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold mt-3 leading-tight">
          Report incidents anonymously.
          <br />
          Keep your campus safer — together.
        </h1>

        <p className="text-gray-300 mt-4 max-w-2xl">
          Campus Safety AI allows students to anonymously report safety incidents
          with a map pin and description. Reports are prioritized using AI so
          campus authorities can respond faster, while students stay informed
          through a privacy-safe live map.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => navigate("/report")}
            className="rounded-2xl bg-white text-gray-900 font-semibold px-6 py-3 flex items-center gap-2"
          >
            Report an Incident <ArrowRight size={18} />
          </button>

          <button
            onClick={() => navigate("/live-map")}
            className="rounded-2xl border border-gray-700 text-gray-200 font-semibold px-6 py-3 hover:bg-gray-900"
          >
            View Live Map
          </button>

          <button
            onClick={() => navigate("/track")}
            className="rounded-2xl border border-gray-700 text-gray-200 font-semibold px-6 py-3 hover:bg-gray-900"
          >
            Track My Report
          </button>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-800 bg-gray-950/40 p-5">
          <div className="text-xs text-gray-400">Step 1</div>
          <div className="font-bold mt-1">Submit a report</div>
          <div className="text-sm text-gray-300 mt-2">
            Drop a pin on the map and describe what happened. No login required.
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-950/40 p-5">
          <div className="text-xs text-gray-400">Step 2</div>
          <div className="font-bold mt-1">AI prioritization</div>
          <div className="text-sm text-gray-300 mt-2">
            AI categorizes the incident and assigns an urgency score for faster
            review.
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-950/40 p-5">
          <div className="text-xs text-gray-400">Step 3</div>
          <div className="font-bold mt-1">Stay informed</div>
          <div className="text-sm text-gray-300 mt-2">
            Track your report status and view privacy-safe campus activity.
          </div>
        </div>
      </div>

      {/* FEATURE GRID */}
      <div className="grid md:grid-cols-4 gap-4">
        <Feature
          icon={ClipboardCheck}
          title="Anonymous reporting"
          desc="No account required. Your identity is never stored."
        />
        <Feature
          icon={ShieldCheck}
          title="Privacy-safe design"
          desc="Public map never shows personal details or descriptions."
        />
        <Feature
          icon={Search}
          title="Track status"
          desc="Use your report code to check progress anytime."
        />
        <Feature
          icon={MapPinned}
          title="Live safety map"
          desc="See recent incidents and real-time alerts across campus."
        />
      </div>

      {/* FOOTER NOTE */}
      <div className="text-xs text-gray-500 pt-4">
        ⚠️ If there is immediate danger, contact campus police or emergency services.
      </div>
    </div>
  );
}

