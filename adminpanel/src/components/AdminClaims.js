import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------------
  // Load all claims
  // ---------------------
  const loadClaims = () => {
    setLoading(true);
    axios.get("http://localhost:5001/api/claims")
      .then(res => {
        setClaims(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load claims:", err);
        alert("Failed to load claims from server");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadClaims();
  }, []);

  // ---------------------
  // Update claim status
  // ---------------------
  const updateStatus = (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this claim as "${status}"?`)) return;

    axios.put(`http://localhost:5001/api/claims/${id}`, { status })
      .then(() => {
        // Update status locally for instant UI feedback
        setClaims(prev =>
          prev.map(c => (c._id === id ? { ...c, status } : c))
        );
      })
      .catch(err => {
        console.error("Failed to update claim status:", err);
        alert("Failed to update claim status");
      });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Claims</h2>

      {loading ? (
        <p>Loading claims...</p>
      ) : (
        <table border="1" cellPadding="10" width="100%">
          <thead>
            <tr>
              <th>User</th>
              <th>Policy</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Fraud</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {claims.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No claims found
                </td>
              </tr>
            ) : (
              claims.map(c => (
                <tr key={c._id}>
                  <td>{c.userEmail}</td>
                  <td>{c.policyType}</td>
                  <td>{c.claimType}</td>
                  <td>₹{c.claimAmount}</td>
                  <td>{c.fraudScore}</td>
                  <td>{c.status}</td>
                  <td>
                    <button
                      onClick={() => updateStatus(c._id, "Approved")}
                      disabled={c.status === "Approved"}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(c._id, "Rejected")}
                      disabled={c.status === "Rejected"}
                      style={{ marginLeft: "5px" }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminClaims;
