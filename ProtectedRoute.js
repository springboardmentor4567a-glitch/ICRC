import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // 🔐 Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🔐 Role mismatch (user trying admin or vice versa)
  if (role && userRole !== role) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Authorized
  return children;
}


