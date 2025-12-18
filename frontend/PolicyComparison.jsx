import React, { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function PolicyComparison({ goBack }) {
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/policies`)
      .then(res => res.json())
      .then(data => setPolicies(data));
  }, []);

  return (
    <div className="page-container">
      <button className="back-btn" onClick={goBack}>← Back</button>

      <h2 className="page-title">Policy Comparison</h2>

      <div className="table-card">
        <table className="policy-table">
          <thead>
            <tr>
              <th>Policy Name</th>
              <th>Type</th>
              <th>Premium (₹)</th>
              <th>Term (Months)</th>
              <th>Deductible (₹)</th>
            </tr>
          </thead>
          <tbody>
            {policies.map(p => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.policy_type}</td>
                <td>{p.premium}</td>
                <td>{p.term_months}</td>
                <td>{p.deductible}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
