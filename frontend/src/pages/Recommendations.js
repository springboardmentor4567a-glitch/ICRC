import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { calculateRiskProfile } from "../utils/riskProfile";

export default function Recommendations() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const risk = profile ? calculateRiskProfile(profile) : "";
  /* ---------------- FETCH PROFILE + POLICIES ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    Promise.all([
      fetch("http://127.0.0.1:8000/users/me/preferences", {
        headers: { token },
      }).then((r) => r.json()),

      fetch("http://127.0.0.1:8000/policies").then((r) => r.json()),
    ])
      .then(([profileData, policiesData]) => {
        setProfile(profileData);
        setPolicies(Array.isArray(policiesData) ? policiesData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <p style={{ color: "white", textAlign: "center", marginTop: "40px" }}>
        Loading recommendations...
      </p>
    );
  }

  /* ---------------- SAFETY CHECK ---------------- */
  if (!profile || policies.length === 0) {
    return (
      <p style={{ color: "white", textAlign: "center", marginTop: "40px" }}>
        No suitable policies found.
      </p>
    );
  }

  /* ---------------- CATEGORY MAPPING ---------------- */
  const categoryMap = {
    health: "health",
    life: "life",
  };

  const userCategory = categoryMap[
  (profile.policy_type || "").toLowerCase()
];


  /* ---------------- RECOMMENDATION LOGIC ---------------- */
 const matched = policies
  .filter((p) => {
    if (!p.category || !userCategory) return false;
    return p.category.toLowerCase() === userCategory;
  })
  .map((p) => {
    let score = 0;

    // -------- BASIC MATCHING --------
    if (profile.age <= 30) score += 2;
    if (!profile.smoker) score += 2;
    if (!profile.pre_existing_conditions) score += 1;

    // -------- RISK-BASED LOGIC --------
    if (risk === "Low Risk" && p.premium <= 10000) score += 3;

    if (risk === "Medium Risk" && p.premium <= 14000) score += 3;

    if (risk === "High Risk" && p.coverage?.includes("10")) score += 3;

    return { ...p, score };
  })
  .sort((a, b) => b.score - a.score);


  if (matched.length === 0) {
    return (
      <p style={{ color: "black", textAlign: "center", marginTop: "40px" }}>
        No suitable policies found.
      </p>
    );
  }

  const best = matched[0];
  const others = matched.slice(1, 6); // ✅ 5 other plans
  
  const getRiskBadge = (risk) => {
  if (risk === "Low Risk") return { text: "LOW RISK", color: "#22c55e" };
  if (risk === "Medium Risk") return { text: "MEDIUM RISK", color: "#facc15" };
  return { text: "HIGH RISK", color: "#ef4444" };
};

const riskBadge = getRiskBadge(risk);


  /* ---------------- UI ---------------- */
  return (
    <div style={{ color: "#1f2937", paddingTop: "40px", textAlign: "center" }}>
      <h1 style={{ color: "#6f06c6" }}>🎯 Recommended for You</h1>
      <p>Based on your profile</p>

      {/* ---- RISK BADGE ---- */}
<div
  style={{
    display: "inline-block",
    marginBottom: "20px",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "bold",
    background:
      risk === "High Risk"
        ? "#dc2626"
        : risk === "Medium Risk"
        ? "#facc15"
        : "#16a34a",
    color: "black",
  }}
>
  {risk}
</div>


      {/* ---------- BEST MATCH ---------- */}
      <div
  style={{
    width: "500px",
    margin: "10px auto",
    background: "linear-gradient(135deg, rgba(241, 242, 248, 0.95), rgba(255, 255, 255, 0.9))",
    padding: "20px",
    borderRadius: "20px",
    border: "1.5px solid #65507b",
    boxShadow: "0 20px 40px rgba(82, 52, 134, 0.42)",
    textAlign: "left",
    transition: "all 0.25s ease",
  }}
>

        <p style={{ color: "#90922f", fontWeight: "900" }}>⭐ BEST MATCH</p>
        <span
  style={{
  
    padding: "4px 10px",
    background: riskBadge.color,
    color: "#000",
    borderRadius: "20px",
    fontSize: "15px",
    fontWeight: "bold",
    marginBottom: "10px",
  }}
>
  {riskBadge.text}
</span>

        <h2>{best.name}</h2>
        <p style={{ color: "rgb(70, 211, 57)",fontSize: "20px",fontWeight:"bold" }}>₹{best.premium} / year</p>
        <p>{best.benefits || "Comprehensive coverage"}</p>

        <p style={{ fontSize: "16px", marginTop: "10px" }}>
          📌 Why? Age {profile.age},{" "}
          {profile.smoker ? "smoker" : "non-smoker"},{" "}
          {profile.annual_income} income
        </p>

        {/* UI only – no action */}
        <button
          style={{
            marginTop: "15px",
            width: "100%",
            padding: "12px",
            background: " linear-gradient(90deg, #6c63ff, #c77dff)",
            color: "black",
            border: "none",
            borderRadius: "10px",
            cursor:"pointer",
    
          }}
        >
          Select Plan
        </button>
      </div>
      {/* ---------- UPDATE PROFILE (LAST) ---------- */}
      <p
        style={{
          color: "#1f2937",
          marginTop: "50px",
          cursor: "pointer",
          fontWeight:"bold"
        }}
        onClick={() => navigate("/preferences")}
      >
       Not right? 💡 Update your profile
      </p>

      {/* ---------- OTHER PLANS ---------- */}
      {others.length > 0 && (
        <>
          <h3 style={{ marginTop: "40px", color: "#a014e7" }}>
            Other suitable plans
          </h3>

          <div
            style={{
              display:'flex',
              justifyContent: "center",
              gap: "30px",
              marginTop: "10px",
              flexWrap: "wrap",
            }}
          >
            {others.map((p) => (
              <div
                key={p.id}
                style={{
                  width: "260px",
                  background: "linear-gradient(135deg, #f8f0ff, #ffffff)",
                  border: "1px solid #e9d5ff",
                  transition: "all 0.25s ease",

                  padding: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 0 10px #bb7ae9ff",
                  textAlign: "left",
                }}
              >
                <h4>{p.name}</h4>
                <p style={{ color: "rgb(70, 243, 54)" }}>
                  ₹{p.premium} / year
                </p>

                {/* UI only */}
                <button
                  style={{
                    marginTop: "10px",
                    width: "100%",
                    padding: "8px",
                    background: " linear-gradient(90deg, #6c63ff, #c77dff)",
                    color: "#121113ff",
                    border: "1px solid #c77dff",
                    borderRadius: "6px",
                    cursor: "default",
                  }}
                >
                  View details
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
