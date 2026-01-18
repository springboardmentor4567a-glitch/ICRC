import React, { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function ClaimStatus({ onBack }) {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    fetch(`${API_URL}/claims`, {
      headers: { "user-id": userId }
    })
      .then(res => res.json())
      .then(data => setClaims(data));
  }, []);

  return (
    <div className="page-container">
      <button onClick={onBack}>⬅ Back</button>
      <h2>Your Claims</h2>

      {claims.length === 0 && <p>No claims submitted yet.</p>}

      {claims.map(c => (
  <div key={c.id} className="card-box">
    <p><b>Policy:</b> {c.policy_id}</p>
    <p><b>Description:</b> {c.description}</p>
    <p><b>Status:</b> {c.status}</p>
    <small style={{ color: "#666" }}>
      {new Date(c.created_at).toLocaleString()}
    </small>
  </div>
))}

    </div>
  );
} 