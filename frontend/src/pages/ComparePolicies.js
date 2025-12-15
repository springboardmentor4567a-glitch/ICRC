import React, { useEffect, useState } from "react";

export default function ComparePolicies() {
  const [, setPolicies] = useState([]);
  const [selectedPolicies, setSelectedPolicies] = useState([]);

  useEffect(() => {
    const selectedIds = JSON.parse(
      localStorage.getItem("compare_selected") || "[]"
    );

    fetch("http://127.0.0.1:8000/policies")
      .then((res) => res.json())
      .then((data) => {
        setPolicies(data);
        const filtered = data.filter((p) => selectedIds.includes(p.id));
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

  return (
    <div style={{ padding: 30 }}>
      <h2 className="page-title">Compare Insurance Policies</h2>

      <div className="compare-wrapper">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Feature</th>
              {selectedPolicies.map((p) => (
                <th key={p.id}>{p.name}</th>
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
                <td key={p.id}>₹{p.premium}</td>
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
        </table>
      </div>
    </div>
  );
}
