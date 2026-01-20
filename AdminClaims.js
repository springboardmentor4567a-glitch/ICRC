import { useEffect, useState } from "react";
import "../styles/adminclaims.css";



function AdminClaims() {
  const [claims, setClaims] = useState([]);

  const fetchClaims = async () => {
    const res = await fetch("http://127.0.0.1:8000/admin/claims");
    const data = await res.json();
    setClaims(data);
  };

  const updateStatus = async (id, status) => {
    await fetch(
      `http://127.0.0.1:8000/admin/claims/${id}?status=${status}`,
      { method: "PUT" }
    );
    fetchClaims(); // 🔁 refresh after update
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <div className="admin-container">
      
      <h2>Admin Claims Dashboard</h2>

      {claims.map((c) => (
        <div className="admin-card" key={c.id}>
          <div>
            <strong>{c.policy_name}</strong>
            <p>₹{c.amount}</p>
            <span className={`status ${c.status.toLowerCase()}`}>
              {c.status}
            </span>
          </div>

          <div className="actions">
            <button onClick={() => updateStatus(c.id, "Approved")}>
              Approve
            </button>
            <button className="reject" onClick={() => updateStatus(c.id, "Rejected")}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminClaims;
