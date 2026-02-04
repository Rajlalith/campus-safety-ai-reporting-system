import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../auth";

export default function AdminRoute({ children }) {
  try {
    if (!isLoggedIn()) {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  } catch {
    // safety fallback
    return <Navigate to="/admin/login" replace />;
  }
}
