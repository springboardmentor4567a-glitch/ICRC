import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "./authContext";
import { useNavigate } from "react-router-dom";
import "./risk-profile.css";

export default function RiskProfile() {
  const { logout, isAdmin, user, recommend, getPolicies } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({
    maxPrice: 5000,
    minCoverage: 0,
    riskTolerance: "medium",
    preferredProviders: "",
    age: 30,
    smoker: false,
    conditions: "",
    category: "",
  });
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const userKey = user?.email ? `prefs_${user.email}` : "prefs_anonymous";

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(userKey) || "null");
    if (saved) {
      // Convert arrays back to strings for form inputs
      const normalizedPrefs = {
        ...saved,
        preferredProviders: Array.isArray(saved.preferredProviders) ? saved.preferredProviders.join(", ") : saved.preferredProviders || "",
        conditions: Array.isArray(saved.conditions) ? saved.conditions.join(", ") : saved.conditions || "",
      };
      setPrefs(normalizedPrefs);
    }
  }, []);

  const calculateRiskLevel = () => {
    let riskScore = 0;

    // Age factor
    if (prefs.age > 50) riskScore += 2;
    else if (prefs.age > 35) riskScore += 1;

    // Smoking factor
    if (prefs.smoker) riskScore += 3;

    // Conditions factor
    const conditions = prefs.conditions.split(",").map(s => s.trim()).filter(Boolean);
    riskScore += conditions.length * 2;

    // Risk tolerance adjustment
    if (prefs.riskTolerance === "high") riskScore -= 1;
    else if (prefs.riskTolerance === "low") riskScore += 1;

    if (riskScore <= 2) return "low";
    if (riskScore <= 5) return "medium";
    return "high";
  };

  // Helper function to get coverage value
  const getCoverageValue = (coverage) => {
    if (typeof coverage === 'number' && !isNaN(coverage)) return coverage;
    if (typeof coverage === 'string') {
      const parsed = parseFloat(coverage.replace(/[^\d.]/g, ''));
      return !isNaN(parsed) ? parsed : 0;
    }
    if (typeof coverage === 'object' && coverage) {
      const values = Object.values(coverage).filter(v => typeof v === 'number' && !isNaN(v));
      return values.length > 0 ? Math.max(...values) : 0;
    }
    return 0;
  };

  // Helper function to get numeric value from various formats
  const getNumericValue = (value, defaultValue = 0) => {
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^\d.]/g, ''));
      return !isNaN(parsed) ? parsed : defaultValue;
    }
    return defaultValue;
  };

  // Calculate smart recommendations based on user data
  const calculateRecommendations = () => {
    const userData = {
      age: prefs.age?.toString() || '',
      riskTolerance: prefs.riskTolerance || '',
      smokingStatus: prefs.smoker ? 'smoker' : 'non-smoker',
      monthlyBudget: prefs.maxPrice?.toString() || '',
      coverageNeeded: prefs.minCoverage?.toString() || ''
    };

    const allPolicies = getPolicies();
    console.log('All policies from getPolicies():', allPolicies);
    console.log('User data:', userData);

    // Scoring algorithm based on user profile
    const scoredPolicies = allPolicies.map(policy => {
      let score = 0;
      let reasoning = [];
      const coverageValue = getCoverageValue(policy.coverage);
      const ratingValue = getNumericValue(policy.rating, 0);

      // Age-based scoring
      const age = parseInt(userData.age);
      if (age) {
        if (age < 30 && policy.category === 'Life') score += 3;
        if (age >= 30 && age < 50 && policy.category === 'Health') score += 3;
        if (age >= 50 && coverageValue >= 1000000) score += 2;
        reasoning.push(`Age ${age}: ${age < 30 ? 'Life insurance prioritized' : age < 50 ? 'Health insurance prioritized' : 'Higher coverage recommended'}`);
      }

      // Risk tolerance scoring
      if (userData.riskTolerance === 'low') {
        if (ratingValue >= 4.5) score += 3;
        score += ratingValue * 0.5;
        reasoning.push('Low risk tolerance: High-rated policies prioritized');
      } else if (userData.riskTolerance === 'medium') {
        if (ratingValue >= 4.0) score += 2;
        score += ratingValue * 0.3;
        reasoning.push('Medium risk tolerance: Balanced approach');
      } else if (userData.riskTolerance === 'high') {
        score += ratingValue * 0.2;
        if (getNumericValue(policy.priceBase, 0) < 3000) score += 1;
        reasoning.push('High risk tolerance: Cost-effective options prioritized');
      }

      // Smoking status scoring
      if (userData.smokingStatus === 'smoker') {
        if (policy.category === 'Health' && coverageValue >= 1000000) score += 2;
        reasoning.push('Smoker: Higher health coverage recommended');
      } else if (userData.smokingStatus === 'non-smoker') {
        score += 1; // General preference for non-smokers
        reasoning.push('Non-smoker: Standard rates apply');
      }

      // Budget consideration
      const budget = parseInt(userData.monthlyBudget);
      if (budget) {
        if (getNumericValue(policy.priceBase, 0) <= budget) score += 2;
        else if (getNumericValue(policy.priceBase, 0) <= budget * 1.5) score += 1;
        reasoning.push(`Budget ₹${budget}: ${getNumericValue(policy.priceBase, 0) <= budget ? 'Within budget' : 'Above budget'}`);
      }

      // Coverage needed
      const coverage = parseInt(userData.coverageNeeded);
      if (coverage) {
        if (coverageValue >= coverage) score += 3;
        else if (coverageValue >= coverage * 0.8) score += 2;
        reasoning.push(`Coverage needed ₹${coverage}: ${coverageValue >= coverage ? 'Meets requirement' : 'Below requirement'}`);
      }

      // Base scoring
      score += ratingValue;
      score += Math.min(3, coverageValue / 500000);
      score += policy.features.length * 0.5;

      return {
        ...policy,
        score: isNaN(score) ? 0 : Math.round(score * 10) / 10,
        reasoning: reasoning.slice(0, 3) // Limit to top 3 reasons
      };
    });

    // Sort by score and return top recommendations
    return scoredPolicies
      .sort((a, b) => b.score - a.score)
      .slice(0, 6); // Top 6 recommendations
  };

  const getSmartRecommendations = (e) => {
    e?.preventDefault();
    const obj = {
      ...prefs,
      preferredProviders: (prefs.preferredProviders || "").split(",").map((s) => s.trim()).filter(Boolean),
      conditions: (prefs.conditions || "").split(",").map((s) => s.trim()).filter(Boolean),
    };
    localStorage.setItem(userKey, JSON.stringify(obj));

    // Calculate and show recommendations in side-by-side view
    const recs = calculateRecommendations();
    setRecommendations(recs);
    setShowRecommendations(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Render stars for rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star"}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="page-wrap">
      <header className="page-header">
        <h2>Risk Profile Assessment</h2>
        <div>
          <button onClick={() => window.history.back()}>Back</button>
          <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        </div>
      </header>

      {!showRecommendations ? (
        <div className="risk-profile-container">
          <div className="risk-profile-intro">
            <h3>Assess Your Insurance Risk Profile</h3>
            <p>
              Fill out your details to get personalized insurance recommendations and understand your risk level
            </p>
          </div>

          <form className="prefs-form" onSubmit={getSmartRecommendations}>
            <div className="form-grid">
              <div className="form-group">
                <label>Max Monthly Price:</label>
                <input type="number" value={prefs.maxPrice} onChange={(e) => setPrefs({ ...prefs, maxPrice: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Minimum Coverage:</label>
                <input type="number" value={prefs.minCoverage} onChange={(e) => setPrefs({ ...prefs, minCoverage: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Risk Tolerance:</label>
                <select value={prefs.riskTolerance} onChange={(e) => setPrefs({ ...prefs, riskTolerance: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Age:</label>
                <input type="number" value={prefs.age} onChange={(e) => setPrefs({ ...prefs, age: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Smoker:</label>
                <select value={prefs.smoker ? "yes" : "no"} onChange={(e) => setPrefs({ ...prefs, smoker: e.target.value === "yes" })}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label>Pre-existing Conditions (comma separated):</label>
                <input type="text" value={prefs.conditions} onChange={(e) => setPrefs({ ...prefs, conditions: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Preferred Providers (comma separated):</label>
                <input type="text" value={prefs.preferredProviders} onChange={(e) => setPrefs({ ...prefs, preferredProviders: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category:</label>
                <select value={prefs.category} onChange={(e) => setPrefs({ ...prefs, category: e.target.value })}>
                  <option value="">Any</option>
                  <option value="Health">Health</option>
                  <option value="Auto">Auto</option>
                  <option value="Life">Life</option>
                </select>
              </div>
            </div>

            <div className="form-submit">
              <button type="submit">Get Smart Recommendations</button>
            </div>
          </form>
        </div>
      ) : (
        /* Side-by-Side View: Risk Profile + Recommendations */
        <div className="side-by-side-container">
          {/* Left Panel: Risk Profile Summary */}
          <div className="risk-profile-section">
            <div className="risk-profile-header">
              <h3>Your Risk Profile</h3>
              <button className="edit-profile-btn" onClick={() => setShowRecommendations(false)}>
                Edit Profile
              </button>
            </div>

            <div className="risk-assessment">
              <div className={`risk-indicator risk-${calculateRiskLevel()}`}>
                {calculateRiskLevel().toUpperCase()} RISK PROFILE
              </div>

              <div className="risk-factors">
                <div className="risk-factor">
                  <span className="factor-label">Age Factor:</span>
                  <span className="factor-value">
                    {prefs.age > 50 ? 'High Risk' : prefs.age > 35 ? 'Medium Risk' : 'Low Risk'}
                  </span>
                </div>

                <div className="risk-factor">
                  <span className="factor-label">Smoking Status:</span>
                  <span className="factor-value">
                    {prefs.smoker ? 'High Risk' : 'Low Risk'}
                  </span>
                </div>

                <div className="risk-factor">
                  <span className="factor-label">Health Conditions:</span>
                  <span className="factor-value">
                    {prefs.conditions.split(",").map(s => s.trim()).filter(Boolean).length > 0 ? 'Present' : 'None'}
                  </span>
                </div>

                <div className="risk-factor">
                  <span className="factor-label">Risk Tolerance:</span>
                  <span className="factor-value">{prefs.riskTolerance}</span>
                </div>
              </div>
            </div>

            <div className="profile-summary">
              <h4>Profile Summary</h4>
              <div className="summary-details">
                <div className="summary-item">
                  <span className="summary-label">Monthly Budget:</span>
                  <span className="summary-value">₹{prefs.maxPrice?.toLocaleString() || '0'}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Coverage Needed:</span>
                  <span className="summary-value">₹{prefs.minCoverage?.toLocaleString() || '0'}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Preferred Category:</span>
                  <span className="summary-value">{prefs.category || 'Any'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Smart Recommendations */}
          <div className="recommendations-section">
            <div className="recommendations-header">
              <h3>🎯 Smart Recommendations</h3>
              <p>Based on your profile, here are the best insurance options</p>
            </div>

            <div className="recommendations-grid">
              {recommendations.map((policy, index) => (
                <div key={policy.id} className="recommendation-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="card-header">
                    <div className="policy-icon">
                      {policy.category === 'Health' ? '🏥' :
                       policy.category === 'Auto' ? '🚗' :
                       policy.category === 'Life' ? '💼' :
                       policy.category === 'Property' ? '🏠' :
                       policy.category === 'Travel' ? '✈️' : '📋'}
                    </div>
                    <div className="card-title">
                      <h4>{policy.name}</h4>
                      <div className="policy-category">{policy.category}</div>
                    </div>
                    <div className="score-badge">
                      <span className="score-value">{policy.score}</span>
                      <span className="score-label">Match Score</span>
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="policy-details">
                      <div className="detail-row">
                        <span className="detail-icon">🏢</span>
                        <span className="detail-text">{policy.provider}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-icon">🛡️</span>
                        <span className="detail-text">₹{(() => {
                          if (typeof policy.coverage === 'number') return policy.coverage.toLocaleString();
                          if (typeof policy.coverage === 'object' && policy.coverage) {
                            const values = Object.values(policy.coverage).filter(v => typeof v === 'number' && !isNaN(v));
                            if (values.length > 0) return Math.max(...values).toLocaleString();
                          }
                          return '0';
                        })()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-icon">💰</span>
                        <span className="detail-text">₹{((typeof policy.priceBase === 'number' && !isNaN(policy.priceBase)) ? policy.priceBase : 0).toLocaleString()}/month</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-icon">⭐</span>
                        <div className="detail-stars">{renderStars(policy.rating)}</div>
                      </div>
                    </div>

                    <div className="reasoning-section">
                      <h4>Why this matches you:</h4>
                      <ul className="reasoning-list">
                        {policy.reasoning.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="action-btn primary"
                      onClick={() => navigate(`/calculator/${policy.id}`)}
                    >
                      Calculate Premium
                    </button>
                    <button
                      className="action-btn secondary"
                      onClick={() => navigate(`/policies/${policy.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
