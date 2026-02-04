import { NavLink, Outlet } from "react-router-dom";
import { Home, ClipboardCheck, Search, MapPinned, ShieldAlert } from "lucide-react";

function SideLink({ to, icon: Icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition border
         ${
           isActive
             ? "bg-white text-gray-900 border-white"
             : "bg-gray-950/40 text-gray-200 border-gray-800 hover:bg-gray-900"
         }`
      }
    >
      <Icon size={18} />
      <span className="font-semibold">{label}</span>
    </NavLink>
  );
}

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          {/* Sidebar (PUBLIC ONLY) */}
          <aside className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 h-fit lg:sticky lg:top-5">
            <div className="flex items-center gap-3 px-2 pb-4">
              <div className="w-10 h-10 rounded-xl bg-white text-gray-900 flex items-center justify-center font-extrabold">
                CS
              </div>
              <div>
                <div className="font-bold leading-tight">Campus Safety AI</div>
                <div className="text-xs text-gray-400">Anonymous • Fast • Real-time</div>
              </div>
            </div>

            <div className="space-y-2">
              <SideLink to="/" end icon={Home} label="Home" />
              <SideLink to="/report" icon={ClipboardCheck} label="Report Incident" />
              <SideLink to="/track" icon={Search} label="Track Status" />
              <SideLink to="/live-map" icon={MapPinned} label="Live Safety Map" />
            </div>

            <div className="mt-5 p-4 rounded-2xl border border-gray-800 bg-gray-950/50">
              <div className="flex items-start gap-3">
                <ShieldAlert className="text-gray-200" size={20} />
                <div>
                  <div className="font-semibold">Privacy-first</div>
                  <div className="text-sm text-gray-400 mt-1">
                    Reports are anonymous. Live map is privacy-safe (no descriptions shown).
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 px-2">
              If there is immediate danger, call campus police/emergency services.
            </div>
          </aside>

          {/* Main content */}
          <main className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
