import React, { useState } from "react";
import "../styles/compare.css";
import { useNavigate } from "react-router-dom";


const policies = [
  
  {
    id: 1,
    name: "Health Secure Plus",
    category: "Health Insurance",
    coverage: "₹5,00,000",
    premium: "₹7,800",
    benefits: "Hospitalization, Cashless"
  },
  {
    id: 2,
    name: "Family Health Pro",
    category: "Family Health",
    coverage: "₹8,00,000",
    premium: "₹11,200",
    benefits: "Maternity, Family Cover"
  },
  {
    id: 3,
    name: "Life Shield Plan",
    category: "Life Insurance",
    coverage: "₹10,00,000",
    premium: "₹9,500",
    benefits: "Life Cover, Tax Benefits"
  }
];

const Compare = () => {
  const navigate = useNavigate();
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  const togglePolicy = (policy) => {
    if (selectedPolicies.includes(policy)) {
      setSelectedPolicies(selectedPolicies.filter(p => p !== policy));
      setShowComparison(false);
    } else if (selectedPolicies.length < 2) {
      setSelectedPolicies([...selectedPolicies, policy]);
    }
  };

  return (
    <div className="compare-page">
<button
  onClick={() => navigate("/dashboard")}
  style={{
    position: "absolute",
    top: "20px",
    left: "20px",
    padding: "6px 12px",          // ⭐ smaller padding
    fontSize: "13px",
    borderRadius: "18px",
    border: "none",
    background: "#34d399",
    color: "#fff",
    cursor: "pointer",
    width: "auto",                // ⭐ prevents stretching
    maxWidth: "fit-content",      // ⭐ key line
    display: "inline-flex",       // ⭐ not full-width
    alignItems: "center",
    gap: "6px",
    whiteSpace: "nowrap",         // ⭐ no wrapping
  }}
>
  ← Back
</button>

      <h1 className="compare-title-main">Compare Insurance Policies</h1>
      <p className="compare-subtitle">
        Select <b>two policies</b> to compare them side by side
      </p>

      {/* Policy Cards */}
      <div className="policy-card-container">
        {policies.map(policy => (
          <div
            key={policy.id}
            className={`policy-card ${selectedPolicies.includes(policy) ? "selected" : ""}`}
          >
            <h3>{policy.name}</h3>
            <p><b>Category:</b> {policy.category}</p>
            <p><b>Coverage:</b> {policy.coverage}</p>
            <p><b>Premium:</b> {policy.premium} / year</p>

            <button
              className="select-btn"
              onClick={() => togglePolicy(policy)}
            >
              {selectedPolicies.includes(policy)
                ? "Remove"
                : "Add to Compare"}
            </button>
          </div>
        ))}
      </div>

      {/* Compare Button */}
      {selectedPolicies.length === 2 && (
        <div className="compare-btn-wrapper">
          <button
            className="compare-btn"
            onClick={() => setShowComparison(true)}
          >
            Compare Policies
          </button>
        </div>
      )}

      {/* Comparison Table */}
      {showComparison && (
        <>
          <h2 className="comparison-heading">Policy Comparison</h2>

          <div className="table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>{selectedPolicies[0].name}</th>
                  <th>{selectedPolicies[1].name}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Category</td>
                  <td>{selectedPolicies[0].category}</td>
                  <td>{selectedPolicies[1].category}</td>
                </tr>
                <tr>
                  <td>Coverage</td>
                  <td>{selectedPolicies[0].coverage}</td>
                  <td>{selectedPolicies[1].coverage}</td>
                </tr>
                <tr>
                  <td>Premium / Year</td>
                  <td>{selectedPolicies[0].premium}</td>
                  <td>{selectedPolicies[1].premium}</td>
                </tr>
                <tr>
                  <td>Benefits</td>
                  <td>{selectedPolicies[0].benefits}</td>
                  <td>{selectedPolicies[1].benefits}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Compare;

