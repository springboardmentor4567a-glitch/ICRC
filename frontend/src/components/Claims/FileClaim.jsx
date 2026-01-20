import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { submitClaim, getMyPolicies, getUserDashboard } from '../../api'; 
import './FileClaim.css';

const FileClaim = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  // Wizard State
  const [step, setStep] = useState(1);
  const [claimMode, setClaimMode] = useState(''); // 'new' or 'refile'
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [successMode, setSuccessMode] = useState(false);

  // Data State
  const [policies, setPolicies] = useState([]);
  const [rejectedClaims, setRejectedClaims] = useState([]);
  const [pendingPolicyIds, setPendingPolicyIds] = useState(new Set()); 
  
  // UI State
  const [expandedClaim, setExpandedClaim] = useState(null); // ✅ Track expanded dropdown

  // Form Data
  const [formData, setFormData] = useState({
      policyId: '', policyTitle: '', incidentDate: '', amount: '', description: '', file: null, maxClaimable: 0, previousRejectionReason: ''
  });

  const [dragActive, setDragActive] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [filePreview, setFilePreview] = useState(null);

  // --- DATA LOADING ---
  useEffect(() => {
    const initData = async () => {
      try {
        const [policiesData, dashboardData] = await Promise.all([
            getMyPolicies(),
            getUserDashboard()
        ]);

        const activeClaims = new Set();
        const rejectedList = [];
        
        // 1. Get Active Policies First
        const activeOnly = Array.isArray(policiesData) ? policiesData.filter(p => p.status === 'active') : [];
        setPolicies(activeOnly);

        // 2. Process Dashboard Claims
        if (dashboardData && dashboardData.recent_claims) {
            dashboardData.recent_claims.forEach(c => {
                const s = (c.status || '').toLowerCase();
                
                if (['submitted', 'in review', 'under_review'].includes(s)) {
                    if (c.policy_id) activeClaims.add(c.policy_id);
                    else {
                        const match = activeOnly.find(p => p.title === c.policy);
                        if (match) activeClaims.add(match.id);
                    }
                }
                
                if (s === 'rejected') {
                    const parentPolicy = activeOnly.find(p => 
                        (c.policy_id && p.id === c.policy_id) || (p.title === c.policy)
                    );

                    if (parentPolicy) {
                        rejectedList.push({
                            ...c,
                            policyId: parentPolicy.id, 
                            policyTitle: parentPolicy.title,
                            maxClaimable: parentPolicy.remaining_sum_insured ?? parentPolicy.coverage_amount
                        });
                    }
                }
            });
        }
        setPendingPolicyIds(activeClaims);
        setRejectedClaims(rejectedList);

        // 3. HANDLE REDIRECTION
        if (location.state?.mode === 'refile' && location.state?.claim) {
            const incoming = location.state.claim;
            const parentPolicy = activeOnly.find(p => (incoming.policy_id && p.id === incoming.policy_id) || (p.title === incoming.policy));
            
            if (parentPolicy) {
                setClaimMode('refile');
                loadRejectedClaim({
                    ...incoming,
                    policyId: parentPolicy.id,
                    policyTitle: parentPolicy.title,
                    maxClaimable: parentPolicy.remaining_sum_insured ?? parentPolicy.coverage_amount
                });
            } else {
                showToast("Original policy is no longer active.", "error");
            }
        } 
        else if (location.state?.preSelectPolicyId) {
            const pid = location.state.preSelectPolicyId;
            if (activeClaims.has(pid)) {
                showToast("⚠️ Pending claim exists for this policy.", "warning");
            } else {
                const preSelected = activeOnly.find(p => p.id === pid);
                if (preSelected) {
                    setClaimMode('new');
                    selectPolicy(preSelected);
                    setStep(2);
                }
            }
        }

      } catch (e) { console.error("Error", e); }
    };
    initData();
  }, [location.state]); 

  const showToast = (msg, type='error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  // --- LOGIC ---
  const selectPolicy = (policy) => {
      if (pendingPolicyIds.has(policy.id)) {
          showToast(`⛔ Policy "${policy.title}" has a pending claim.`, "error");
          setFormData(prev => ({ ...prev, policyId: '' }));
          return;
      }
      const limit = policy.remaining_sum_insured ?? policy.coverage_amount;
      setFormData(prev => ({ 
          ...prev, policyId: policy.id, policyTitle: policy.title, maxClaimable: limit, previousRejectionReason: ''
      }));
  };

  const loadRejectedClaim = (claim) => {
      setFormData({
          policyId: claim.policyId,
          policyTitle: claim.policyTitle,
          incidentDate: claim.date, 
          amount: claim.amount,     
          description: claim.description || '', 
          file: null, 
          maxClaimable: claim.maxClaimable,
          previousRejectionReason: claim.admin_comments 
      });
      setStep(2); 
  };

  const toggleExpand = (claimNumber, e) => {
      e.stopPropagation();
      setExpandedClaim(expandedClaim === claimNumber ? null : claimNumber);
  };

  // --- HANDLERS ---
  const handleChange = (e) => {
      const { name, value } = e.target;
      if (name === 'amount') {
          const val = parseFloat(value);
          if (val > formData.maxClaimable) setAmountError(`Max limit: ₹${formData.maxClaimable.toLocaleString()}`);
          else setAmountError('');
      }
      setFormData(prev => ({ ...prev, [name]: value }));
      if (name === 'policyId') {
          const selected = policies.find(p => p.id === parseInt(value));
          if (selected) selectPolicy(selected);
      }
  };

  const handleNext = () => {
      if (step === 1) {
          if (!claimMode) return showToast("Please choose an option.", "error");
          if (claimMode === 'new' && !formData.policyId) return showToast("Please select a policy.", "error");
      }
      if (step === 2) {
          if (!formData.incidentDate || !formData.amount || !formData.description) return showToast("All fields are required.", "error");
          if (parseFloat(formData.amount) > formData.maxClaimable) return showToast("Amount exceeds policy limit.", "error");
      }
      if (step === 3 && !formData.file) return showToast("Proof document is required.", "error");
      setStep(prev => prev + 1);
  };

  const handleBack = () => {
      if (step === 2 && claimMode === 'refile') { setStep(1); setClaimMode(''); return; }
      setStep(prev => prev - 1);
  };

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) validateFile(e.dataTransfer.files[0]); };
  
  const validateFile = (file) => {
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) return showToast("Only PDF, JPG, PNG allowed.", "error");
      if (file.size > 10 * 1024 * 1024) return showToast("File too large (Max 10MB).", "error");
      if (file.type.startsWith('image/')) setFilePreview(URL.createObjectURL(file));
      else setFilePreview(null);
      setFormData(prev => ({ ...prev, file: file }));
  };

  const handleSubmit = async () => {
    setUploading(true);
    const data = new FormData();
    data.append('policy_id', formData.policyId);
    data.append('claim_amount', formData.amount);
    data.append('incident_date', formData.incidentDate);
    data.append('description', formData.description);
    data.append('proof_file', formData.file);

    try {
        const result = await submitClaim(data);
        if (result && (result.message === 'Submitted' || result.claim_number)) {
            setSuccessMode(true); 
            setTimeout(() => { navigate('/profile', { state: { activeTab: 'claims' } }); }, 2000);
        } else {
            showToast("Submission failed: " + (result?.message || "Unknown error"), "error");
        }
    } catch (e) { showToast("Server Error", "error"); } finally { setUploading(false); }
  };

  return (
    <div className={`claim-page-container ${successMode ? 'success-bg' : ''}`}>
      {successMode && <div className="confetti-overlay">🎉 Claim Submitted! 🎉</div>}

      <div style={{width:'100%', maxWidth:'580px', marginBottom:'10px'}}>
        <button className="btn-text" onClick={() => navigate('/')}>← Back to Dashboard</button>
      </div>

      {toast && <div className={`claim-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="wizard-card">
        <div className="wizard-header">
            <div className="brand-pill">🛡️ Insurance Assistant</div>
            <h2>{claimMode === 'refile' ? 'Fix Rejected Claim' : 'File a New Claim'}</h2>
            <div className="step-indicator">
                {[1,2,3,4].map(num => (
                    <div key={num} className={`step-dot ${step >= num ? 'active' : ''}`}>{num}</div>
                ))}
            </div>
        </div>

        {/* STEP 1: MODE SELECT */}
        {step === 1 && (
            <div className="step-content fade-in">
                {!claimMode ? (
                    <div className="claim-mode-grid">
                        <div className="mode-card" onClick={() => setClaimMode('new')}>
                            <div className="mode-icon">📝</div>
                            <h3>New Claim</h3>
                            <p>For a new incident</p>
                        </div>
                        <div className="mode-card" onClick={() => setClaimMode('refile')}>
                            <div className="mode-icon">↺</div>
                            <h3>Re-file Rejected</h3>
                            <p>Fix returned claim</p>
                            {rejectedClaims.length > 0 && <span className="badge-count">{rejectedClaims.length}</span>}
                        </div>
                    </div>
                ) : claimMode === 'new' ? (
                    <div className="input-group">
                        <label>Select Policy</label>
                        <select name="policyId" value={formData.policyId} onChange={handleChange} className="modern-input">
                            <option value="">-- Choose Active Policy --</option>
                            {policies.map(p => {
                                const isPending = pendingPolicyIds.has(p.id);
                                return <option key={p.id} value={p.id} disabled={isPending}>{isPending ? '⏳ ' : '✅ '}{p.title}</option>;
                            })}
                        </select>
                        <button className="btn-link-small" onClick={() => setClaimMode('')}>Change Mode</button>
                    </div>
                ) : (
                    // ✅ DROPDOWN / ACCORDION LIST
                    <div className="refile-list-container">
                        <label className="section-label">Select a Claim to Fix</label>
                        {rejectedClaims.length === 0 ? <p className="empty-text">No rejected claims available.</p> : (
                            <div className="refile-stack">
                                {rejectedClaims.map((rc) => (
                                    <div 
                                        key={rc.claim_number} 
                                        className={`refile-card ${expandedClaim === rc.claim_number ? 'expanded' : ''}`}
                                        onClick={(e) => toggleExpand(rc.claim_number, e)}
                                    >
                                        <div className="refile-header">
                                            <div className="refile-title-group">
                                                <span className="refile-icon">⚠️</span>
                                                <div>
                                                    <h4>{rc.policyTitle}</h4>
                                                    <span className="refile-sub">Claim #{rc.claim_number} • {rc.date}</span>
                                                </div>
                                            </div>
                                            <div className="refile-amount">₹{rc.amount.toLocaleString()}</div>
                                        </div>
                                        
                                        {/* EXPANDED DETAILS */}
                                        <div className="refile-body">
                                            <div className="admin-feedback-box">
                                                <span className="feedback-label">Admin Feedback:</span>
                                                <p>"{rc.admin_comments || 'Please provide more evidence.'}"</p>
                                            </div>
                                            <div className="refile-actions">
                                                <button className="btn-secondary-small" onClick={(e) => toggleExpand(rc.claim_number, e)}>Close</button>
                                                <button className="btn-primary-small" onClick={(e) => { e.stopPropagation(); loadRejectedClaim(rc); }}>
                                                    Fix & Resubmit →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className="btn-link-small" onClick={() => setClaimMode('')}>← Go Back</button>
                    </div>
                )}
            </div>
        )}

        {/* STEP 2: DETAILS */}
        {step === 2 && (
            <div className="step-content fade-in">
                {formData.previousRejectionReason && (
                    <div className="rejection-alert">
                        <strong>⚠️ Needs Correction</strong>
                        <p>Admin Note: "{formData.previousRejectionReason}"</p>
                    </div>
                )}
                <div className="form-grid">
                    <div className="input-group"><label>Incident Date</label><input type="date" name="incidentDate" value={formData.incidentDate} onChange={handleChange} className="modern-input" max={new Date().toISOString().split("T")[0]} /></div>
                    <div className="input-group"><label>Amount</label><div className="currency-wrapper"><span className="currency-symbol">₹</span><input type="number" name="amount" value={formData.amount} onChange={handleChange} className={`modern-input has-symbol ${amountError?'input-error':''}`}/></div>{amountError && <span className="error-text">{amountError}</span>}</div>
                </div>
                <div className="input-group"><label>Description</label><textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="modern-input"></textarea></div>
            </div>
        )}

        {/* STEP 3: UPLOAD */}
        {step === 3 && (
            <div className="step-content fade-in">
                <div className={`drop-zone-modern ${dragActive ? "active" : ""} ${formData.file ? "loaded" : ""}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}>
                    <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.png" onChange={(e) => validateFile(e.target.files[0])} style={{display:'none'}} />
                    {!formData.file ? <><div className="cloud-icon-bg">☁️</div><h4>Upload Evidence</h4><p>PDF, JPG, PNG (Max 10MB)</p></> : <div className="file-success"><div className="file-icon-lg">📄</div><div><strong>{formData.file.name}</strong><span>Ready</span></div><button className="delete-btn" onClick={(e) => { e.stopPropagation(); setFormData(prev=>({...prev, file:null})) }}>✕</button></div>}
                </div>
            </div>
        )}

        {/* STEP 4: PREVIEW */}
        {step === 4 && (
            <div className="step-content fade-in">
                <div className="review-card">
                    <div className="review-header-summary">
                        <div><span className="summary-label">CLAIMING FOR</span><div className="summary-title">{formData.policyTitle}</div></div>
                        <div className="summary-amount">₹{parseInt(formData.amount).toLocaleString()}</div>
                    </div>
                    <div className="review-grid">
                        <div className="review-item"><span>Date</span><strong>{formData.incidentDate}</strong></div>
                        <div className="review-item"><span>Type</span><strong>{claimMode === 'refile' ? 'Correction' : 'New Claim'}</strong></div>
                    </div>
                    <div className="review-file-area">
                        <span className="summary-label">Evidence</span>
                        <div className="preview-box">
                            {filePreview ? <img src={filePreview} alt="Preview" className="preview-thumb" /> : <div className="doc-icon-placeholder">📄 PDF</div>}
                            <div className="preview-meta"><strong>{formData.file?.name}</strong><span>Attached</span></div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="wizard-footer">
            {step > 1 ? <button className="btn-text" onClick={handleBack}>Back</button> : <button className="btn-text" onClick={() => navigate('/')}>Cancel</button>}
            {step < 4 ? <button className="btn-gradient" onClick={handleNext} disabled={!!amountError || (step === 1 && !claimMode)}>Next Step →</button> : <button className="btn-gradient" onClick={handleSubmit} disabled={uploading}>{uploading ? "Submitting..." : "Confirm & Submit 🚀"}</button>}
        </div>
      </div>
    </div>
  );
};

export default FileClaim;