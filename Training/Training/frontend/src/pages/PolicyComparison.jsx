import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PolicyComparison() {
  const [policies, setPolicies] = useState([]);
  const [selectedType, setSelectedType] = useState("Health");
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const policyTypes = ["Health", "Auto", "Home", "Life"];

  useEffect(() => {
    fetchPolicies(selectedType);
  }, [selectedType]);

  const fetchPolicies = async (type) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/policies?policy_type=${type}`);
      const data = await response.json();
      setPolicies(data.policies || []);
    } catch (error) {
      toast.error("Error fetching policies");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const togglePolicySelection = (policyId) => {
    setSelectedPolicies(prev => {
      if (prev.includes(policyId)) {
        return prev.filter(id => id !== policyId);
      } else if (prev.length < 3) {
        return [...prev, policyId];
      } else {
        toast.warning("You can compare up to 3 policies at a time");
        return prev;
      }
    });
  };

  const getSelectedPolicyData = () => {
    return policies.filter(p => selectedPolicies.includes(p.id));
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          ← Back
        </button>
        <h1 style={styles.title}>Policy Comparison</h1>
      </div>

      {/* Policy Type Selector */}
      <div style={styles.typeSelector}>
        {policyTypes.map(type => (
          <button
            key={type}
            style={{
              ...styles.typeBtn,
              ...(selectedType === type ? styles.typeBtnActive : {})
            }}
            onClick={() => {
              setSelectedType(type);
              setSelectedPolicies([]);
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loading}>Loading policies...</div>
      ) : (
        <>
          {/* Policy List */}
          <div style={styles.policyGrid}>
            {policies.map(policy => (
              <div
                key={policy.id}
                style={{
                  ...styles.policyCard,
                  ...(selectedPolicies.includes(policy.id) ? styles.policyCardSelected : {})
                }}
                onClick={() => togglePolicySelection(policy.id)}
              >
                <div style={styles.policyHeader}>
                  <h3 style={styles.policyName}>{policy.policy_name}</h3>
                  <div style={styles.rating}>⭐ {policy.rating}</div>
                </div>
                <p style={styles.provider}>{policy.provider}</p>
                <div style={styles.policyDetails}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Coverage:</span>
                    <span style={styles.detailValue}>₹{policy.coverage_amount.toLocaleString()}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Monthly Premium:</span>
                    <span style={styles.detailValue}>₹{policy.premium_monthly}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Deductible:</span>
                    <span style={styles.detailValue}>₹{policy.deductible.toLocaleString()}</span>
                  </div>
                </div>
                <p style={styles.description}>{policy.description}</p>
                {selectedPolicies.includes(policy.id) && (
                  <div style={styles.selectedBadge}>✓ Selected</div>
                )}
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          {selectedPolicies.length > 1 && (
            <div style={styles.comparisonSection}>
              <h2 style={styles.comparisonTitle}>Detailed Comparison</h2>
              <div style={styles.comparisonTable}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Feature</th>
                      {getSelectedPolicyData().map(policy => (
                        <th key={policy.id} style={styles.th}>{policy.policy_name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={styles.td}>Provider</td>
                      {getSelectedPolicyData().map(policy => (
                        <td key={policy.id} style={styles.td}>{policy.provider}</td>
                      ))}
                    </tr>
                    <tr>
                      <td style={styles.td}>Coverage Amount</td>
                      {getSelectedPolicyData().map(policy => (
                        <td key={policy.id} style={styles.td}>₹{policy.coverage_amount.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr>
                      <td style={styles.td}>Monthly Premium</td>
                      {getSelectedPolicyData().map(policy => (
                        <td key={policy.id} style={styles.td}>₹{policy.premium_monthly}</td>
                      ))}
                    </tr>
                    <tr>
                      <td style={styles.td}>Yearly Premium</td>
                      {getSelectedPolicyData().map(policy => (
                        <td key={policy.id} style={styles.td}>₹{policy.premium_yearly.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr>
                      <td style={styles.td}>Deductible</td>
                      {getSelectedPolicyData().map(policy => (
                        <td key={policy.id} style={styles.td}>₹{policy.deductible.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr>
                      <td style={styles.td}>Rating</td>
                      {getSelectedPolicyData().map(policy => (
                        <td key={policy.id} style={styles.td}>⭐ {policy.rating}</td>
                      ))}
                    </tr>
                    <tr>
                      <td style={styles.td}>Features</td>
                      {getSelectedPolicyData().map(policy => (
                        <td key={policy.id} style={styles.td}>
                          <ul style={styles.featureList}>
                            {policy.features.map((feature, idx) => (
                              <li key={idx}>{feature}</li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
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
    marginBottom: "20px"
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
  typeSelector: {
    display: "flex",
    gap: "10px",
    marginBottom: "30px",
    flexWrap: "wrap"
  },
  typeBtn: {
    padding: "12px 24px",
    backgroundColor: "#fff",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s"
  },
  typeBtnActive: {
    backgroundColor: "#00897B",
    color: "#fff",
    borderColor: "#00897B"
  },
  loading: {
    textAlign: "center",
    fontSize: "18px",
    color: "#666",
    padding: "40px"
  },
  policyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
    marginBottom: "40px"
  },
  policyCard: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "all 0.3s",
    border: "2px solid transparent",
    position: "relative"
  },
  policyCardSelected: {
    borderColor: "#00897B",
    boxShadow: "0 4px 16px rgba(0,137,123,0.3)"
  },
  policyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: "10px"
  },
  policyName: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
    margin: 0,
    flex: 1
  },
  rating: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FF9800"
  },
  provider: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "15px"
  },
  policyDetails: {
    marginBottom: "15px"
  },
  detailItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #f0f0f0"
  },
  detailLabel: {
    fontSize: "14px",
    color: "#666"
  },
  detailValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333"
  },
  description: {
    fontSize: "13px",
    color: "#777",
    lineHeight: "1.5",
    margin: "10px 0"
  },
  selectedBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "#00897B",
    color: "#fff",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600"
  },
  comparisonSection: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  comparisonTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "20px"
  },
  comparisonTable: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    backgroundColor: "#00897B",
    color: "#fff",
    padding: "15px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "14px"
  },
  td: {
    padding: "15px",
    borderBottom: "1px solid #ddd",
    fontSize: "14px",
    color: "#333"
  },
  featureList: {
    margin: 0,
    paddingLeft: "20px",
    fontSize: "13px",
    lineHeight: "1.8"
  }
};
