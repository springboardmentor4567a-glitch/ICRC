import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { calculateRiskProfile } from "../utils/riskProfile";

function currency(value) {
  if (value === null || value === undefined) return "-";
  return "?" + Number(value).toLocaleString();
}

function matchPercent(score) {
  return Math.min(95, 65 + score * 5);
}

export default function Recommendations() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const risk = profile ? calculateRiskProfile(profile) : "";

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    Promise.all([
      fetch("http://127.0.0.1:8000/users/me/preferences", { headers: { token } }).then((r) => r.json()),
      fetch("http://127.0.0.1:8000/policies").then((r) => r.json()),
    ])
      .then(([profileData, policiesData]) => {
        setProfile(profileData);
        setPolicies(Array.isArray(policiesData) ? policiesData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  if (loading) return <p className="loading-state">Loading recommendations...</p>;
  if (!profile || policies.length === 0) return <p className="loading-state">No suitable policies found.</p>;

  const categoryMap = { health: "health", life: "life" };
  const userCategory = categoryMap[(profile.policy_type || "").toLowerCase()];

  const matched = policies
    .filter((p) => {
      if (!p.category || !userCategory) return false;
      return p.category.toLowerCase() === userCategory;
    })
    .map((p) => {
      let score = 0;
      if (profile.age <= 30) score += 2;
      if (!profile.smoker) score += 2;
      if (!profile.pre_existing_conditions) score += 1;
      if (risk === "Low Risk" && p.premium <= 10000) score += 3;
      if (risk === "Medium Risk" && p.premium <= 14000) score += 3;
      if (risk === "High Risk" && p.coverage?.includes("10")) score += 3;
      return { ...p, score };
    })
    .sort((a, b) => b.score - a.score);

  if (matched.length === 0) return <p className="loading-state">No suitable policies found.</p>;

  const best = matched[0];
  const others = matched.slice(1, 6);

  return (
    <div className="recommendation-page page-container">
      <div className="page-header-block">
        <span className="section-kicker">Policy Recommendations</span>
        <h2 className="page-title">Recommended for You</h2>
        <p className="page-desc">Based on your preferences, risk profile and selected insurance category.</p>
      </div>

      <section className="recommendation-summary">
        <div>
          <span className="reco-score">{matchPercent(best.score)}% Match</span>
          <h3>{best.name}</h3>
          <p>{best.benefits || "Comprehensive coverage for your profile."}</p>
        </div>
        <div className="reco-price">
          <span>Annual Premium</span>
          <strong>{currency(best.premium)}</strong>
          <button className="btn-purple" onClick={() => navigate(`/policy/${best.id}`)}>View Plan</button>
        </div>
      </section>

      <div className="reco-badge-row">
        <span className="reco-badge success">Recommended</span>
        <span className="reco-badge warning">Budget Friendly</span>
        <span className="reco-badge">Family Friendly</span>
        <span className="reco-badge success">Best Value</span>
        <span className="reco-badge">{risk}</span>
      </div>

      <button className="btn-outline update-profile-btn" onClick={() => navigate("/preferences")}>Update Preferences</button>

      {others.length > 0 && (
        <section className="other-recommendations">
          <h3>Other Suitable Plans</h3>
          <div className="reco-grid">
            {others.map((policy) => (
              <article className="reco-card" key={policy.id}>
                <div className="reco-card-head">
                  <span className="reco-score small">{matchPercent(policy.score)}% Match</span>
                  <span className="policy-badge">{policy.category}</span>
                </div>
                <h4>{policy.name}</h4>
                <p>{policy.benefits || "Suitable policy option based on your saved profile."}</p>
                <strong>{currency(policy.premium)} / year</strong>
                <button className="btn-outline full" onClick={() => navigate(`/policy/${policy.id}`)}>View Details</button>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}