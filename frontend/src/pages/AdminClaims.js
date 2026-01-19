import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminClaims.css";

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const navigate = useNavigate();

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

  return (
    <div className="admin-page">
      <h2 className="admin-title">📋 Claims Management</h2>

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
          {claims.map((c) => (
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
