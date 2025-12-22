import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Header from "../components/Header";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      {/* Header WITHOUT logout */}
      <Header />

      <div className="dashboard-container" style={{ paddingTop: "80px" }}>
        {/* Title */}
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

          <div className="dash-card" onClick={() => navigate("/preferences")}>
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

        {/* Logout Button – EXACT position like image */}
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <button
            onClick={handleLogout}
            style={{
              background: "#ff4d4f",
              color: "white",
              border: "none",
              padding: "12px 28px",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
