import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/myClaims.css";

export default function MyClaims() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/claims/")
      .then((res) => setClaims(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="myclaims-container">
      {/* 🔙 BACK BUTTON */}
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
          zIndex: 1000,
        }}
      >
        ← Back
      </button>

      <h2>📊 My Claims</h2>

      {claims.length === 0 ? (
        <p>No claims found</p>
      ) : (
        <div className="claims-list">
          {claims.map((claim) => (
            <div className="claim-card" key={claim.id}>
              <div className="claim-row">
                <span>
                  <strong>Claim ID:</strong> {claim.id}
                </span>
                <span className={`status ${claim.status.toLowerCase()}`}>
                  {claim.status}
                </span>
              </div>

              <div className="claim-row">
                <span>
                  <strong>Policy ID:</strong> {claim.policy_id}
                </span>
                <span>
                  <strong>Amount:</strong> ₹{claim.claim_amount}
                </span>
              </div>

              <div className="claim-row">
                <span>
                  <strong>Date:</strong>{" "}
                  {new Date(claim.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
