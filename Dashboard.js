import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-wrapper">
     {/* LOGOUT BUTTON */}
    <button
      onClick={() => {
        if (window.confirm("Logout successfully?")) {
          navigate("/login");
        }
      }}
      style={{
        width: "auto",                // ⭐ prevents stretching
    maxWidth: "fit-content",      // ⭐ key line
    display: "inline-flex",       // ⭐ not full-width
    alignItems: "center",
        position: "absolute",
        top: "20px",
        right: "30px",
        padding: "6px 14px",
        fontSize: "13px",
        borderRadius: "16px",
        border: "none",
        background: "#ef4444",
        color: "#fff",
         whiteSpace: "nowrap", 
        cursor: "pointer",
      }}
    >
      Logout
    </button>


      {/* HERO SECTION */}
      <div className="dashboard-hero">
        <h1>
          Welcome to <span>ICRCA</span>
        </h1>
        <p>Insurance Comparison, Recommendation & Claim Assistant</p>
        <p>
          Your smart insurance assistant to explore policies, calculate premiums
          and compare plans effortlessly.
        </p>
      </div>

      {/* FEATURE CARDS */}
      <div className="dashboard-cards">
        
        {/* Insurance Policies */}
        <div
          className="dashboard-card"
          onClick={() => navigate("/policies")}
        >
          <div className="icon blue">📄</div>
          <h3>Insurance Policies</h3>
          <p>
            Browse detailed insurance plans with coverage, benefits and pricing.
          </p>
          <button>View Policies</button>
        </div>

        {/* Premium Calculator */}
        <div
          className="dashboard-card"
          onClick={() => navigate("/calculator")}
        >
          <div className="icon purple">🧮</div>
          <h3>Premium Calculator</h3>
          <p>
            Instantly calculate insurance premium based on your personal details.
          </p>
          <button>Calculate Premium</button>
        </div>

        {/* Compare Policies */}
        <div
          className="dashboard-card"
          onClick={() => navigate("/compare")}
        >
          <div className="icon green">📊</div>
          <h3>Compare Policies</h3>
          <p>
            Compare two insurance policies side by side and choose the best one.
          </p>
          <button>Compare Now</button>
        </div>

        {/* Recommendation */}
        <div
          className="dashboard-card"
          onClick={() => navigate("/recommendations")}
        >
          <div className="icon orange">⭐</div>
          <h3>Policy Recommendations</h3>
          <p>
            Get personalized insurance recommendations based on your profile and
            preferences.
          </p>
          <button>Get Recommendations</button>
        </div>
           {/* File a Claim */}
<div
  className="dashboard-card"
  onClick={() => navigate("/file-claim")}
>
  <div className="icon red">📤</div>
  <h3>File a Claim</h3>
  <p>
    Submit insurance claims, upload documents, and track claim status easily.
  </p>
  <button>File Claim</button>
</div>
   <div
  className="dashboard-card"
  onClick={() => navigate("/my-claims")}
>
  <div className="icon teal">📁</div>
  <h3>My Claims</h3>
  <p>Track your submitted insurance claims and their status.</p>
  <button>View Claims</button>
</div>


      </div>
    </div>
  );
}

