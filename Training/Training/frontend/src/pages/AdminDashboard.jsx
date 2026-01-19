// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminDashboard.css";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [policyForm, setPolicyForm] = useState({
    policy_name: "",
    policy_type: "Health",
    provider: "",
    coverage_amount: "",
    premium_monthly: "",
    premium_yearly: "",
    deductible: "",
    rating: 4.0,
    description: "",
    features: ""
  });
  const [stats, setStats] = useState({
    totalClaims: 0,
    totalUsers: 0,
    totalPolicies: 0,
    pendingClaims: 0,
    totalClaimAmount: 0,
  });

  // Check admin authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminEmail = localStorage.getItem("adminEmail");
    if (!token || !adminEmail) {
      navigate("/");
    }
  }, [navigate]);

  // Fetch all data
  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboardData();
    } else if (activeTab === "claims") {
      fetchAllClaims();
    } else if (activeTab === "policies") {
      fetchAllPolicies();
    } else if (activeTab === "users") {
      fetchAllUsers();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [claimsRes, policiesRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/all-claims`),
        fetch(`${API_BASE_URL}/policies`),
        fetch(`${API_BASE_URL}/admin/all-users`),
      ]);

      let totalClaims = 0,
        pendingClaims = 0,
        totalClaimAmount = 0;
      let totalPolicies = 0;
      let totalUsers = 0;

      if (claimsRes.ok) {
        const data = await claimsRes.json();
        if (data.claims) {
          totalClaims = data.claims.length;
          pendingClaims = data.claims.filter(
            (c) => c.status === "Submitted" || c.status === "Under Review"
          ).length;
          totalClaimAmount = data.claims.reduce(
            (sum, c) => sum + (c.claim_amount || 0),
            0
          );
        }
      }

      if (policiesRes.ok) {
        const data = await policiesRes.json();
        totalPolicies = data.policies ? data.policies.length : 0;
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        totalUsers = data.users ? data.users.length : 0;
      }

      setStats({
        totalClaims,
        totalUsers,
        totalPolicies,
        pendingClaims,
        totalClaimAmount,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllClaims = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/all-claims`);
      if (res.ok) {
        const data = await res.json();
        setClaims(data.claims || []);
      }
    } catch {
      toast.error("Error fetching claims");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPolicies = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/policies`);
      if (res.ok) {
        const data = await res.json();
        setPolicies(data.policies || []);
      }
    } catch {
      toast.error("Error fetching policies");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/all-users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const updateClaimStatus = async (claimId, newStatus, notes = "") => {
    try {
      const res = await fetch(`${API_BASE_URL}/claims/${claimId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes }),
      });

      if (res.ok) {
        toast.success("Claim status updated");
        fetchAllClaims();
        setSelectedClaim(null);
      } else {
        toast.error("Failed to update claim");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Error updating claim");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminEmail");
    navigate("/");
  };

  const openAddPolicyModal = () => {
    setEditingPolicy(null);
    setPolicyForm({
      policy_name: "",
      policy_type: "Health",
      provider: "",
      coverage_amount: "",
      premium_monthly: "",
      premium_yearly: "",
      deductible: "",
      rating: 4.0,
      description: "",
      features: ""
    });
    setShowPolicyModal(true);
  };

  const openEditPolicyModal = (policy) => {
    setEditingPolicy(policy);
    setPolicyForm({
      policy_name: policy.policy_name || "",
      policy_type: policy.policy_type || "Health",
      provider: policy.provider || "",
      coverage_amount: policy.coverage_amount || "",
      premium_monthly: policy.premium_monthly || "",
      premium_yearly: policy.premium_yearly || "",
      deductible: policy.deductible || "",
      rating: policy.rating || 4.0,
      description: policy.description || "",
      features: typeof policy.features === 'string' ? policy.features : JSON.stringify(policy.features || [])
    });
    setShowPolicyModal(true);
  };

  const handlePolicySubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingPolicy 
        ? `${API_BASE_URL}/admin/policies/${editingPolicy.id}`
        : `${API_BASE_URL}/admin/policies`;
      
      const method = editingPolicy ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policyForm),
      });

      if (res.ok) {
        toast.success(editingPolicy ? "Policy updated successfully" : "Policy added successfully");
        setShowPolicyModal(false);
        fetchAllPolicies();
      } else {
        toast.error("Failed to save policy");
      }
    } catch (err) {
      toast.error("Error saving policy");
    }
  };

  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/admin/policies/${policyId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Policy deleted successfully");
        fetchAllPolicies();
      } else {
        toast.error("Failed to delete policy");
      }
    } catch (err) {
      toast.error("Error deleting policy");
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <h1>🔐 Admin Panel</h1>
          <p>Insurance Management System</p>
        </div>
        <div className="header-right">
          <span className="admin-user">
            Admin: {localStorage.getItem("adminEmail")}
          </span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-nav">
        <button
          className={`nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Dashboard
        </button>
        <button
          className={`nav-tab ${activeTab === "claims" ? "active" : ""}`}
          onClick={() => setActiveTab("claims")}
        >
          📋 Claims Management
        </button>
        <button
          className={`nav-tab ${activeTab === "policies" ? "active" : ""}`}
          onClick={() => setActiveTab("policies")}
        >
          📑 Policies
        </button>
        <button
          className={`nav-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Users
        </button>
      </nav>

      {/* Content */}
      <main className="admin-content">
        {loading && <div className="loading">Loading...</div>}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && !loading && (
          <div className="dashboard-section">
            <h2>Dashboard Overview</h2>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Claims</h3>
                <p className="stat-number">{stats.totalClaims}</p>
                <span className="stat-label">All claims filed</span>
              </div>

              <div className="stat-card pending">
                <h3>Pending Claims</h3>
                <p className="stat-number">{stats.pendingClaims}</p>
                <span className="stat-label">Awaiting review</span>
              </div>

              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-number">{stats.totalUsers}</p>
                <span className="stat-label">Registered users</span>
              </div>

              <div className="stat-card">
                <h3>Total Policies</h3>
                <p className="stat-number">{stats.totalPolicies}</p>
                <span className="stat-label">Available policies</span>
              </div>

              <div className="stat-card highlight">
                <h3>Total Claim Value</h3>
                <p className="stat-number">₹{stats.totalClaimAmount.toLocaleString()}</p>
                <span className="stat-label">Across all claims</span>
              </div>
            </div>
          </div>
        )}

        {/* Claims Management Tab */}
        {activeTab === "claims" && !loading && (
          <div className="claims-section">
            <h2>Claims Management</h2>

            {selectedClaim ? (
              <div className="claim-detail">
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="btn-back"
                >
                  ← Back to Claims
                </button>

                <div className="claim-info">
                  <h3>Claim #{selectedClaim.claim_number}</h3>
                  <div className="detail-grid">
                    <div>
                      <label>User ID:</label>
                      <p>{selectedClaim.user_id}</p>
                    </div>
                    <div>
                      <label>Policy Type:</label>
                      <p>{selectedClaim.policy_type}</p>
                    </div>
                    <div>
                      <label>Claim Type:</label>
                      <p>{selectedClaim.claim_type}</p>
                    </div>
                    <div>
                      <label>Amount:</label>
                      <p>₹{selectedClaim.claim_amount}</p>
                    </div>
                    <div>
                      <label>Status:</label>
                      <p className={`status ${selectedClaim.status.toLowerCase()}`}>
                        {selectedClaim.status}
                      </p>
                    </div>
                    <div>
                      <label>Incident Date:</label>
                      <p>{new Date(selectedClaim.incident_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="description-box">
                    <h4>Description</h4>
                    <p>{selectedClaim.description}</p>
                  </div>

                  <div className="fraud-analysis">
                    <h4>Fraud Analysis</h4>
                    <div className="fraud-score">
                      <span>Fraud Score: {selectedClaim.fraud_score}/100</span>
                      <div className="score-bar">
                        <div
                          className="score-fill"
                          style={{
                            width: `${selectedClaim.fraud_score}%`,
                            backgroundColor:
                              selectedClaim.fraud_score > 70
                                ? "#dc3545"
                                : selectedClaim.fraud_score > 40
                                ? "#ff9800"
                                : "#28a745",
                          }}
                        ></div>
                      </div>
                    </div>
                    {selectedClaim.fraud_flags &&
                      selectedClaim.fraud_flags.length > 0 && (
                        <div className="flags">
                          <strong>Flags:</strong>
                          {selectedClaim.fraud_flags.map((flag, i) => (
                            <span key={i} className="flag">
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>

                  <div className="action-buttons">
                    <button
                      onClick={() =>
                        updateClaimStatus(selectedClaim.id, "Approved")
                      }
                      className="btn-approve"
                    >
                      ✓ Approve Claim
                    </button>
                    <button
                      onClick={() =>
                        updateClaimStatus(selectedClaim.id, "Rejected")
                      }
                      className="btn-reject"
                    >
                      ✗ Reject Claim
                    </button>
                    <button
                      onClick={() =>
                        updateClaimStatus(selectedClaim.id, "Paid")
                      }
                      className="btn-paid"
                    >
                      💰 Mark as Paid
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="claims-table">
                <table>
                  <thead>
                    <tr>
                      <th>Claim #</th>
                      <th>User ID</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Fraud Score</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((claim) => (
                      <tr key={claim.id}>
                        <td>{claim.claim_number}</td>
                        <td>{claim.user_id}</td>
                        <td>{claim.claim_type}</td>
                        <td>₹{claim.claim_amount}</td>
                        <td>
                          <span
                            className={`status-badge ${claim.status.toLowerCase()}`}
                          >
                            {claim.status}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`fraud-badge ${
                              claim.fraud_score > 70
                                ? "high"
                                : claim.fraud_score > 40
                                ? "medium"
                                : "low"
                            }`}
                          >
                            {claim.fraud_score}
                          </span>
                        </td>
                        <td>{new Date(claim.created_at).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => setSelectedClaim(claim)}
                            className="btn-view"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Policies Tab */}
        {activeTab === "policies" && !loading && (
          <div className="policies-section">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h2>Insurance Policies</h2>
              <button onClick={openAddPolicyModal} className="btn-add-policy" style={{background: '#4CAF50', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
                + Add New Policy
              </button>
            </div>

            <div className="policies-grid">
              {policies.map((policy) => (
                <div key={policy.id} className="policy-card">
                  <h3>{policy.policy_name}</h3>
                  <div className="policy-meta">
                    <span className="badge">{policy.policy_type}</span>
                    <span className="provider">{policy.provider}</span>
                  </div>

                  <div className="policy-details">
                    <p>
                      <strong>Coverage:</strong> ₹
                      {policy.coverage_amount.toLocaleString()}
                    </p>
                    <p>
                      <strong>Monthly Premium:</strong> ₹{policy.premium_monthly}
                    </p>
                    <p>
                      <strong>Yearly Premium:</strong> ₹{policy.premium_yearly}
                    </p>
                    <p>
                      <strong>Deductible:</strong> ₹{policy.deductible}
                    </p>
                    <p>
                      <strong>Rating:</strong> ⭐ {policy.rating}/5
                    </p>
                  </div>

                  {policy.features && (
                    <div className="features">
                      <h4>Features:</h4>
                      <ul>
                        {(typeof policy.features === "string"
                          ? JSON.parse(policy.features)
                          : policy.features
                        ).map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                    <button onClick={() => openEditPolicyModal(policy)} className="btn-edit" style={{flex: 1}}>Edit Policy</button>
                    <button onClick={() => handleDeletePolicy(policy.id)} className="btn-delete" style={{flex: 1, background: '#f44336'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Policy Modal */}
        {showPolicyModal && (
          <div className="modal-overlay" onClick={() => setShowPolicyModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'}}>
              <h2>{editingPolicy ? "Edit Policy" : "Add New Policy"}</h2>
              <form onSubmit={handlePolicySubmit}>
                <div className="form-group">
                  <label>Policy Name *</label>
                  <input type="text" value={policyForm.policy_name} onChange={(e) => setPolicyForm({...policyForm, policy_name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Policy Type *</label>
                  <select value={policyForm.policy_type} onChange={(e) => setPolicyForm({...policyForm, policy_type: e.target.value})} required>
                    <option value="Health">Health</option>
                    <option value="Life">Life</option>
                    <option value="Auto">Auto</option>
                    <option value="Home">Home</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Provider *</label>
                  <input type="text" value={policyForm.provider} onChange={(e) => setPolicyForm({...policyForm, provider: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Coverage Amount *</label>
                  <input type="number" value={policyForm.coverage_amount} onChange={(e) => setPolicyForm({...policyForm, coverage_amount: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Monthly Premium *</label>
                  <input type="number" value={policyForm.premium_monthly} onChange={(e) => setPolicyForm({...policyForm, premium_monthly: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Yearly Premium *</label>
                  <input type="number" value={policyForm.premium_yearly} onChange={(e) => setPolicyForm({...policyForm, premium_yearly: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Deductible *</label>
                  <input type="number" value={policyForm.deductible} onChange={(e) => setPolicyForm({...policyForm, deductible: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Rating (0-5) *</label>
                  <input type="number" step="0.1" min="0" max="5" value={policyForm.rating} onChange={(e) => setPolicyForm({...policyForm, rating: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={policyForm.description} onChange={(e) => setPolicyForm({...policyForm, description: e.target.value})} rows="3" />
                </div>
                <div className="form-group">
                  <label>Features (JSON array or comma-separated)</label>
                  <textarea value={policyForm.features} onChange={(e) => setPolicyForm({...policyForm, features: e.target.value})} rows="3" placeholder='["Feature 1", "Feature 2"] or Feature 1, Feature 2' />
                </div>
                <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                  <button type="submit" className="btn-primary" style={{flex: 1}}>Save Policy</button>
                  <button type="button" onClick={() => setShowPolicyModal(false)} className="btn-secondary" style={{flex: 1}}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && !loading && (
          <div className="users-section">
            <h2>Registered Users</h2>

            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Mobile</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.username}</td>
                      <td>{user.mobile}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            user.is_active ? "active" : "inactive"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
