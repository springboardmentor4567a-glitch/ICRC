import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyPolicies, submitClaim } from '../../api';
import './FileClaim.css';

const FileClaim = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [selectedPolicyDetails, setSelectedPolicyDetails] = useState(null);
  
  const [formData, setFormData] = useState({
    policy_id: '',
    incident_date: '',
    description: '',
    claim_amount: '',
    proof_file: null
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load Policies
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const data = await getMyPolicies();
        if (Array.isArray(data)) {
            // Only show active policies
            setPolicies(data.filter(p => p.status === 'active'));
        }
      } catch (err) { console.error(err); }
    };
    fetchPolicies();
  }, []);

  const getDateLimits = () => {
      const today = new Date();
      const maxDate = today.toISOString().split('T')[0]; 
      const minDateObj = new Date();
      minDateObj.setDate(today.getDate() - 15);
      const minDate = minDateObj.toISOString().split('T')[0];
      return { min: minDate, max: maxDate };
  };

  const handlePolicySelect = (e) => {
    const pId = parseInt(e.target.value);
    const policy = policies.find(p => p.id === pId);
    setSelectedPolicyDetails(policy);
    setFormData(prev => ({ ...prev, policy_id: pId, claim_amount: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validation: Don't allow claiming more than available
    if (name === 'claim_amount' && selectedPolicyDetails) {
        // ✅ FIX: Use coverage_amount if remaining_balance is undefined/null
        const limit = selectedPolicyDetails.remaining_balance ?? selectedPolicyDetails.coverage_amount;
        
        if (parseFloat(value) > limit) {
            setMessage({ type: 'error', text: `Max claim limit is ₹${limit.toLocaleString()}` });
            return; 
        } else {
            setMessage({ type: '', text: '' });
        }
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file && file.size > 5 * 1024 * 1024) {
          alert("File size exceeds 5MB limit.");
          return;
      }
      setFormData({ ...formData, proof_file: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const submissionData = new FormData();
    submissionData.append('policy_id', formData.policy_id);
    submissionData.append('incident_date', formData.incident_date);
    submissionData.append('description', formData.description);
    submissionData.append('claim_amount', formData.claim_amount);
    if (formData.proof_file) submissionData.append('proof_file', formData.proof_file);

    try {
        const result = await submitClaim(submissionData);
        if (result && !result.error && !result.message?.includes("Error")) {
            setMessage({ type: 'success', text: '✅ Submitted! Redirecting...' });
            setTimeout(() => {
                navigate('/profile', { state: { activeTab: 'claims' } });
            }, 1500);
        } else {
            throw new Error(result.message || "Failed");
        }
    } catch (error) {
        setLoading(false);
        setMessage({ type: 'error', text: error.message || 'Submission failed.' });
    }
  };

  const { min, max } = getDateLimits();

  // ✅ Helper to show correct balance in UI
  const getBalanceDisplay = (p) => {
      const bal = p.remaining_balance ?? p.coverage_amount;
      return bal.toLocaleString();
  };

  return (
    <div className="claim-page-container">
      <div className="claim-top-bar">
        <button className="back-btn" onClick={() => navigate('/profile')}>← Back to Dashboard</button>
      </div>

      <div className="claim-card">
        <div className="claim-header">
          <h2>File a New Claim</h2>
          <p>Submit your request and track status instantly.</p>
        </div>

        {message.text && <div className={`alert-box ${message.type}`}>{message.text}</div>}

        <form onSubmit={handleSubmit} className="claim-form">
          <div className="form-group">
            <label>Select Policy</label>
            <select name="policy_id" value={formData.policy_id} onChange={handlePolicySelect} required>
              <option value="">-- Select Active Policy --</option>
              {policies.map(p => (
                <option key={p.id} value={p.id}>
                    {p.title} - (Avail: ₹{getBalanceDisplay(p)})
                </option>
              ))}
            </select>
            
            {selectedPolicyDetails && (
                <div className="policy-details-box">
                    <span>🛡️ Coverage: <strong>₹{selectedPolicyDetails.coverage_amount?.toLocaleString()}</strong></span>
                    <span>💰 Available Limit: <strong>₹{getBalanceDisplay(selectedPolicyDetails)}</strong></span>
                    <span>📅 Valid Until: <strong>{selectedPolicyDetails.end_date}</strong></span>
                </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
                <label>Incident Date</label>
                <input type="date" name="incident_date" value={formData.incident_date} onChange={handleChange} min={min} max={max} required />
            </div>
            <div className="form-group">
                <label>Claim Amount (₹)</label>
                <input 
                    type="number" 
                    name="claim_amount" 
                    value={formData.claim_amount} 
                    onChange={handleChange} 
                    required 
                    onWheel={(e) => e.target.blur()} 
                    placeholder="Enter Estimate"
                />
            </div>
          </div>

          <div className="form-group">
            <label>Incident Description</label>
            <textarea name="description" rows="3" value={formData.description} onChange={handleChange} required placeholder="What happened?"></textarea>
          </div>

          <div className="form-group">
            <label>Attach Proof</label>
            {/* ✅ RESTORED OLDER, BETTER CSS CLASS */}
            <div className="file-upload-box">
                <input type="file" id="file-input" onChange={handleFileChange} className="hidden-input" required />
                <label htmlFor="file-input" className="upload-label">
                    <span className="icon">📎</span>
                    <span className="text">{formData.proof_file ? formData.proof_file.name : "Choose Invoice / Report (PDF/JPG)"}</span>
                </label>
            </div>
          </div>

          <button type="submit" className="submit-claim-btn" disabled={loading || !selectedPolicyDetails}>
            {loading ? 'Submitting...' : 'Submit Claim'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FileClaim;