// AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin, adminSeed } from "../api";
import { setToken, isLoggedIn } from "../auth";

export default function AdminLogin() {
  const nav = useNavigate();

  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  if (isLoggedIn()) {
    nav("/admin/dashboard");
  }

  async function handleSeed() {
    setError("");
    try {
      setLoading(true);
      await adminSeed(email.trim(), password);
      alert("Demo admin created ✅ You can now log in.");
    } catch (err) {
      alert("Seed failed (admin may already exist). Try logging in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await adminLogin(email.trim(), password);

      if (!res?.token) {
        throw new Error("Invalid login response");
      }

      setToken(res.token);
      nav("/admin/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Login failed. Seed demo admin first or check credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <p className="text-gray-300 mt-1">
          Login to review incidents and send campus alerts.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-3">
          <input
            className="w-full rounded-xl bg-gray-950 border border-gray-800 p-3 outline-none focus:border-gray-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin Email"
            autoComplete="email"
          />

          <input
            className="w-full rounded-xl bg-gray-950 border border-gray-800 p-3 outline-none focus:border-gray-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            autoComplete="current-password"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-white text-gray-900 font-semibold py-3 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            onClick={handleSeed}
            disabled={loading}
            className="w-full rounded-xl border border-gray-700 text-gray-200 font-semibold py-3 hover:bg-gray-900 disabled:opacity-60"
          >
            Seed Demo Admin
          </button>
        </form>
      </div>
    </div>
  );
}
