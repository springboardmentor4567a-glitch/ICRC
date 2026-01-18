import React, { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function AdminAnalytics({ onBack }) {

  const [data, setData] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    fetch(`${API_URL}/admin/analytics`, {
      headers: { "user-id": userId }
    })
      .then(res => res.json())
      .then(setData);

  }, []);

const exportCSV = async () => {
  const userId = localStorage.getItem("user_id");

  const res = await fetch(`${API_URL}/admin/export/claims`, {
    headers: {
      "user-id": userId
    }
  });

  if (!res.ok) {
    alert("Export failed – Admin access required");
    return;
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "claims_report.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
};


  if (!data) return <p>Loading...</p>;

  return (
    <div className="page-container">

      <button onClick={onBack}>⬅ Back</button>

      <h2>Admin Analytics</h2>

      <div className="card-box">
        <p><b>Total Claims:</b> {data.total_claims}</p>
        <p><b>Approved:</b> {data.approved_claims}</p>
        <p><b>Rejected:</b> {data.rejected_claims}</p>
        <p><b>Fraud Flags:</b> {data.fraud_flags}</p>
        <p><b>Total Users:</b> {data.total_users}</p>
        <p><b>User Policies:</b> {data.total_user_policies}</p>
      </div>

      <button onClick={exportCSV}>
        Export Claims as CSV
      </button>

    </div>
  );
}
