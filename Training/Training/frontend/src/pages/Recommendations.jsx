import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Recommendations() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    policy_type: "Health",
    age: 30,
    budget: 500,
    coverage_needs: [],
    risk_tolerance: "Medium",
    priority: "balanced",
    dependents: 0,
    location_risk: "normal"
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const coverageOptions = {
    Health: [
      "Hospitalization",
      "Pre-existing conditions",
      "Maternity coverage",
      "Cashless treatment",
      "Wellness benefits"
    ],
    Auto: [
      "Zero depreciation",
      "Roadside assistance",
      "Engine protection",
      "Personal accident cover",
      "No claim bonus"
    ],
    Home: [
      "Natural disasters",
      "Theft coverage",
      "Content protection",
      "Temporary accommodation",
      "Legal liability"
    ],
    Life: [
      "Critical illness",
      "Accidental death",
      "Disability cover",
      "Premium waiver",
      "Maturity benefits"
    ]
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["age", "budget", "dependents"];
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name)
        ? (name === "dependents" ? parseInt(value || 0, 10) : parseFloat(value) || 0)
        : value
    }));
  };

  const toggleCoverageNeed = (need) => {
    setFormData(prev => ({
      ...prev,
      coverage_needs: prev.coverage_needs.includes(need)
        ? prev.coverage_needs.filter(n => n !== need)
        : [...prev.coverage_needs, need]
    }));
  };

  const getRecommendations = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        ...formData,
        user_id: user?.id
      };

      const response = await fetch("http://localhost:8000/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        setRecommendations(data.recommendations || []);
        toast.success(`Found ${data.recommendations?.length || 0} recommendations`);
      } else {
        toast.error(data.message || "Error fetching recommendations");
      }
    } catch (error) {
      toast.error("Failed to fetch recommendations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          ← Back
        </button>
        <h1 style={styles.title}>Personalized Recommendations</h1>
      </div>

      <div style={styles.content}>
        {/* Preference Form */}
        <div style={styles.formCard}>
          <h2 style={styles.cardTitle}>Your Preferences</h2>
          <form onSubmit={getRecommendations}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Insurance Type *</label>
              <select
                name="policy_type"
                value={formData.policy_type}
                onChange={(e) => {
                  handleInputChange(e);
                  setFormData(prev => ({ ...prev, coverage_needs: [] }));
                }}
                style={styles.select}
                required
              >
                <option value="Health">Health Insurance</option>
                <option value="Auto">Auto Insurance</option>
                <option value="Home">Home Insurance</option>
                <option value="Life">Life Insurance</option>
              </select>
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Your Age *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                style={styles.input}
                min="18"
                max="100"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Monthly Budget (₹) *</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                style={styles.input}
                min="100"
                step="50"
                required
              />
              <small style={styles.helpText}>
                Your budget: ₹{formData.budget}/month
              </small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Risk tolerance *</label>
              <select
                name="risk_tolerance"
                value={formData.risk_tolerance}
                onChange={handleInputChange}
                style={styles.select}
              >
                <option value="Low">Low (prefer lower deductibles)</option>
                <option value="Medium">Medium</option>
                <option value="High">High (ok with higher deductibles)</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>What matters more?</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                style={styles.select}
              >
                <option value="balanced">Balanced</option>
                <option value="coverage">Max coverage</option>
                <option value="premium">Lower premium</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Dependents (Health/Life focus)</label>
              <input
                type="number"
                name="dependents"
                value={formData.dependents}
                onChange={handleInputChange}
                style={styles.input}
                min="0"
                max="10"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Location risk (Home/Auto)</label>
              <select
                name="location_risk"
                value={formData.location_risk}
                onChange={handleInputChange}
                style={styles.select}
              >
                <option value="normal">Normal</option>
                <option value="high">High-risk area (flood/theft)</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>What coverage do you need?</label>
              <div style={styles.checkboxGroup}>
                {coverageOptions[formData.policy_type]?.map(option => (
                  <label key={option} style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.coverage_needs.includes(option)}
                      onChange={() => toggleCoverageNeed(option)}
                      style={styles.checkbox}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Finding recommendations..." : "Get Recommendations"}
            </button>
          </form>
        </div>

        {/* Recommendations List */}
        <div style={styles.recommendationsPanel}>
          <h2 style={styles.cardTitle}>
            {recommendations.length > 0 
              ? `Top ${recommendations.length} Recommendations` 
              : "Your Recommendations"}
          </h2>

          {recommendations.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>⭐</div>
              <p>Fill in your preferences to get personalized policy recommendations</p>
            </div>
          ) : (
            <div style={styles.recommendationsList}>
              {recommendations.map((rec, index) => {
                const policy = rec.policy;
                const scorePercentage = rec.recommendation_score;
                
                return (
                  <div key={rec.id} style={styles.recommendationCard}>
                    <div style={styles.recHeader}>
                      <div style={styles.recRank}>#{index + 1}</div>
                      <div style={styles.recScore}>
                        <div style={styles.scoreCircle}>
                          <svg width="60" height="60">
                            <circle
                              cx="30"
                              cy="30"
                              r="25"
                              fill="none"
                              stroke="#e0e0e0"
                              strokeWidth="5"
                            />
                            <circle
                              cx="30"
                              cy="30"
                              r="25"
                              fill="none"
                              stroke="#00897B"
                              strokeWidth="5"
                              strokeDasharray={`${(scorePercentage / 100) * 157} 157`}
                              strokeLinecap="round"
                              transform="rotate(-90 30 30)"
                            />
                          </svg>
                          <div style={styles.scoreText}>{Math.round(scorePercentage)}</div>
                        </div>
                        <small style={styles.scoreLabel}>Match Score</small>
                      </div>
                    </div>

                    <div style={styles.policyInfo}>
                      <h3 style={styles.policyName}>{policy.policy_name}</h3>
                      <p style={styles.provider}>{policy.provider}</p>
                      <div style={styles.rating}>⭐ {policy.rating} Rating</div>
                      
                      <div style={styles.policyDetails}>
                        <div style={styles.detailRow}>
                          <span style={styles.detailLabel}>Coverage:</span>
                          <span style={styles.detailValue}>
                            ₹{policy.coverage_amount.toLocaleString()}
                          </span>
                        </div>
                        <div style={styles.detailRow}>
                          <span style={styles.detailLabel}>Monthly Premium:</span>
                          <span style={styles.detailValue}>₹{policy.premium_monthly}</span>
                        </div>
                        <div style={styles.detailRow}>
                          <span style={styles.detailLabel}>Yearly Premium:</span>
                          <span style={styles.detailValue}>
                            ₹{policy.premium_yearly.toLocaleString()}
                          </span>
                        </div>
                        <div style={styles.detailRow}>
                          <span style={styles.detailLabel}>Deductible:</span>
                          <span style={styles.detailValue}>
                            ₹{policy.deductible.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div style={styles.reasonBox}>
                        <strong>Why this policy?</strong>
                        <p style={styles.reasonText}>{rec.reason}</p>
                        {rec.reason_details?.length > 0 && (
                          <ul style={styles.reasonList}>
                            {rec.reason_details.map((item, idx) => (
                              <li key={idx}>• {item}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div style={styles.features}>
                        <strong>Key Features:</strong>
                        <ul style={styles.featuresList}>
                          {policy.features.slice(0, 4).map((feature, idx) => (
                            <li key={idx}>✓ {feature}</li>
                          ))}
                        </ul>
                      </div>

                      <button
                        style={styles.viewDetailsBtn}
                        onClick={() => navigate("/policy-comparison")}
                      >
                        View & Compare
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px"
  },
  backBtn: {
    padding: "10px 20px",
    backgroundColor: "#00897B",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600"
  },
  title: {
    fontSize: "32px",
    color: "#333",
    margin: 0
  },
  content: {
    display: "grid",
    gridTemplateColumns: "400px 1fr",
    gap: "30px",
    maxWidth: "1400px",
    margin: "0 auto"
  },
  formCard: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    height: "fit-content",
    position: "sticky",
    top: "20px"
  },
  cardTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#333",
    marginTop: 0,
    marginBottom: "25px"
  },
  formGroup: {
    marginBottom: "20px"
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "8px"
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "2px solid #ddd",
    borderRadius: "6px",
    boxSizing: "border-box"
  },
  select: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "2px solid #ddd",
    borderRadius: "6px",
    boxSizing: "border-box",
    backgroundColor: "#fff"
  },
  helpText: {
    display: "block",
    fontSize: "12px",
    color: "#666",
    marginTop: "5px"
  },
  checkboxGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#333",
    cursor: "pointer"
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer"
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#00897B",
    color: "#fff",
    border: "none",
  },
  reasonList: {
    margin: "8px 0 0 0",
    paddingLeft: "18px",
    color: "#555",
    fontSize: "13px",
    listStyle: "disc"
  },
  recommendationsPanel: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#666"
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px"
  },
  recommendationsList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  recommendationCard: {
    border: "2px solid #e0e0e0",
    borderRadius: "12px",
    padding: "25px",
    transition: "all 0.3s"
  },
  recHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "20px",
    borderBottom: "2px solid #f0f0f0"
  },
  recRank: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "#00897B",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "700"
  },
  recScore: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "5px"
  },
  scoreCircle: {
    position: "relative",
    width: "60px",
    height: "60px"
  },
  scoreText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "18px",
    fontWeight: "700",
    color: "#00897B"
  },
  scoreLabel: {
    fontSize: "12px",
    color: "#666"
  },
  policyInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  policyName: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#333",
    margin: 0
  },
  provider: {
    fontSize: "14px",
    color: "#666",
    margin: 0
  },
  rating: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#FF9800"
  },
  policyDetails: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px"
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between"
  },
  detailLabel: {
    fontSize: "13px",
    color: "#666"
  },
  detailValue: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#333"
  },
  reasonBox: {
    padding: "15px",
    backgroundColor: "#e8f5e9",
    borderRadius: "8px",
    fontSize: "14px"
  },
  reasonText: {
    margin: "8px 0 0 0",
    color: "#2e7d32",
    lineHeight: "1.6"
  },
  features: {
    fontSize: "14px"
  },
  featuresList: {
    margin: "8px 0 0 0",
    paddingLeft: "20px",
    lineHeight: "1.8",
    color: "#666"
  },
  viewDetailsBtn: {
    padding: "12px",
    backgroundColor: "#2196F3",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px"
  }
};
