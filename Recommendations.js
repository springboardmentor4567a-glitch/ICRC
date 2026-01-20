import React, { useState } from "react";
import "../styles/Recommendations.css";
import { useNavigate } from "react-router-dom";

const Recommendations = () => {
  const navigate = useNavigate();

  const [age, setAge] = useState("");
  const [salary, setSalary] = useState("");
  const [policyType, setPolicyType] = useState("");
  const [duration, setDuration] = useState("");
  const [showResults, setShowResults] = useState(false);

  // ✅ FIX: Added smoker status state
  const [smokerStatus, setSmokerStatus] = useState("");

  const policies = [
    { name: "Health Secure Plus", coverage: "₹5,00,000", premium: "₹7,800 / year", risk: "Low Risk", type: "Health" },
    { name: "Life Shield Plan", coverage: "₹10,00,000", premium: "₹9,500 / year", risk: "Moderate Risk", type: "Life" },
    { name: "Family Health Pro", coverage: "₹8,00,000", premium: "₹11,200 / year", risk: "Low Risk", type: "Health" },
    { name: "Senior Secure Care", coverage: "₹6,00,000", premium: "₹12,000 / year", risk: "High Risk", type: "Health" },
    { name: "Premium Protect", coverage: "₹15,00,000", premium: "₹18,500 / year", risk: "Moderate Risk", type: "Life" },
    { name: "Young Shield", coverage: "₹3,00,000", premium: "₹4,200 / year", risk: "Low Risk", type: "Health" },
    { name: "Smart Saver Plan", coverage: "₹7,00,000", premium: "₹8,900 / year", risk: "Moderate Risk", type: "Life" },
    { name: "Elite Health Max", coverage: "₹20,00,000", premium: "₹21,000 / year", risk: "Low Risk", type: "Health" },
    { name: "Budget Care", coverage: "₹4,00,000", premium: "₹6,500 / year", risk: "Moderate Risk", type: "Health" },
    { name: "Long Term Life Secure", coverage: "₹25,00,000", premium: "₹23,800 / year", risk: "Low Risk", type: "Life" }
  ];

  const handleRecommend = () => {
    if (!age || !salary || !policyType || !duration) {
      alert("Please fill all fields");
      return;
    }

    // ✅ smoker status is now available
    console.log("Smoking Status:", smokerStatus);

    setShowResults(true);
  };

  return (
    <div className="recommendation-page">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "6px 12px",
          fontSize: "13px",
          borderRadius: "18px",
          border: "none",
          background: "#34d399",
          color: "#fff",
          cursor: "pointer",
          width: "auto",
          maxWidth: "fit-content",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          whiteSpace: "nowrap",
        }}
      >
        ← Back
      </button>

      <h1 className="recommendation-title">Policy Recommendations</h1>
      <p className="recommendation-subtitle">
        Get insurance plans tailored to your preferences
      </p>

      <div className="preference-card">
        <h2>Your Preferences</h2>

        <div className="preference-grid">
          <div>
            <label>Age</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>

          <div>
            <label>Annual / Monthly Salary (₹)</label>
            <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} />
          </div>

          <div>
            <label>Policy Type</label>
            <select value={policyType} onChange={(e) => setPolicyType(e.target.value)}>
              <option value="">Select</option>
              <option>Health</option>
              <option>Life</option>
            </select>
          </div>

          <div>
            <label>Policy Duration (Years)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
        </div>

        {/* ✅ FIXED SMOKER STATUS */}
        <label style={{ fontWeight: "600", marginBottom: "6px", display: "block" }}>
          Smoking Status
        </label>

        <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="radio"
              name="smokerStatus"
              value="Non-Smoker"
              checked={smokerStatus === "Non-Smoker"}
              onChange={(e) => setSmokerStatus(e.target.value)}
              style={{ width: "16px", height: "16px" }}
            />
            Non-Smoker
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="radio"
              name="smokerStatus"
              value="Smoker"
              checked={smokerStatus === "Smoker"}
              onChange={(e) => setSmokerStatus(e.target.value)}
              style={{ width: "16px", height: "16px" }}
            />
            Smoker
          </label>
        </div>

        <button className="recommend-btn" onClick={handleRecommend}>
          Get Recommendations
        </button>
      </div>

      {showResults && (
        <>
          <h2 className="result-heading">Recommended Policies</h2>
          <div className="recommendation-list">
            {policies
              .filter((p) => p.type === policyType)
              .map((policy, index) => (
                <div className="recommendation-card" key={index}>
                  <h3>{policy.name}</h3>
                  <p><strong>Coverage:</strong> {policy.coverage}</p>
                  <p><strong>Premium:</strong> {policy.premium}</p>
                  <p>
                    <strong>Risk:</strong>{" "}
                    <span className={`risk ${policy.risk.replace(" ", "-")}`}>
                      {policy.risk}
                    </span>
                  </p>
                  <button className="details-btn">View Details</button>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Recommendations;
