import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import axios from "axios";
import "./dashboard.css";

function Dashboard() {
  const [claims, setClaims] = useState([]);

  // FETCH USER CLAIMS
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/claims")
      .then((res) => setClaims(res.data))
      .catch((err) => console.log(err));
  }, []);

  // UPDATE CLAIM STATUS
  const updateStatus = (id, status) => {
    axios
      .post("http://localhost:5000/api/claims/update", { id, status })
      .then(() => {
        setClaims(
          claims.map((claim) =>
            claim.id === id ? { ...claim, status } : claim
          )
        );
      });
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <Navbar />

        <h3 className="title">Claims Management</h3>

        <table className="claims-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Policy</th>
              <th>Claim Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id}>
                <td>{claim.userName}</td>
                <td>{claim.policyName}</td>
                <td>₹{claim.claimAmount}</td>
                <td>{claim.claimDate}</td>
                <td>
                  <span className={`status ${claim.status.toLowerCase()}`}>
                    {claim.status}
                  </span>
                </td>
                <td>
                  {claim.status === "Pending" && (
                    <>
                      <button
                        className="approve"
                        onClick={() => updateStatus(claim.id, "Approved")}
                      >
                        Approve
                      </button>

                      <button
                        className="reject"
                        onClick={() => updateStatus(claim.id, "Rejected")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
