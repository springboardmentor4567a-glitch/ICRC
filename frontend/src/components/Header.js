import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import GoBackButton from "./GoBackButton";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === "/dashboard";

  return (
    <header className="app-header">
      {/* LEFT */}
      <div className="header-left">
        <span className="logo-text">ICRC</span>
      </div>

      {/* CENTER (empty for now) */}
      <div className="header-center"></div>

      {/* RIGHT */}
      <div className="header-right">
        {!isDashboard && <GoBackButton />}
      </div>
    </header>
  );
}
