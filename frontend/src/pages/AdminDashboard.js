import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ totalClaims: null, pendingClaims: null, fraudFlags: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    Promise.all([
      fetch("http://127.0.0.1:8000/claims", {
        headers: { Authorization: `Bearer ${token}`, token: token }
      }).then(res => res.ok ? res.json() : null),
      fetch("http://127.0.0.1:8000/admin/fraud-flags", {
        headers: { Authorization: `Bearer ${token}`, token: token }
      }).then(res => res.ok ? res.json() : null)
    ]).then(([claims, fraudFlags]) => {
      const totalClaims = claims ? claims.length : null;
      const pendingClaims = claims ? claims.filter(c => c.status === "pending" || c.status === "submitted").length : null;
      const totalFraud = fraudFlags ? fraudFlags.length : null;

      setMetrics({ totalClaims, pendingClaims, fraudFlags: totalFraud });
    }).catch(err => {
      console.error("Error fetching admin metrics:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const formatVal = (val) => (val === null || val === undefined ? "—" : val);

  return (
    <div className="admin-dashboard-page">
      <div className="admin-header-block">
        <span className="admin-kicker">Operations Control</span>
        <h1 className="admin-title">Admin Operations Portal</h1>
        <p className="admin-subtitle">
          Monitor claims, detect fraud, and manage approvals
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="admin-stats-grid">
        <div 
          className="stat-card purple clickable" 
          onClick={() => navigate("/admin/claims")}
          tabIndex="0"
          role="button"
          onKeyDown={(e) => e.key === "Enter" && navigate("/admin/claims")}
        >
          <div className="card-header-row">
            <h2>Total Claims</h2>
            <span className="card-arrow">&rarr;</span>
          </div>
          <p className="stat-value">{loading ? <span className="admin-inline-spinner"/> : formatVal(metrics.totalClaims)}</p>
          <span className="stat-action-text">View all submitted claims</span>
        </div>

        <div 
          className="stat-card orange clickable" 
          onClick={() => navigate("/admin/claims?status=pending")}
          tabIndex="0"
          role="button"
          onKeyDown={(e) => e.key === "Enter" && navigate("/admin/claims?status=pending")}
        >
          <div className="card-header-row">
            <h2>Pending</h2>
            <span className="card-arrow">&rarr;</span>
          </div>
          <p className="stat-value">{loading ? <span className="admin-inline-spinner"/> : formatVal(metrics.pendingClaims)}</p>
          <span className="stat-action-text">Claims awaiting decision</span>
        </div>

        <div 
          className="stat-card red clickable" 
          onClick={() => navigate("/admin/fraud")}
          tabIndex="0"
          role="button"
          onKeyDown={(e) => e.key === "Enter" && navigate("/admin/fraud")}
        >
          <div className="card-header-row">
            <h2>Fraud Flags</h2>
            <span className="card-arrow">&rarr;</span>
          </div>
          <p className="stat-value">{loading ? <span className="admin-inline-spinner"/> : formatVal(metrics.fraudFlags)}</p>
          <span className="stat-action-text">Suspicious claims detected</span>
        </div>
      </div>

      {/* ACTION SECTION */}
      <div className="admin-quick-actions">
        <h3 className="actions-section-title">Administrative Actions</h3>
        <div className="admin-actions-row">
          <button
            className="admin-btn-action primary-btn"
            onClick={() => navigate("/admin/claims")}
          >
            📋 Manage Claims
          </button>

          <button
            className="admin-btn-action danger-btn"
            onClick={() => navigate("/admin/fraud")}
          >
            🚨 Fraud Detection
          </button>
        </div>
      </div>
    </div>
  );
}
