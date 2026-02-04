// src/App.jsx
import { Route, Routes, Navigate } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/Home";
import Report from "./pages/Report";
import Track from "./pages/Track";
import LiveMap from "./pages/LiveMap";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAlerts from "./pages/AdminAlerts";

import AdminRoute from "./components/AdminRoute.jsx";
import AlertsBanner from "./components/AlertsBanner.jsx";

export default function App() {
  return (
    <>
      {/* 🔔 Global real-time alerts (Socket.io) */}
      <AlertsBanner />

      <Routes>
        {/* ======================
            PUBLIC APP
        ====================== */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<Report />} />
          <Route path="/track" element={<Track />} />
          <Route path="/live-map" element={<LiveMap />} />
        </Route>

        {/* ======================
            ADMIN LOGIN
        ====================== */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ======================
            ADMIN APP (Protected)
        ====================== */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          {/* if someone goes to /admin, send them to dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="alerts" element={<AdminAlerts />} />
        </Route>

        {/* ======================
            FALLBACK
        ====================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
