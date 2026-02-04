import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut } from "lucide-react";
import { clearToken } from "../auth";

export default function AdminLayout() {
  const nav = useNavigate();

  function logout() {
    clearToken();
    nav("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-gray-900 flex items-center justify-center font-extrabold">
              CS
            </div>
            <div>
              <div className="font-bold">Campus Safety AI — Admin</div>
              <div className="text-xs text-gray-400">Review • Prioritize • Alert</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl border flex items-center gap-2 font-semibold ${
                  isActive
                    ? "bg-white text-gray-900 border-white"
                    : "border-gray-800 hover:bg-gray-900"
                }`
              }
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl border border-gray-800 hover:bg-gray-900 flex items-center gap-2 font-semibold"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        <div className="mt-4 bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

