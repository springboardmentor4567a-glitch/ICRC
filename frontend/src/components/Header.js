import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isAdminDashboard = location.pathname === "/admin/dashboard";
  const isUserDashboard = location.pathname === "/dashboard";

  const showBack = role === "admin"
    ? (location.pathname.startsWith("/admin") && !isAdminDashboard)
    : (location.pathname !== "/dashboard");

  const handleBack = () => {
    if (role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo" onClick={() => navigate(role === "admin" ? "/admin/dashboard" : "/dashboard")}>
          ICRC
        </div>

        {showBack && (
          <button className="back-btn" onClick={handleBack}>
            ← Back
          </button>
        )}
      </div>

      <div className="header-right">
        {role === "admin" && (
          <button
            className="header-btn admin"
            onClick={() => navigate("/admin/dashboard")}
          >
            Admin Dashboard
          </button>
        )}

        <button
          className="header-btn profile"
          onClick={() => navigate("/profile")}
        >
          Profile
        </button>

        <button
          className="header-btn logout"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}