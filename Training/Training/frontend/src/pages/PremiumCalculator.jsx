import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PremiumCalculator() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    policy_type: "Health",
    age: 30,
    coverage_amount: 500000,
    deductible: 10000,
    location: "",
    risk_factors: []
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const policyTypes = ["Health", "Auto", "Home", "Life"];
  const riskFactorOptions = {
    Health: ["Smoking", "Pre-existing conditions", "High BMI", "Family history"],
    Auto: ["Poor driving record", "High-risk area", "Young driver", "Sports car"],
    Home: ["High-risk area", "Old construction", "No security", "High value items"],
    Life: ["Smoking", "Dangerous occupation", "Health issues", "High-risk activities"]
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ["age", "coverage_amount", "deductible"].includes(name) 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleRiskFactorToggle = (factor) => {
    setFormData(prev => ({
      ...prev,
      risk_factors: prev.risk_factors.includes(factor)
        ? prev.risk_factors.filter(f => f !== factor)
        : [...prev.risk_factors, factor]
    }));
  };

  const calculatePremium = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:8000/api/calculate-premium", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        toast.success("Premium calculated successfully!");
      } else {
        toast.error(data.message || "Error calculating premium");
      }
    } catch (error) {
      toast.error("Failed to calculate premium");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      policy_type: "Health",
      age: 30,
      coverage_amount: 500000,
      deductible: 10000,
      location: "",
      risk_factors: []
    });
    setResult(null);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          ← Back
        </button>
        <h1 style={styles.title}>Premium Calculator</h1>
      </div>

      <div style={styles.content}>
        {/* Calculator Form */}
        <div style={styles.formCard}>
          <h2 style={styles.cardTitle}>Calculate Your Premium</h2>
          <form onSubmit={calculatePremium}>
            {/* Policy Type */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Insurance Type *</label>
              <select
                name="policy_type"
                value={formData.policy_type}
                onChange={(e) => {
                  handleInputChange(e);
                  setFormData(prev => ({ ...prev, risk_factors: [] }));
                }}
                style={styles.select}
                required
              >
                {policyTypes.map(type => (
                  <option key={type} value={type}>{type} Insurance</option>
                ))}
              </select>
            </div>

            {/* Age */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Age *</label>
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

            {/* Coverage Amount */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Coverage Amount (₹) *</label>
              <input
                type="number"
                name="coverage_amount"
                value={formData.coverage_amount}
                onChange={handleInputChange}
                style={styles.input}
                min="100000"
                step="50000"
                required
              />
              <small style={styles.helpText}>
                Current: ₹{formData.coverage_amount.toLocaleString()}
              </small>
            </div>

            {/* Deductible */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Deductible (₹) *</label>
              <input
                type="number"
                name="deductible"
                value={formData.deductible}
                onChange={handleInputChange}
                style={styles.input}
                min="0"
                step="1000"
                required
              />
              <small style={styles.helpText}>
                Higher deductible = Lower premium
              </small>
            </div>

            {/* Location */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Location</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                style={styles.select}
              >
                <option value="">Select location</option>
                <option value="Urban">Urban/Metro</option>
                <option value="Suburban">Suburban</option>
                <option value="Rural">Rural</option>
              </select>
            </div>

            {/* Risk Factors */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Risk Factors</label>
              <div style={styles.checkboxGroup}>
                {riskFactorOptions[formData.policy_type]?.map(factor => (
                  <label key={factor} style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.risk_factors.includes(factor)}
                      onChange={() => handleRiskFactorToggle(factor)}
                      style={styles.checkbox}
                    />
                    {factor}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div style={styles.buttonGroup}>
              <button
                type="submit"
                style={styles.submitBtn}
                disabled={loading}
              >
                {loading ? "Calculating..." : "Calculate Premium"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={styles.resetBtn}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Result Card */}
        {result && (
          <div style={styles.resultCard}>
            <h2 style={styles.cardTitle}>Your Premium Estimate</h2>
            
            <div style={styles.premiumDisplay}>
              <div style={styles.premiumItem}>
                <span style={styles.premiumLabel}>Monthly Premium</span>
                <span style={styles.premiumValue}>₹{result.monthly_premium.toLocaleString()}</span>
              </div>
              <div style={styles.premiumItem}>
                <span style={styles.premiumLabel}>Yearly Premium</span>
                <span style={styles.premiumValue}>₹{result.yearly_premium.toLocaleString()}</span>
                <span style={styles.savingsBadge}>Save 5%</span>
              </div>
            </div>

            <div style={styles.coverageInfo}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Coverage Amount:</span>
                <span style={styles.infoValue}>₹{result.coverage_amount.toLocaleString()}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Deductible:</span>
                <span style={styles.infoValue}>₹{result.deductible.toLocaleString()}</span>
              </div>
            </div>

            <div style={styles.factorsSection}>
              <h3 style={styles.factorsTitle}>Factors Considered:</h3>
              <ul style={styles.factorsList}>
                {result.factors_considered.map((factor, idx) => (
                  <li key={idx} style={styles.factorItem}>✓ {factor}</li>
                ))}
              </ul>
            </div>

            <button
              style={styles.proceedBtn}
              onClick={() => navigate("/policy-comparison")}
            >
              View Available Policies
            </button>
          </div>
        )}
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
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  formCard: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    height: "fit-content"
  },
  resultCard: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    height: "fit-content"
  },
  cardTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "25px",
    marginTop: 0
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
    boxSizing: "border-box",
    transition: "border-color 0.3s"
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
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "25px"
  },
  submitBtn: {
    flex: 1,
    padding: "14px",
    backgroundColor: "#00897B",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s"
  },
  resetBtn: {
    padding: "14px 24px",
    backgroundColor: "#fff",
    color: "#00897B",
    border: "2px solid #00897B",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer"
  },
  premiumDisplay: {
    marginBottom: "25px"
  },
  premiumItem: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    marginBottom: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap"
  },
  premiumLabel: {
    fontSize: "16px",
    color: "#666",
    fontWeight: "500"
  },
  premiumValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#00897B"
  },
  savingsBadge: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    marginLeft: "10px"
  },
  coverageInfo: {
    padding: "20px",
    backgroundColor: "#f0f7f6",
    borderRadius: "8px",
    marginBottom: "20px"
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #ddd"
  },
  infoLabel: {
    fontSize: "14px",
    color: "#666"
  },
  infoValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333"
  },
  factorsSection: {
    marginBottom: "25px"
  },
  factorsTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "12px"
  },
  factorsList: {
    listStyle: "none",
    padding: 0,
    margin: 0
  },
  factorItem: {
    padding: "8px 0",
    fontSize: "14px",
    color: "#666"
  },
  proceedBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#2196F3",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer"
  }
};

// Add media query for responsive design
if (window.innerWidth < 768) {
  styles.content.gridTemplateColumns = "1fr";
}
