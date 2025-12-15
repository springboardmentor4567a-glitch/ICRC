import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Welcome to Insurance Dashboard 🛡️</h1>
        <p>Manage, compare and calculate insurance plans easily</p>
      </div>

      {/* Cards */}
      <div className="dashboard-grid">
        <div className="dash-card" onClick={() => navigate("/plans")}>
          <span className="icon">📄</span>
          <h3>Insurance Plans</h3>
          <p>Browse available insurance policies and benefits</p>
        </div>

        <div className="dash-card" onClick={() => navigate("/recommend")}>
          <span className="icon">🤝</span>
          <h3>Recommendations</h3>
          <p>Get best policy suggestions based on your details</p>
        </div>

        <div className="dash-card" onClick={() => navigate("/claims")}>
          <span className="icon">📝</span>
          <h3>File Claim</h3>
          <p>Submit insurance claims and upload documents</p>
        </div>

        <div className="dash-card" onClick={() => navigate("/calculator")}>
          <span className="icon">💰</span>
          <h3>Premium Calculator</h3>
          <p>Estimate premium based on age & coverage</p>
        </div>
      </div>

      {/* Logout */}
      <button className="logout-btn" onClick={() => navigate("/")}>
        Logout
      </button>
    </div>
  );
}
