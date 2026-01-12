import React, { useEffect, useState } from "react";
import "./claims.css";

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchClaims();
  }, [filter]);

  const fetchClaims = async () => {
    const url =
      filter === "all"
        ? "http://127.0.0.1:8000/claims"
        : `http://127.0.0.1:8000/claims/status/${filter}`;

    const res = await fetch(url);
    const data = await res.json();
    setClaims(data);
  };

  return (
    <div className="page-center">
      <h2 className="page-title">My Claims</h2>

      {/* FILTER TABS */}
      <div className="status-tabs">
        {["all", "submitted", "in_progress", "approved", "rejected"].map(
          (s) => (
            <button
              key={s}
              className={`tab-btn ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s.replace("_", " ").toUpperCase()}
            </button>
          )
        )}
      </div>

      {/* CLAIM LIST */}
      {claims.map((c) => (
        <div key={c.id} className="card claim-item">
          <p><b>Claim ID:</b> {c.id}</p>
          <p><b>Policy:</b> {c.policy_number}</p>
          <p><b>Amount:</b> ₹{c.amount}</p>

          <span className={`status ${c.status}`}>
            {c.status.replace("_", " ")}
          </span>
        </div>
      ))}
    </div>
  );
}
