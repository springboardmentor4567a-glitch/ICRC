import React, { useEffect, useState, useCallback } from 'react';
import { listAdminClaims, decideClaim, getUserFullProfile } from '../../adminApi';
import AdminHeader from './AdminHeader';
import './admin.css';

const API_BASE = "http://localhost:5000/api"; 

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ status: '', severity: '' });
  
  // UI States
  const [verdictModal, setVerdictModal] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [isReevaluating, setIsReevaluating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await listAdminClaims({ ...filters, page: 1, per_page: 50 });
      setClaims(res.items || []);
    } catch (e) { console.error(e); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const showToast = (message, type = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
  };

  const openCase = (c) => {
      // ✅ STRICT RE-CLAIM DETECTION
      // Only count rejections if they are for the SAME Policy AND Same Incident Date
      const sameIncidentRejections = claims.filter(prev => 
          prev.user_id === c.user_id && 
          prev.policy_id === c.policy_id && 
          prev.status === 'Rejected' &&
          prev.incident_date === c.incident_date && // ✅ Match specific incident
          prev.id !== c.id // Don't count self
      );

      const isReclaim = sameIncidentRejections.length > 0;

      setSelected({ 
          ...c, 
          isReclaim, 
          historyCount: sameIncidentRejections.length 
      });
      
      setIsReevaluating(false);
      setAdminComment('');
  };

  const handleViewProfile = async () => {
      if(!selected || !selected.user_id) return;
      setLoadingProfile(true);
      const data = await getUserFullProfile(selected.user_id);
      setLoadingProfile(false);
      if(data) setUserProfile(data);
      else showToast("Failed to load user profile", "error");
  };

  const toggleFlagIgnore = async (flagId) => {
      const token = localStorage.getItem('access_token');
      try {
          const res = await fetch(`${API_BASE}/admin/flags/${flagId}/toggle`, {
              method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
          });
          if(res.ok) {
              const data = await res.json();
              setSelected(prev => ({
                  ...prev,
                  fraud_flags: prev.fraud_flags.map(f => f.id === flagId ? { ...f, is_ignored: data.is_ignored } : f)
              }));
              setClaims(prev => prev.map(c => 
                  c.id === selected.id ? {
                      ...c,
                      fraud_flags: c.fraud_flags.map(f => f.id === flagId ? { ...f, is_ignored: data.is_ignored } : f)
                  } : c
              ));
              showToast(data.is_ignored ? "Flag Ignored" : "Flag Restored", "info");
          }
      } catch (e) { showToast("Network Error", "error"); }
  };

  const handleReAnalyze = async () => {
      setAnalyzing(true);
      const token = localStorage.getItem('access_token');
      try {
          const res = await fetch(`${API_BASE}/admin/claims/${selected.id}/reanalyze`, { 
              method: 'POST', headers: { 'Authorization': `Bearer ${token}` } 
          });
          if (res.ok) {
              const data = await res.json();
              setSelected(prev => ({ ...prev, fraud_flags: data.new_flags || [] }));
              load();
              showToast("Analysis Updated!", "success");
          }
      } catch (e) { showToast("Server Error", "error"); }
      setAnalyzing(false);
  };

  const triggerDismiss = (flagId) => {
      setConfirmModal({
          title: "Ignore Risk Factor?",
          message: "This will remove the flag from the score calculation.",
          onConfirm: () => { toggleFlagIgnore(flagId); setConfirmModal(null); }
      });
  };

  const calculateRiskScore = (flags = []) => {
      let score = 0;
      flags.forEach(f => {
          if (f.is_ignored) return; 
          if (f.rule === 'SAME_DAY_CLAIM') score += 50; 
          else if (f.rule === 'MISSING_EVIDENCE') score += 40;
          else if (f.severity === 'high') score += 30;
          else if (f.severity === 'medium') score += 15;
          else score += 5;
      });
      return Math.min(score, 100);
  };

  const getRiskStyle = (score) => {
      if (score >= 75) return { label: 'CRITICAL', class: 'critical', rowClass: 'row-critical', color: '#ef4444' };
      if (score >= 40) return { label: 'WARNING', class: 'warning', rowClass: 'row-warning', color: '#f59e0b' };
      return { label: 'SAFE', class: 'safe', rowClass: 'row-safe', color: '#10b981' };
  };

  const initiateDecision = (id, action) => {
      setAdminComment(''); 
      let isReversal = false;
      let prevStatus = selected.status;
      if (prevStatus === 'Approved' && action === 'reject') isReversal = true;
      if (prevStatus === 'Rejected' && action === 'approve') isReversal = true;
      setVerdictModal({ id, action, isReversal, prevStatus });
  };

  const submitVerdict = async () => {
      if(!verdictModal) return;
      setIsSubmitting(true);
      try {
          const res = await decideClaim(verdictModal.id, verdictModal.action, adminComment);
          if (res && res.status) {
              showToast(`Claim ${verdictModal.action === 'approve' ? 'Approved' : 'Rejected'}`, "success");
              setVerdictModal(null); setSelected(null); load();
          } else { showToast("Failed to save decision.", "error"); }
      } catch (e) { showToast("Network Error", "error"); } finally { setIsSubmitting(false); }
  };

  const handleViewDoc = async (docId) => {
      const token = localStorage.getItem('access_token');
      try {
          const response = await fetch(`${API_BASE}/claims/document/${docId}`, { headers: { 'Authorization': `Bearer ${token}` } });
          if(response.ok) window.open(window.URL.createObjectURL(await response.blob()), '_blank');
          else showToast("Error loading document", "error");
      } catch (e) { showToast("Network Error", "error"); }
  };

  return (
    <div className="admin-container">
      <AdminHeader title="Claims Investigation" active="claims" />
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.message}</div>}

      <div className="filter-tabs-container">
          <div className="filter-tabs">
              {['', 'Submitted', 'Approved', 'Rejected'].map(status => (
                  <button key={status} className={`filter-tab-btn ${filters.status === status ? 'active' : ''}`} onClick={() => setFilters({...filters, status})}>
                      {status === '' ? 'All Claims' : status === 'Submitted' ? 'Pending' : status}
                  </button>
              ))}
          </div>
          <select className="risk-select" onChange={e=>setFilters({...filters, severity:e.target.value})}>
              <option value="">Risk: All</option><option value="high">High Risk</option>
          </select>
      </div>

      <div className="table-card">
        <table className="admin-table">
            <thead><tr><th>Risk Score</th><th>Claim ID</th><th>User</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
                {claims.map(c => {
                    const score = calculateRiskScore(c.fraud_flags);
                    const risk = getRiskStyle(score);
                    return (
                        <tr key={c.id} className={risk.rowClass} onClick={() => openCase(c)}>
                            <td><span className={`risk-badge ${risk.class}`}>{score}/100 {risk.label}</span></td>
                            <td style={{fontFamily:'monospace', fontWeight:700}}>{c.claim_number}</td>
                            <td className="user-cell"><div>{c.user}</div><div style={{fontSize:'0.8rem', color:'#64748b'}}>{c.user_email}</div></td>
                            <td style={{fontWeight:700, color:'#4f46e5'}}>₹{c.amount.toLocaleString()}</td>
                            <td><span className={`status-pill ${c.status.toLowerCase()}`}>{c.status}</span></td>
                            <td><button className="btn small secondary">Open Case</button></td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="case-file-modal" onClick={e => e.stopPropagation()}>
                <div className={`case-header ${getRiskStyle(calculateRiskScore(selected.fraud_flags)).class}-border`}>
                    <div className="case-title">
                        <h3>Case #{selected.claim_number}</h3>
                        
                        {/* ✅ STRICT RE-CLAIM BADGE */}
                        {selected.isReclaim && (
                            <span className="reclaim-badge">
                                ⚠️ RE-FILED CLAIM ({selected.historyCount} Prior Rejections for this Incident)
                            </span>
                        )}
                    </div>
                    <button className="close-icon-btn" onClick={() => setSelected(null)}>✕</button>
                </div>

                <div className="case-body-grid">
                    <div className="case-column main-col">
                        <div className="data-widget">
                            <h4 className="widget-title">Claimant Details</h4>
                            <div className="detail-grid">
                                <div className="info-box">
                                    <label>User</label><p>{selected.user}</p>
                                    <button className="btn small secondary" style={{marginTop:'5px', width:'100%'}} onClick={handleViewProfile}>View Profile</button>
                                </div>
                                <div className="info-box"><label>Policy</label><p style={{color:'#4f46e5'}}>{selected.policy_purchase?.title}</p></div>
                                <div className="info-box"><label>Claim</label><p className="highlight-amount">₹{selected.amount.toLocaleString()}</p></div>
                                <div className="info-box"><label>Incident Date</label><p>{selected.incident_date}</p></div>
                            </div>
                        </div>
                        
                        <div className="data-widget">
                            <h4 className="widget-title">Evidence Files</h4>
                            <div className="evidence-grid">
                                {(selected.documents || []).length === 0 && <span className="muted">No files attached.</span>}
                                {(selected.documents || []).map(d => (
                                    <div key={d.id} className="doc-tile" onClick={() => handleViewDoc(d.id)}>
                                        <div className="doc-icon">📄</div>
                                        <div><strong>{d.file_name}</strong><br/><small style={{color:'#4f46e5'}}>Click to View</small></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="case-column side-col">
                        <div className="data-widget" style={{textAlign:'center'}}>
                            <h4 className="widget-title">Risk Analysis</h4>
                            <div style={{fontSize:'3.5rem', fontWeight:900, color: getRiskStyle(calculateRiskScore(selected.fraud_flags)).color}}>
                                {calculateRiskScore(selected.fraud_flags)}%
                            </div>
                            <div style={{fontWeight:700, color:'#64748b', marginBottom:'15px'}}>{getRiskStyle(calculateRiskScore(selected.fraud_flags)).label}</div>
                            <button className="btn small secondary re-run-btn" onClick={handleReAnalyze} disabled={analyzing}>{analyzing ? 'Scanning...' : '⚡ Re-Run AI Analysis'}</button>

                            <div className="flag-stack" style={{marginTop:'20px'}}>
                                {selected.fraud_flags.filter(f => !f.is_ignored).length === 0 && <div className="safe-notice">✅ No Active Flags</div>}
                                {selected.fraud_flags.filter(f => !f.is_ignored).map((f) => (
                                    <div key={f.id} className={`flag-row ${f.severity}`}>
                                        <div style={{flex:1}}><strong>{f.rule}</strong><div>{f.reason}</div></div>
                                        <button className="dismiss-btn" onClick={() => triggerDismiss(f.id)}>✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="data-widget actions-widget">
                            <h4 className="widget-title">Verdict Command</h4>
                            {['Approved', 'Rejected'].includes(selected.status) && !isReevaluating ? (
                                <div className="status-locked-col">
                                    <span className="locked-label">Current Status</span>
                                    <div className={`locked-badge ${selected.status.toLowerCase()}`}>{selected.status.toUpperCase()}</div>
                                    <button className="btn secondary full-width" onClick={() => setIsReevaluating(true)}>↺ Change Decision</button>
                                </div>
                            ) : (
                                <div className="action-stack">
                                    <button className="btn-lg approve" onClick={() => initiateDecision(selected.id, 'approve')}>✅ Approve</button>
                                    <button className="btn-lg reject" onClick={() => initiateDecision(selected.id, 'reject')}>⚠️ Reject</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {userProfile && (
          <div className="modal-overlay" style={{zIndex: 5500}} onClick={() => setUserProfile(null)}>
              <div className="case-file-modal" style={{height:'auto', width:'900px'}} onClick={e => e.stopPropagation()}>
                  <div className="case-header">
                      <div className="case-title"><h3>{userProfile.personal.name}</h3></div>
                      <button className="close-icon-btn" onClick={() => setUserProfile(null)}>✕</button>
                  </div>
                  <div className="case-body-grid" style={{padding:'20px'}}>
                      <div className="data-widget full-width">
                          <h4 className="widget-title">User Risk Summary</h4>
                          <div className="detail-grid">
                              <div className="info-box"><label>Total Claims</label><p>{userProfile.stats.total_claims}</p></div>
                              <div className="info-box"><label>Rejected Claims</label><p style={{color:'#ef4444'}}>{userProfile.stats.rejected_claims}</p></div>
                              <div className="info-box"><label>Risk Score</label><p>{userProfile.risk.score}%</p></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {confirmModal && (
          <div className="modal-overlay" style={{zIndex: 4000}}>
              <div className="mini-modal">
                  <h3>{confirmModal.title}</h3>
                  <p>{confirmModal.message}</p>
                  <div className="mini-modal-actions">
                      <button className="btn secondary" onClick={() => setConfirmModal(null)}>Cancel</button>
                      <button className="btn primary" onClick={confirmModal.onConfirm}>Confirm</button>
                  </div>
              </div>
          </div>
      )}

      {verdictModal && (
          <div className="modal-overlay" style={{zIndex: 5000}} onClick={() => setVerdictModal(null)}>
              <div className="verdict-popup" onClick={(e) => e.stopPropagation()}>
                  <div className={`verdict-banner ${verdictModal.action}`}><h2>{verdictModal.action.toUpperCase()}</h2></div>
                  <div className="verdict-content">
                      <p>Confirm {verdictModal.action} for Claim #{selected.claim_number}?</p>
                      {verdictModal.action === 'reject' && <textarea className="verdict-textarea" placeholder="Reason..." value={adminComment} onChange={e => setAdminComment(e.target.value)}></textarea>}
                      <div className="verdict-actions">
                          <button className="btn secondary" onClick={() => setVerdictModal(null)}>Cancel</button>
                          <button className="btn primary" onClick={submitVerdict}>Confirm</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminClaims;