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

  /* 🔹 Admin routes */
  const isAdminPage = location.pathname.startsWith("/admin");

  /* 🔹 Back button rules */
  const showBack =
    isAdminPage || location.pathname !== "/dashboard";

  const handleBack = () => {
    if (location.pathname === "/admin/dashboard") {
      navigate("/dashboard"); // 👈 admin → user dashboard
    } else {
      navigate(-1); // normal back
    }
  };

  return (
    <header className="app-header">
      {/* LEFT */}
      <div className="header-left">
        <div className="logo" onClick={() => navigate("/dashboard")}>
          ICRC
        </div>

        {showBack && (
          <button className="back-btn" onClick={handleBack}>
            ← Back
          </button>
        )}
      </div>

      {/* RIGHT */}
      <div className="header-right">
        {/* ADMIN ONLY */}
        {role === "admin" && (
          <button
            className="header-btn admin"
            onClick={() => navigate("/admin/dashboard")}
          >
            🧑‍💼 Admin Dashboard
          </button>
        )}

        <button
          className="header-btn profile"
          onClick={() => navigate("/profile")}
        >
          👤 Profile
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
