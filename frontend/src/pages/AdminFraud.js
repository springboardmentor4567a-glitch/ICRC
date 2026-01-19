import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminFraud = () => {
  const [frauds, setFrauds] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    axios.get("http://127.0.0.1:8000/admin/fraud-flags", {
      headers: {
        token: token   // ✅ THIS IS THE KEY FIX
      }
    })
    .then(res => {
      setFrauds(res.data);
    })
    .catch(err => {
      console.error("Fraud API error:", err);
    });
  }, []);


  return (
    <div style={{ padding: "20px" }}>
     <h2
  style={{
    color: "#ec7044",
    fontWeight: "bold",
    marginBottom: "20px"
  }}
>
  🚨 Fraud Detection Dashboard
</h2>


      {frauds.length === 0 ? (
        <p>No frauds detected</p>
      ) : (
        <table
  border="1"
  cellPadding="10"
  cellSpacing="0"
  style={{
    width: "100%",
    backgroundColor: "#ffffff",
    color: "#000000",
    borderCollapse: "collapse",
  }}
>
  <thead style={{ backgroundColor: "#f0f0f0" }}>
    <tr>
      <th>Claim ID</th>
      <th>Rule</th>
      <th>Severity</th>
      <th>Details</th>
      <th>Created At</th>
    </tr>
  </thead>
  <tbody>
    {frauds.map((f) => (
      <tr key={f.id}>
        <td>{f.claim_id}</td>
        <td>{f.rule_code}</td>
        <td
          style={{
            color:
              f.severity === "high"
                ? "red"
                : f.severity === "medium"
                ? "orange"
                : "green",
            fontWeight: "bold",
          }}
        >
          {f.severity.toUpperCase()}
        </td>
        <td>{f.details}</td>
        <td>{new Date(f.created_at).toLocaleString()}</td>
      </tr>
    ))}
  </tbody>
</table>

      )}
    </div>
  );
};

export default AdminFraud;
