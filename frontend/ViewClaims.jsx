import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { fetchWithAuth } from "./apiClient";
import "./view-claims.css";

export default function ViewClaims() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimDetails, setClaimDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetchWithAuth('/api/user/claims');
        if (response.ok) {
          const claimsData = await response.json();
          console.log('Claims data received:', claimsData); // Debug log
          setClaims(claimsData);
          // Generate notifications for recent status changes
          generateNotifications(claimsData);
        } else {
          console.error("Failed to fetch claims");
          if (response.status === 401) {
            alert("Please login to view your claims");
          }
        }
      } catch (error) {
        console.error("Error fetching claims:", error);
        alert("Error fetching claims");
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  const generateNotifications = (claimsData) => {
    const newNotifications = [];
    claimsData.forEach(claim => {
      if (claim.tracking_history && claim.tracking_history.length > 0) {
        const latestUpdate = claim.tracking_history[claim.tracking_history.length - 1];
        const updateDate = new Date(latestUpdate.timestamp);
        const now = new Date();
        const daysSinceUpdate = Math.floor((now - updateDate) / (1000 * 60 * 60 * 24));

        if (daysSinceUpdate <= 7) { // Show notifications for updates within last 7 days
          newNotifications.push({
            id: `claim-${claim.id}-${latestUpdate.timestamp}`,
            type: 'claim_update',
            title: `Claim ${claim.id} Update`,
            message: `${claim.status}: ${latestUpdate.notes}`,
            timestamp: latestUpdate.timestamp,
            claimId: claim.id
          });
        }
      }
    });
    setNotifications(newNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'under review': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'submitted': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const fetchClaimDetails = async (claimId) => {
    setDetailsLoading(true);
    try {
      const response = await fetchWithAuth(`/api/claims/${claimId}`);
      if (response.ok) {
        const data = await response.json();
        setClaimDetails(data);
      } else {
        alert("Failed to fetch claim details");
      }
    } catch (error) {
      console.error("Error fetching claim details:", error);
      alert("Error fetching claim details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewTracking = (claim) => {
    if (selectedClaim?.id === claim.id) {
      setSelectedClaim(null);
      setClaimDetails(null);
    } else {
      setSelectedClaim(claim);
      fetchClaimDetails(claim.id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="claim-submission-page">
        <div className="loading-spinner">Loading claims...</div>
      </div>
    );
  }

  return (
    <div className="claim-submission-page">
      <header className="page-header">
        <h2>Your Claims & Tracking</h2>
        <div>
          <button onClick={() => window.history.back()}>Back</button>
          <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        </div>
      </header>

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <div className="notifications-section">
          <h3>Recent Updates</h3>
          <div className="notifications-list">
            {notifications.map(notification => (
              <div key={notification.id} className="notification-item">
                <div className="notification-icon">📢</div>
                <div className="notification-content">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <small>{formatDate(notification.timestamp)}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="claims-container">
        {claims.length === 0 ? (
          <div className="no-claims">
            <p>No claims found.</p>
            <button onClick={() => navigate("/claims")}>Submit New Claim</button>
          </div>
        ) : (
          <div className="claims-grid">
            {claims.map((claim) => (
              <div key={claim.claim_id} className="claim-card">
                <div className="claim-header">
                  <h3>Claim #{claim.claim_id}</h3>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(claim.status) }}
                  >
                    {claim.status}
                  </span>
                </div>

                <div className="claim-details">
                  <div className="detail-row">
                    <span className="label">Policy:</span>
                    <span className="value">{claim.policy_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Amount:</span>
                    <span className="value">₹{claim.amount_claimed?.toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Submitted:</span>
                    <span className="value">{formatDate(claim.created_at)}</span>
                  </div>
                </div>

                <div className="claim-actions">
                  <button onClick={() => handleViewTracking(claim)}>View Tracking Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tracking Details Modal/Section */}
      {selectedClaim && (
        <div className="tracking-details-modal">
          <div className="tracking-details-content">
            <div className="tracking-header">
              <h3>Tracking Details for Claim #{selectedClaim.claim_id}</h3>
              <button onClick={() => setSelectedClaim(null)}>×</button>
            </div>

            {detailsLoading ? (
              <div className="loading-spinner">Loading tracking details...</div>
            ) : claimDetails ? (
              <div className="tracking-content">
                <div className="claim-info">
                  <h4>Claim Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Policy:</span>
                      <span className="value">{claimDetails.insurance_type || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Claim Type:</span>
                      <span className="value">{claimDetails.claim_type}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Amount Claimed:</span>
                      <span className="value">₹{claimDetails.claim_amount?.toLocaleString()}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Incident Date:</span>
                      <span className="value">{claimDetails.incident_date ? formatDate(claimDetails.incident_date) : 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Status:</span>
                      <span className="value">{claimDetails.status}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Description:</span>
                      <span className="value">{claimDetails.description || 'No description'}</span>
                    </div>
                  </div>
                </div>

                <div className="tracking-history">
                  <h4>Tracking History</h4>
                  {claimDetails.tracking_history && claimDetails.tracking_history.length > 0 ? (
                    <div className="timeline">
                      {claimDetails.tracking_history.map((step, index) => (
                        <div key={index} className="timeline-item">
                          <div className="timeline-marker"></div>
                          <div className="timeline-content">
                            <div className="timeline-step">{step.step}</div>
                            <div className="timeline-date">{formatDate(step.date)}</div>
                            {step.notes && <div className="timeline-notes">{step.notes}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No tracking history available.</p>
                  )}
                </div>

                {claimDetails.documents && claimDetails.documents.length > 0 && (
                  <div className="documents-section">
                    <h4>Documents</h4>
                    <div className="documents-list">
                      {claimDetails.documents.map((doc, index) => (
                        <div key={index} className="document-item">
                          <span className="doc-name">{doc.file_name}</span>
                          <span className="doc-type">({doc.document_type})</span>
                          {doc.uploaded_at && (
                            <span className="doc-date">Uploaded: {formatDate(doc.uploaded_at)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p>Failed to load tracking details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
