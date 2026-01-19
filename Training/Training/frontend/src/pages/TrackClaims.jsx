import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function TrackClaims() {
  const navigate = useNavigate();
  const [, setUser] = useState(null);
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchUserClaims(userData.id);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserClaims = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}/claims`);
      const data = await response.json();
      setClaims(data.claims || []);
    } catch (error) {
      toast.error("Error fetching claims");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClaimDetails = async (claimId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/claims/${claimId}`);
      const data = await response.json();
      if (response.ok) {
        setSelectedClaim(data.claim);
      } else {
        toast.error("Error fetching claim details");
      }
    } catch (error) {
      toast.error("Error fetching claim details");
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Submitted": "#2196F3",
      "Under Review": "#FF9800",
      "Approved": "#4CAF50",
      "Rejected": "#f44336",
      "Paid": "#9C27B0"
    };
    return colors[status] || "#666";
  };

  const getStatusIcon = (status) => {
    const icons = {
      "Submitted": "📝",
      "Under Review": "🔍",
      "Approved": "✅",
      "Rejected": "❌",
      "Paid": "💰"
    };
    return icons[status] || "📋";
  };

  const getRiskBadge = (fraudScore) => {
    if (fraudScore > 70) return { label: "High Risk", color: "#f44336" };
    if (fraudScore > 40) return { label: "Medium Risk", color: "#FF9800" };
    return { label: "Low Risk", color: "#4CAF50" };
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          ← Back
        </button>
        <h1 style={styles.title}>Track Claims</h1>
        <button 
          style={styles.newClaimBtn} 
          onClick={() => navigate("/file-claim")}
        >
          + New Claim
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading your claims...</div>
      ) : (
        <div style={styles.content}>
          {/* Claims List */}
          <div style={styles.claimsList}>
            <h2 style={styles.sectionTitle}>Your Claims ({claims.length})</h2>
            
            {claims.length === 0 ? (
              <div style={styles.emptyStat}>
                <div style={styles.emptyIcon}>📋</div>
                <p>No claims filed yet</p>
                <button 
                  style={styles.fileFirstBtn}
                  onClick={() => navigate("/file-claim")}
                >
                  File Your First Claim
                </button>
              </div>
            ) : (
              <div style={styles.claimsGrid}>
                {claims.map(claim => {
                  const risk = getRiskBadge(claim.fraud_score);
                  return (
                    <div
                      key={claim.id}
                      style={{
                        ...styles.claimCard,
                        ...(selectedClaim?.id === claim.id ? styles.claimCardActive : {})
                      }}
                      onClick={() => fetchClaimDetails(claim.id)}
                    >
                      <div style={styles.claimHeader}>
                        <span style={styles.claimNumber}>#{claim.claim_number}</span>
                        <span 
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: getStatusColor(claim.status)
                          }}
                        >
                          {getStatusIcon(claim.status)} {claim.status}
                        </span>
                      </div>
                      
                      <div style={styles.claimInfo}>
                        <div style={styles.claimDetail}>
                          <span style={styles.claimLabel}>Type:</span>
                          <span style={styles.claimValue}>{claim.policy_type}</span>
                        </div>
                        <div style={styles.claimDetail}>
                          <span style={styles.claimLabel}>Claim Type:</span>
                          <span style={styles.claimValue}>{claim.claim_type}</span>
                        </div>
                        <div style={styles.claimDetail}>
                          <span style={styles.claimLabel}>Amount:</span>
                          <span style={styles.claimValue}>₹{claim.claim_amount.toLocaleString()}</span>
                        </div>
                        <div style={styles.claimDetail}>
                          <span style={styles.claimLabel}>Filed:</span>
                          <span style={styles.claimValue}>
                            {new Date(claim.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {claim.fraud_score > 0 && (
                        <div 
                          style={{
                            ...styles.riskBadge,
                            backgroundColor: risk.color
                          }}
                        >
                          🔒 {risk.label} ({claim.fraud_score}%)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Claim Details */}
          {selectedClaim && (
            <div style={styles.detailsPanel}>
              <h2 style={styles.sectionTitle}>Claim Details</h2>
              
              <div style={styles.detailsCard}>
                <div style={styles.detailsHeader}>
                  <h3 style={styles.detailsTitle}>
                    Claim #{selectedClaim.claim_number}
                  </h3>
                  <span 
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(selectedClaim.status)
                    }}
                  >
                    {getStatusIcon(selectedClaim.status)} {selectedClaim.status}
                  </span>
                </div>

                <div style={styles.detailsSection}>
                  <h4 style={styles.detailsSubtitle}>Claim Information</h4>
                  <div style={styles.detailsGrid}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Policy Type:</span>
                      <span style={styles.detailValue}>{selectedClaim.policy_type}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Claim Type:</span>
                      <span style={styles.detailValue}>{selectedClaim.claim_type}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Amount:</span>
                      <span style={styles.detailValue}>
                        ₹{selectedClaim.claim_amount.toLocaleString()}
                      </span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Incident Date:</span>
                      <span style={styles.detailValue}>
                        {new Date(selectedClaim.incident_date).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div style={styles.descriptionBox}>
                    <strong>Description:</strong>
                    <p style={styles.description}>{selectedClaim.description}</p>
                  </div>
                </div>

                {/* Fraud Analysis */}
                {selectedClaim.fraud_score > 0 && (
                  <div style={styles.detailsSection}>
                    <h4 style={styles.detailsSubtitle}>🔒 Fraud Analysis</h4>
                    <div style={styles.fraudAnalysis}>
                      <div style={styles.fraudScore}>
                        <span>Risk Score:</span>
                        <div style={styles.scoreBar}>
                          <div 
                            style={{
                              ...styles.scoreProgress,
                              width: `${selectedClaim.fraud_score}%`,
                              backgroundColor: getRiskBadge(selectedClaim.fraud_score).color
                            }}
                          />
                        </div>
                        <span style={styles.scoreValue}>{selectedClaim.fraud_score}%</span>
                      </div>
                      
                      {selectedClaim.fraud_flags?.length > 0 && (
                        <div style={styles.fraudFlags}>
                          <strong>Detected Flags:</strong>
                          <ul style={styles.flagsList}>
                            {selectedClaim.fraud_flags.map((flag, idx) => (
                              <li key={idx}>⚠️ {flag}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {selectedClaim.documents?.length > 0 && (
                  <div style={styles.detailsSection}>
                    <h4 style={styles.detailsSubtitle}>📎 Uploaded Documents</h4>
                    <div style={styles.documentsList}>
                      {selectedClaim.documents.map((doc, idx) => (
                        <div key={idx} style={styles.documentItem}>
                          📄 {doc}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Claim History Timeline */}
                <div style={styles.detailsSection}>
                  <h4 style={styles.detailsSubtitle}>📍 Claim Timeline</h4>
                  <div style={styles.timeline}>
                    {selectedClaim.history?.map((entry, idx) => (
                      <div key={entry.id} style={styles.timelineItem}>
                        <div 
                          style={{
                            ...styles.timelineDot,
                            backgroundColor: getStatusColor(entry.status)
                          }}
                        />
                        <div style={styles.timelineContent}>
                          <div style={styles.timelineStatus}>
                            {getStatusIcon(entry.status)} {entry.status}
                          </div>
                          {entry.notes && (
                            <div style={styles.timelineNotes}>{entry.notes}</div>
                          )}
                          <div style={styles.timelineDate}>
                            {new Date(entry.created_at).toLocaleString()}
                          </div>
                        </div>
                        {idx < selectedClaim.history.length - 1 && (
                          <div style={styles.timelineLine} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "30px",
    gap: "20px"
  },
  backBtn: {
    padding: "10px 20px",
    backgroundColor: "#00897B",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600"
  },
  title: {
    fontSize: "32px",
    color: "#333",
    margin: 0,
    flex: 1
  },
  newClaimBtn: {
    padding: "10px 20px",
    backgroundColor: "#2196F3",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600"
  },
  loading: {
    textAlign: "center",
    fontSize: "18px",
    color: "#666",
    padding: "40px"
  },
  content: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
    maxWidth: "1400px",
    margin: "0 auto"
  },
  claimsList: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
    marginTop: 0,
    marginBottom: "20px"
  },
  emptyStat: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#666"
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px"
  },
  fileFirstBtn: {
    marginTop: "20px",
    padding: "12px 24px",
    backgroundColor: "#00897B",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer"
  },
  claimsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  claimCard: {
    padding: "20px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s",
    backgroundColor: "#fff"
  },
  claimCardActive: {
    borderColor: "#00897B",
    boxShadow: "0 4px 12px rgba(0,137,123,0.2)"
  },
  claimHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px"
  },
  claimNumber: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333"
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#fff"
  },
  claimInfo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "10px"
  },
  claimDetail: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  claimLabel: {
    fontSize: "12px",
    color: "#666"
  },
  claimValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333"
  },
  riskBadge: {
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#fff",
    marginTop: "10px",
    textAlign: "center"
  },
  detailsPanel: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    maxHeight: "calc(100vh - 140px)",
    overflowY: "auto"
  },
  detailsCard: {
    display: "flex",
    flexDirection: "column",
    gap: "25px"
  },
  detailsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "15px",
    borderBottom: "2px solid #f0f0f0"
  },
  detailsTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    margin: 0
  },
  detailsSection: {
    paddingBottom: "20px",
    borderBottom: "1px solid #f0f0f0"
  },
  detailsSubtitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#00897B",
    marginTop: 0,
    marginBottom: "15px"
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "15px"
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },
  detailLabel: {
    fontSize: "13px",
    color: "#666"
  },
  detailValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333"
  },
  descriptionBox: {
    padding: "15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    fontSize: "14px",
    lineHeight: "1.6"
  },
  description: {
    margin: "10px 0 0 0",
    color: "#666"
  },
  fraudAnalysis: {
    padding: "15px",
    backgroundColor: "#fff3cd",
    borderRadius: "8px"
  },
  fraudScore: {
    marginBottom: "15px"
  },
  scoreBar: {
    width: "100%",
    height: "20px",
    backgroundColor: "#e0e0e0",
    borderRadius: "10px",
    overflow: "hidden",
    margin: "10px 0"
  },
  scoreProgress: {
    height: "100%",
    transition: "width 0.3s"
  },
  scoreValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333"
  },
  fraudFlags: {
    fontSize: "14px"
  },
  flagsList: {
    margin: "10px 0 0 0",
    paddingLeft: "20px",
    lineHeight: "1.8"
  },
  documentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  documentItem: {
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    fontSize: "14px"
  },
  timeline: {
    position: "relative",
    paddingLeft: "30px"
  },
  timelineItem: {
    position: "relative",
    paddingBottom: "25px"
  },
  timelineDot: {
    position: "absolute",
    left: "-30px",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    border: "3px solid #fff",
    boxShadow: "0 0 0 2px #e0e0e0"
  },
  timelineLine: {
    position: "absolute",
    left: "-22px",
    top: "16px",
    width: "2px",
    height: "calc(100% - 16px)",
    backgroundColor: "#e0e0e0"
  },
  timelineContent: {
    paddingLeft: "10px"
  },
  timelineStatus: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "5px"
  },
  timelineNotes: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "5px",
    lineHeight: "1.5"
  },
  timelineDate: {
    fontSize: "12px",
    color: "#999"
  }
};
