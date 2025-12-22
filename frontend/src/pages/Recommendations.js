import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Recommendations() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

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

      if (profile.age <= 30) score += 2;
      if (!profile.smoker) score += 2;
      if (profile.annual_income === "1-3L" && p.premium <= 9000) score += 2;
      if (!profile.pre_existing_conditions) score += 1;

      return { ...p, score };
    })
    .sort((a, b) => b.score - a.score);

  if (matched.length === 0) {
    return (
      <p style={{ color: "white", textAlign: "center", marginTop: "40px" }}>
        No suitable policies found.
      </p>
    );
  }

  const best = matched[0];
  const others = matched.slice(1, 6); // ✅ 5 other plans

  /* ---------------- UI ---------------- */
  return (
    <div style={{ color: "white", paddingTop: "40px", textAlign: "center" }}>
      <h1 style={{ color: "#9d4edd" }}>🎯 Recommended for You</h1>
      <p>Based on your profile</p>

      {/* ---------- BEST MATCH ---------- */}
      <div
        style={{
          width: "420px",
          margin: "30px auto",
          background: "#1e1e2f",
          padding: "25px",
          borderRadius: "14px",
          boxShadow: "0 0 20px #6a0dad",
          textAlign: "left",
        }}
      >
        <p style={{ color: "#facc15", fontWeight: "bold" }}>⭐ BEST MATCH</p>
        <h2>{best.name}</h2>
        <p style={{ color: "#a6e3a1" }}>₹{best.premium} / year</p>
        <p>{best.benefits || "Comprehensive coverage"}</p>

        <p style={{ fontSize: "14px", marginTop: "10px" }}>
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
            background: "#7b2cbf",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "default",
          }}
        >
          Select Plan
        </button>
      </div>
      {/* ---------- UPDATE PROFILE (LAST) ---------- */}
      <p
        style={{
          color: "white",
          marginTop: "50px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/preferences")}
      >
       Not right? 💡 Update your profile
      </p>

      {/* ---------- OTHER PLANS ---------- */}
      {others.length > 0 && (
        <>
          <h3 style={{ marginTop: "40px", color: "#c77dff" }}>
            Other suitable plans
          </h3>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            {others.map((p) => (
              <div
                key={p.id}
                style={{
                  width: "260px",
                  background: "#1e1e2f",
                  padding: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 0 10px #6a0dad",
                  textAlign: "left",
                }}
              >
                <h4>{p.name}</h4>
                <p style={{ color: "#a6e3a1" }}>
                  ₹{p.premium} / year
                </p>

                {/* UI only */}
                <button
                  style={{
                    marginTop: "10px",
                    width: "100%",
                    padding: "8px",
                    background: "transparent",
                    color: "#c77dff",
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
