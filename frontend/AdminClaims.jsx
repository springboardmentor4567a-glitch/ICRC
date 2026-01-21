import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";

export default function AdminClaims() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("claims");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("No access token found - redirecting to login");
      navigate('/login');
      return;
    }

    fetchClaims();
    // Real-time updates every 30 seconds
    const interval = setInterval(fetchClaims, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchClaims = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.error("No access token found");
      alert("Admin login required");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        "/api/admin/claims",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setClaims(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching claims:", error);
      setLoading(false);
    }
  };

  const handleNavigation = (path) => {
    if (path === "/admin/claims") {
      setActiveTab("claims");
    } else {
      navigate(path);
    }
  };

  const updateStatus = async (id, newStatus) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Admin login required");
      return;
    }

    try {
      await axios.put(
        `http://127.0.0.1:5000/api/admin/claims/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchClaims(); // refresh list
      alert(`Claim ${newStatus} successfully`);
    } catch (error) {
      console.error("Error updating claim status:", error);
      alert("Failed to update claim status");
    }
  };

  const openModal = (claim) => {
    setSelectedClaim(claim);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClaim(null);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getFraudRiskColor = (score) => {
    if (score >= 0.8) return '#ef4444';
    if (score >= 0.5) return '#f59e0b';
    return '#10b981';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading claims...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header Navigation */}
      <header className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-title">Admin Panel</h1>
          <nav className="admin-nav">
            <button
              className="admin-nav-btn"
              onClick={() => handleNavigation("/admin/dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`admin-nav-btn ${activeTab === "claims" ? "active" : ""}`}
              onClick={() => handleNavigation("/admin/claims")}
            >
              Claims
            </button>
            <button
              className="admin-nav-btn"
              onClick={() => handleNavigation("/admin/management")}
            >
              Management
            </button>
            <button
              className="admin-nav-btn"
              onClick={() => handleNavigation("/policies")}
            >
              Policies
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        <section className="dashboard-overview">
          <h2 className="overview-title">Claims Management</h2>

          {/* Claims Table */}
          <div className="claims-table-container">
            <table className="claims-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Claim Number</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Fraud Score</th>
                  <th>Incident Date</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(claim => (
                  <tr key={claim.id}>
                    <td>{claim.user_id}</td>
                    <td className="claim-number">{claim.claim_number}</td>
                    <td>{claim.claim_type}</td>
                    <td>{claim.description || 'No description'}</td>
                    <td className="amount">{formatCurrency(claim.amount_claimed)}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(claim.status) }}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className="fraud-score"
                        style={{ color: getFraudRiskColor(claim.fraud_score) }}
                      >
                        {(claim.fraud_score * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td>{formatDate(claim.incident_date)}</td>
                    <td>{formatDate(claim.created_at)}</td>
                    <td className="actions">
                      <button
                        className="action-btn-small view"
                        onClick={() => openModal(claim)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {claims.length === 0 && (
            <div className="no-claims">
              <p>No claims found</p>
            </div>
          )}

          {/* Claim Details Modal */}
          {showModal && selectedClaim && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Claim Details</h3>
                <div className="modal-details">
                  <p><strong>Claim Number:</strong> {selectedClaim.claim_number}</p>
                  <p><strong>User ID:</strong> {selectedClaim.user_id}</p>
                  <p><strong>Type:</strong> {selectedClaim.claim_type}</p>
                  <p><strong>Amount Claimed:</strong> {formatCurrency(selectedClaim.amount_claimed)}</p>
                  <p><strong>Status:</strong> <span className="status-badge" style={{ backgroundColor: getStatusColor(selectedClaim.status) }}>{selectedClaim.status}</span></p>
                  <p><strong>Fraud Score:</strong> <span className="fraud-score" style={{ color: getFraudRiskColor(selectedClaim.fraud_score) }}>{(selectedClaim.fraud_score * 100).toFixed(1)}%</span></p>
                  <p><strong>Incident Date:</strong> {formatDate(selectedClaim.incident_date)}</p>
                  <p><strong>Created Date:</strong> {formatDate(selectedClaim.created_at)}</p>
                </div>
                <div className="modal-actions">
                  {selectedClaim.status === 'pending' && (
                    <>
                      <button
                        className="action-btn-small approve"
                        onClick={() => updateStatus(selectedClaim.id, 'approved')}
                      >
                        Accept
                      </button>
                      <button
                        className="action-btn-small reject"
                        onClick={() => updateStatus(selectedClaim.id, 'rejected')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    className="action-btn-small"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
