import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ComparePolicies() {
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("compare_selected");

    if (!stored) return;

    const selectedIds = JSON.parse(stored).map(Number);

    fetch("http://127.0.0.1:8000/policies")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((p) =>
          selectedIds.includes(Number(p.id))
        );
        setSelectedPolicies(filtered);
      });
  }, []);

  if (selectedPolicies.length < 2) {
    return (
      <h3 style={{ textAlign: "center", marginTop: 60, color: "#6C63FF" }}>
        Please select at least 2 policies to compare
      </h3>
    );
  }

  const cheapestPremium = Math.min(
    ...selectedPolicies.map((p) => p.premium)
  );

  return (
    <div style={{ padding: 30 }}>
      <h2 className="page-title">Compare Insurance Policies</h2>

      <div className="compare-wrapper fade-in">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Feature</th>
              {selectedPolicies.map((p) => (
                <th key={p.id}>
                  {p.name}
                  {p.premium === cheapestPremium && (
                    <div className="badge cheapest">Best Value</div>
                  )}
                  {p.premium !== cheapestPremium && (
                    <div className="badge popular">Popular</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Category</td>
              {selectedPolicies.map((p) => (
                <td key={p.id}>{p.category}</td>
              ))}
            </tr>

            <tr>
              <td>Coverage</td>
              {selectedPolicies.map((p) => (
                <td key={p.id}>₹{p.coverage}</td>
              ))}
            </tr>

            <tr>
              <td>Premium / Year</td>
              {selectedPolicies.map((p) => (
                <td
                  key={p.id}
                  style={{
                    fontWeight:
                      p.premium === cheapestPremium ? "bold" : "normal",
                    color:
                      p.premium === cheapestPremium ? "#22c55e" : "#222",
                  }}
                >
                  ₹{p.premium}
                </td>
              ))}
            </tr>

            <tr>
              <td>Benefits</td>
              {selectedPolicies.map((p) => (
                <td key={p.id}>{p.benefits}</td>
              ))}
            </tr>

            <tr>
              <td>Policy Number</td>
              {selectedPolicies.map((p) => (
                <td key={p.id}>{p.policy_number}</td>
              ))}
            </tr>
          </tbody>
          <div style={{ marginTop: 24, textAlign: "center" }}>
  <button
    className="btn-outline" 
    onClick={() => navigate("/plans")}
  >
    ← Back to Plans
  </button>
</div>

        </table>
      </div>
    </div>
  );
}
