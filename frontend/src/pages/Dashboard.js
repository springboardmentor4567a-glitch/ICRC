import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Sparkles,
  ClipboardCheck,
  Calculator,
} from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-hero">
  <h1>Insurance Control Center</h1>
  <p>
    Access your policies, claims, and recommendations from one secure dashboard
  </p>
</div>


      {/* Cards */}
      <div className="dashboard-grid">
        <div
          className="dashboard-card"
          onClick={() => navigate("/plans")}
        >
          <div className="card-icon">
            <FileText size={28} />
          </div>
          <h3 className="card-title">Insurance Plans</h3>
          <p className="card-desc">
            Browse and compare available insurance policies
          </p>
          <button className="card-btn">Go →</button>

        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/preferences")}
        >
          <div className="card-icon">
            <Sparkles size={28} />
          </div>
          <h3 className="card-title">Recommendations</h3>
          <p className="card-desc">
            Get personalized policy suggestions based on your profile
          </p>
         <button className="card-btn">Go →</button>

        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/claims")}
        >
          <div className="card-icon">
            <ClipboardCheck size={28} />
          </div>
          <h3 className="card-title">File Claim</h3>
          <p className="card-desc">
            Submit insurance claims and upload documents securely
          </p>
         <button className="card-btn">Go →</button>

        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/calculator")}
        >
          <div className="card-icon">
            <Calculator size={28} />
          </div>
          <h3 className="card-title">Premium Calculator</h3>
          <p className="card-desc">
            Estimate premium based on age, risk, and coverage
          </p>
          <button className="card-btn">Go →</button>

        </div>
      </div>
    </div>
  );
}
