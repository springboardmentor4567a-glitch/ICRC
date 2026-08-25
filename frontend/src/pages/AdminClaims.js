import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./AdminClaims.css";

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/claims", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => setClaims(res.data))
      .catch((err) => console.error(err));
  }, []);

  const displayedClaims = statusFilter === "pending"
    ? claims.filter((c) => c.status === "pending" || c.status === "submitted")
    : claims;

  return (
    <div className="admin-page">
      <h2 className="admin-title">
        📋 Claims Management {statusFilter && `(${statusFilter.toUpperCase()} ONLY)`}
      </h2>

      {statusFilter && (
        <button 
          onClick={() => setSearchParams({})} 
          style={{
            background: "#f1f5f9",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "6px 12px",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: "16px",
            color: "#475569"
          }}
        >
          ✕ Clear Filter (Show All)
        </button>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {displayedClaims.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.user_name}</td>
              <td>₹{c.amount}</td>

              <td>
                <span className={`status ${c.status}`}>
                  {c.status.replace("_", " ")}
                </span>
              </td>

              <td>
                <button
                  className="action-btn view"
                  onClick={() => navigate(`/admin/claims/${c.id}`)}
                >
                  👁 View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminClaims;
