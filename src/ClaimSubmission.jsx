import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "./apiClient";
import { useAuth } from "./authContext";
import "./claim-submission.css";

function ClaimSubmission() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    insurance_type: "",
    claim_type: "",
    claim_amount: "",
    incident_date: "",
    incident_type: "",
    description: "",
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!form.insurance_type) newErrors.insurance_type = "Insurance type is required";
      if (!form.claim_type) newErrors.claim_type = "Claim type is required";
      if (!form.claim_amount.trim()) newErrors.claim_amount = "Claim amount is required";
    } else if (step === 2) {
      if (!form.incident_date) newErrors.incident_date = "Incident date is required";
      if (!form.incident_type) newErrors.incident_type = "Incident type is required";
      if (!form.description.trim()) newErrors.description = "Description is required";
    } else if (step === 3) {
      if (files.length === 0) newErrors.files = "At least one document is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const submitClaim = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("insurance_type", form.insurance_type);
      data.append("claim_type", form.claim_type);
      data.append("claim_amount", form.claim_amount);
      data.append("incident_date", form.incident_date);
      data.append("incident_type", form.incident_type);
      data.append("description", form.description);

      for (let file of files) {
        data.append("documents", file);
      }

      const response = await fetchWithAuth("/api/claims", {
        method: "POST",
        body: data
      });

      if (response.ok) {
        const result = await response.json();
        alert("Claim submitted successfully!");
        // Save claim_id to localStorage for tracking
        localStorage.setItem('last_claim_id', result.data.claim_id);
        // Dispatch event to update admin dashboard and claims
        window.dispatchEvent(new CustomEvent('claimUpdated'));
        // Also set localStorage to trigger update across tabs
        localStorage.setItem('claimUpdated', Date.now().toString());
        // Reset form
        setForm({
          insurance_type: "",
          claim_type: "",
          claim_amount: "",
          incident_date: "",
          incident_type: "",
          description: "",
        });
        setFiles([]);
        setErrors({});
        setCurrentStep(1);
        // Navigate to view claims
        navigate("/view-claims");
      } else {
        const errorData = await response.json();
        alert(`Failed to submit claim: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert("Failed to submit claim. Please try again.");
      console.error("Claim submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    if (errors.files) {
      setErrors({ ...errors, files: null });
    }
  };

  return (
    <div className="claim-submission-page">
      <header className="page-header">
        <h2>Submit Insurance Claim</h2>
        <div>
          <button onClick={() => window.history.back()}>Back</button>
          <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        </div>
      </header>
      <div className="claim-form-container">
        <div className="claim-form-header">
          <div className="claim-form-icon">📋</div>
          <h2>Submit Insurance Claim</h2>
          <p>Please provide details about your claim and upload supporting documents</p>
        </div>

        {currentStep === 1 && (
          <div className="step-content">
            <h3>Step 1: Basic Information</h3>
            <div className="claim-form-group">
              <label htmlFor="insurance_type">Insurance Type</label>
              <select
                id="insurance_type"
                value={form.insurance_type}
                onChange={(e) => setForm({ ...form, insurance_type: e.target.value })}
                className={errors.insurance_type ? "error" : ""}
              >
                <option value="">Select Insurance Type</option>
                <option value="health">Health Insurance</option>
                <option value="auto">Auto Insurance</option>
                <option value="home">Home Insurance</option>
                <option value="life">Life Insurance</option>
                <option value="property">Property Insurance</option>
              </select>
              {errors.insurance_type && <div className="error-message">{errors.insurance_type}</div>}
            </div>

            <div className="claim-form-group">
              <label htmlFor="claim_type">Claim Type</label>
              <select
                id="claim_type"
                value={form.claim_type}
                onChange={(e) => setForm({ ...form, claim_type: e.target.value })}
                className={errors.claim_type ? "error" : ""}
              >
                <option value="">Select Claim Type</option>
                <option value="accident">Accident</option>
                <option value="theft">Theft</option>
                <option value="damage">Damage</option>
                <option value="medical">Medical</option>
                <option value="other">Other</option>
              </select>
              {errors.claim_type && <div className="error-message">{errors.claim_type}</div>}
            </div>

            <div className="claim-form-group">
              <label htmlFor="claim_amount">Claim Amount ($)</label>
              <input
                id="claim_amount"
                type="number"
                placeholder="Enter claim amount"
                value={form.claim_amount}
                onChange={(e) => setForm({ ...form, claim_amount: e.target.value })}
                className={errors.claim_amount ? "error" : ""}
              />
              {errors.claim_amount && <div className="error-message">{errors.claim_amount}</div>}
            </div>

            <div className="claim-form-actions">
              <button type="button" onClick={() => window.history.back()}>
                Cancel
              </button>
              <button type="button" onClick={nextStep}>
                Next Step
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-content">
            <h3>Step 2: Incident Details</h3>
            <div className="claim-form-group">
              <label htmlFor="incident_date">Incident Date</label>
              <input
                id="incident_date"
                type="date"
                value={form.incident_date}
                onChange={(e) => setForm({ ...form, incident_date: e.target.value })}
                className={errors.incident_date ? "error" : ""}
              />
              {errors.incident_date && <div className="error-message">{errors.incident_date}</div>}
            </div>

            <div className="claim-form-group">
              <label htmlFor="incident_type">Incident Type</label>
              <select
                id="incident_type"
                value={form.incident_type}
                onChange={(e) => setForm({ ...form, incident_type: e.target.value })}
                className={errors.incident_type ? "error" : ""}
              >
                <option value="">Select Incident Type</option>
                <option value="collision">Collision</option>
                <option value="fire">Fire</option>
                <option value="flood">Flood</option>
                <option value="theft">Theft</option>
                <option value="vandalism">Vandalism</option>
                <option value="medical">Medical Emergency</option>
                <option value="other">Other</option>
              </select>
              {errors.incident_type && <div className="error-message">{errors.incident_type}</div>}
            </div>

            <div className="claim-form-group">
              <label htmlFor="description">Incident Description</label>
              <textarea
                id="description"
                placeholder="Please describe the incident in detail..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows="6"
                className={errors.description ? "error" : ""}
              />
              {errors.description && <div className="error-message">{errors.description}</div>}
            </div>

            <div className="claim-form-actions">
              <button type="button" onClick={prevStep}>
                Previous
              </button>
              <button type="button" onClick={nextStep}>
                Next Step
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-content">
            <h3>Step 3: Supporting Documents</h3>
            <div className="claim-form-group">
              <label htmlFor="documents">Upload Supporting Documents</label>
              <div className="file-input">
                <input
                  id="documents"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('documents').click()}
                  style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: '#f0f0f0',
                    color: 'black',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  📎 Upload Documents
                </button>
                <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                  PDF, JPG, PNG, DOC files accepted
                </div>
              </div>
              {files.length > 0 && (
                <div className="file-info">
                  {files.length} file{files.length > 1 ? 's' : ''} selected: {files.map(f => f.name).join(', ')}
                </div>
              )}
              {errors.files && <div className="error-message">{errors.files}</div>}
            </div>

            <div className="claim-form-actions">
              <button type="button" onClick={prevStep}>
                Previous
              </button>
              <button type="button" onClick={submitClaim} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Claim'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClaimSubmission;
