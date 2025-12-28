import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserDashboard, cancelUserPolicy } from '../../api.js';
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('policies');
  
  // Modals
  const [selectedPolicy, setSelectedPolicy] = useState(null); // View Details
  const [cancelModal, setCancelModal] = useState(null); // { show: boolean, policy: obj, hasClaims: boolean }

  const loadData = async () => {
    try {
        const result = await getUserDashboard();
        if (result) setData(result);
    } catch (e) {
        console.error("Profile Error", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      loadData();
      if (location.state?.activeTab) {
          setActiveTab(location.state.activeTab);
      }
  }, [location]);

  // ✅ Step 1: Initiate Cancel (Check for Claims)
  const initiateCancel = (policy) => {
      // Find active claims for this specific policy
      // We assume claim.policy contains the title, but ideally claim object should have policy_id. 
      // Based on previous profile.py, we match by title string or logic if available.
      // Better way: Check data.claims array in frontend
      
      const hasPendingClaims = data.claims.some(c => 
          c.policy === policy.title && 
          ['Submitted', 'In Review'].includes(c.status)
      );

      setCancelModal({
          show: true,
          policy: policy,
          hasClaims: hasPendingClaims
      });
  };

  // ✅ Step 2: Confirm Cancel
  const confirmCancel = async () => {
      if (!cancelModal?.policy) return;
      
      const result = await cancelUserPolicy(cancelModal.policy.id);
      
      if (result.message?.toLowerCase().includes('success')) {
          setCancelModal({ ...cancelModal, success: true });
          setTimeout(() => {
              setCancelModal(null);
              loadData(); // Refresh UI
          }, 2000);
      } else {
          alert("Failed: " + result.message);
          setCancelModal(null);
      }
  };

  const getNotifIcon = (title) => {
      const t = title.toLowerCase();
      if (t.includes('claim')) return '📄';
      if (t.includes('purchased') || t.includes('buy')) return '🛒';
      if (t.includes('cancelled')) return '❌';
      return '📢';
  };

  if (loading) return <div className="loading-screen">Loading Profile...</div>;
  if (!data) return <div className="error-screen">Session expired. Please login.</div>;

  return (
    <div className="profile-wrapper">
      
      {/* SIDEBAR */}
      <div className="profile-sidebar">
        <div className="user-card">
            <div className="avatar-circle">{data.user.name.charAt(0)}</div>
            <h2>{data.user.name}</h2>
            <p className="email-text">{data.user.email}</p>
            <div className="user-details-list">
                <div className="detail-item"><span>🆔 User ID:</span><strong>{data.user.id}</strong></div>
                <div className="detail-item"><span>📅 Joined:</span><strong>2024</strong></div>
                <div className="detail-item"><span>📍 Location:</span><strong>India</strong></div>
            </div>
            <button className="edit-profile-btn" onClick={() => navigate('/risk-profile')}>✏️ Edit Risk Profile</button>
        </div>
        <div className="info-card">
            <h3>Portfolio Summary</h3>
            <div className="info-row"><span>Active Policies:</span> <strong>{data.policies.filter(p=>p.status==='active').length}</strong></div>
            <div className="info-row"><span>Claims Filed:</span> <strong>{data.claims.length}</strong></div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="profile-main">
        <div className="profile-header-row">
            <h1>My Portfolio</h1>
            <button className="dashboard-btn" onClick={() => navigate('/')}>🏠 Dashboard</button>
        </div>

        <div className="tabs-container">
            <button className={`tab-btn ${activeTab === 'policies' ? 'active' : ''}`} onClick={() => setActiveTab('policies')}>My Policies</button>
            <button className={`tab-btn ${activeTab === 'claims' ? 'active' : ''}`} onClick={() => setActiveTab('claims')}>Claims Tracker</button>
            <button className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>Inbox</button>
        </div>

        {/* POLICIES TAB */}
        {activeTab === 'policies' && (
            <div className="policies-grid">
                {data.policies.length === 0 ? (
                    <div className="empty-state">
                        <p>No active policies found.</p>
                        <button className="browse-btn" onClick={() => navigate('/policies')}>Find a Plan</button>
                    </div>
                ) : (
                    data.policies.map(policy => (
                        <div key={policy.id} className={`policy-card ${policy.status}`}>
                            <div className="card-header">
                                <span className="provider-tag">{policy.provider}</span>
                                <span className={`status-tag ${policy.status}`}>{policy.status.toUpperCase()}</span>
                            </div>
                            <h3>{policy.title}</h3>
                            <div className="policy-meta">
                                <span>Policy #: <span className="mono">{policy.policy_number}</span></span>
                                <span>Ends: <strong>{policy.end_date}</strong></span>
                            </div>
                            <div className="card-stats">
                                <div className="stat-box"><label>Premium</label><span>₹{policy.premium?.toLocaleString()}</span></div>
                                <div className="stat-box"><label>Cover</label><span>₹{policy.coverage?.toLocaleString()}</span></div>
                            </div>
                            <div className="action-footer">
                                <button className="view-btn" onClick={() => setSelectedPolicy(policy)}>View Details</button>
                                {policy.status === 'active' && (
                                    <button className="text-danger-btn" onClick={() => initiateCancel(policy)}>Cancel</button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {/* CLAIMS TAB */}
        {activeTab === 'claims' && (
            <div className="claims-wrapper">
                {data.claims.length === 0 ? <div className="empty-state">No claims history found.</div> : (
                    data.claims.map(claim => (
                        <div key={claim.id} className="claim-track-card">
                            <div className="claim-header-row">
                                <div><h4>Claim #{claim.claim_number}</h4><span className="claim-date">{claim.date}</span></div>
                                <span className={`status-badge ${claim.status.toLowerCase()}`}>{claim.status}</span>
                            </div>
                            <div className="claim-info-grid">
                                <div><strong>Policy:</strong> {claim.policy}</div>
                                <div><strong>Amount:</strong> ₹{claim.amount.toLocaleString()}</div>
                                <div style={{gridColumn:'1 / -1', color:'#64748b'}}>"{claim.description}"</div>
                            </div>
                            <div className="claim-tracker">
                                <div className={`step completed`}><div className="circle">1</div><span>Filed</span></div>
                                <div className="stepline"></div>
                                <div className={`step ${['In Review','Approved','Paid','Rejected'].includes(claim.status) ? 'completed' : ''}`}><div className="circle">2</div><span>Review</span></div>
                                <div className="stepline"></div>
                                <div className={`step ${['Approved','Paid','Rejected'].includes(claim.status) ? 'completed' : ''} ${claim.status === 'Rejected' ? 'rejected' : ''}`}>
                                    <div className="circle">3</div><span>Decision</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
            <div className="notif-wrapper">
                {data.notifications.length === 0 ? <div className="empty-state">No notifications.</div> : (
                    data.notifications.map(n => (
                        <div key={n.id} className="notif-card">
                            <div className="notif-icon-box">{getNotifIcon(n.title)}</div>
                            <div className="notif-content">
                                <h4>{n.title}</h4>
                                <p>{n.message}</p>
                                <span className="notif-time">{n.date}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}
      </div>

      {/* ✅ POLICY DETAILS MODAL */}
      {selectedPolicy && (
        <div className="modal-overlay">
            <div className="modal-content profile-modal">
                <div className="modal-header"><h2>Policy Document</h2><button className="close-btn" onClick={() => setSelectedPolicy(null)}>✕</button></div>
                <div className="modal-body">
                    <div className="policy-ledger">
                        <div className="ledger-section-title">Contract Details</div>
                        <div className="ledger-grid">
                            <div className="l-item"><label>Policy Name</label><strong>{selectedPolicy.title}</strong></div>
                            <div className="l-item"><label>Policy Number</label><strong className="mono">{selectedPolicy.policy_number}</strong></div>
                            <div className="l-item"><label>Start Date</label><strong>{selectedPolicy.start_date}</strong></div>
                            <div className="l-item"><label>End Date</label><strong>{selectedPolicy.end_date}</strong></div>
                        </div>
                        <div className="ledger-section-title">Financials</div>
                        <div className="ledger-row large"><span>Sum Insured</span><strong>₹{selectedPolicy.coverage.toLocaleString()}</strong></div>
                        <div className="ledger-row"><span>Annual Premium</span><span>₹{selectedPolicy.premium.toLocaleString()}</span></div>
                    </div>
                </div>
                <div className="modal-footer"><button className="download-btn">⬇ Download PDF</button></div>
            </div>
        </div>
      )}

      {/* ✅ CANCELLATION WARNING MODAL */}
      {cancelModal && (
        <div className="modal-overlay">
            <div className="modal-content danger-modal">
                {!cancelModal.success ? (
                    <>
                        <div className="danger-header">
                            <div className="danger-icon">⚠️</div>
                            <h2>{cancelModal.hasClaims ? "Critical Warning" : "Cancel Policy?"}</h2>
                        </div>
                        <div className="danger-body">
                            <p>You are about to cancel <strong>{cancelModal.policy.title}</strong>.</p>
                            {cancelModal.hasClaims && (
                                <div className="warning-box">
                                    <strong>⛔ CLAIM REVOCATION ALERT</strong>
                                    <p>You have pending claims under this policy. Cancelling now will <u>immediately revoke</u> all active claims and you will forfeit any reimbursement.</p>
                                </div>
                            )}
                            <p>This action cannot be undone. Are you sure?</p>
                        </div>
                        <div className="danger-footer">
                            <button className="btn-secondary" onClick={() => setCancelModal(null)}>Keep Policy</button>
                            <button className="btn-danger" onClick={confirmCancel}>
                                {cancelModal.hasClaims ? "Yes, Revoke Claims & Cancel" : "Yes, Cancel Policy"}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="success-body">
                        <div className="success-icon">✅</div>
                        <h3>Policy Cancelled</h3>
                        <p>Your policy has been terminated.</p>
                    </div>
                )}
            </div>
        </div>
      )}

    </div>
  );
};

export default UserProfile;