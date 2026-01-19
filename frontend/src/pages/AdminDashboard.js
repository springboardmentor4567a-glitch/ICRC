import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="admin-container">
      <h1 className="admin-title">🧑‍💼 Admin Dashboard</h1>
      <p className="admin-subtitle">
        Monitor claims, detect fraud, and manage approvals
      </p>

      {/* SUMMARY CARDS */}
      <div className="admin-stats">
        <div className="stat-card purple">
          <h2>📄 Total Claims</h2>
          <p>View all submitted claims</p>
        </div>

        <div className="stat-card orange">
          <h2>⏳ Pending</h2>
          <p>Claims awaiting decision</p>
        </div>

        <div className="stat-card red">
          <h2>🚨 Fraud Flags</h2>
          <p>Suspicious claims detected</p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="admin-actions">
        <button
          className="admin-btn primary"
          onClick={() => navigate("/admin/claims")}
        >
          📋 Manage Claims
        </button>

        <button
          className="admin-btn danger"
          onClick={() => navigate("/admin/fraud")}
        >
          🚨 Fraud Detection
        </button>
      </div>
    </div>
  );
}
