import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function Welcome() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");

  return (
    <div className="page-bg">
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h2 style={{ color: "white" }}>
          Insurance Comparison, Recommendation & Claim Assistant
        </h2>
      </div>

      <div className="form-card">
        <h2>Welcome, {userName}!</h2>

        <p style={{ marginBottom: "20px", color: "#555" }}>
          Access insurance tools like policy comparison, premium calculator,
          recommendations, and claim services.
        </p>

        {/* GO TO DASHBOARD BUTTON */}
        <button
          className="btn-main"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </button>

        {/* LOGOUT BUTTON */}
        <button
          className="btn-main"
          style={{ background: "red", marginTop: "15px" }}
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Welcome;
