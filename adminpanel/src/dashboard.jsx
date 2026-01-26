import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // for redirect
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import axios from "axios";
import "./dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------------
  // Admin Info
  // ---------------------
  const adminEmail = localStorage.getItem("adminEmail"); // stored during login

  // ---------------------
  // Route Protection
  // ---------------------
  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (!auth) {
      alert("Please login first");
      navigate("/admin-login"); // redirect to login
    }
  }, [navigate]);

  // ---------------------
  // Load all claims
  // ---------------------
  const loadClaims = () => {
    setLoading(true);
    axios
      .get("http://localhost:5001/api/claims")
      .then((res) => {
        setClaims(res.data);
        setLoading(false);
      })
      .catch((err) => {
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

    axios
      .put(`http://localhost:5001/api/claims/${id}`, { status })
      .then(() => {
        setClaims((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status } : c))
        );
      })
      .catch((err) => {
        console.error("Failed to update claim status:", err);
        alert("Failed to update claim status");
      });
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <Navbar />

        <h3 className="title">Claims Management</h3>
        <p style={{ marginBottom: "10px", fontWeight: "bold" }}>
          Logged in as: {adminEmail || "Unknown Admin"}
        </p>

        {loading ? (
          <p>Loading claims...</p>
        ) : (
          <table className="claims-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Policy</th>
                <th>Claim Type</th>
                <th>Amount</th>
                <th>Incident Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {claims.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No claims found
                  </td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim._id}>
                    <td>{claim.userName}</td>
                    <td>{claim.userEmail}</td>
                    <td>{claim.policyType}</td>
                    <td>{claim.claimType}</td>
                    <td>₹{claim.claimAmount}</td>
                    <td>{new Date(claim.incidentDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status ${claim.status.toLowerCase()}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td>
                      {(claim.status === "Submitted" || claim.status === "Pending") ? (
                        <>
                          <button
                            className="approve"
                            onClick={() => updateStatus(claim._id, "Approved")}
                          >
                            Approve
                          </button>
                          <button
                            className="reject"
                            onClick={() => updateStatus(claim._id, "Rejected")}
                            style={{ marginLeft: "5px" }}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span style={{ color: "gray" }}>Action done</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
