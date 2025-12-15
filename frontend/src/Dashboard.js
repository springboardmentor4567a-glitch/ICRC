import React from "react";
import "./styles.css";

function Dashboard() {
  const userName = localStorage.getItem("userName");

  return (
    <div className="dashboard-container">
      <h2 className="title">Insurance Platform</h2>
      <p className="welcome-text">Welcome back, {userName}!</p>

      <div className="card-container">
        <div className="card">Policy Comparison</div>
        <div className="card">Premium Calculator</div>
        <div className="card">Get Recommendations</div>
        <div className="card">File a Claim</div>
        <div className="card">Track Claim</div>
      </div>

      <button
        className="logout-btn"
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
