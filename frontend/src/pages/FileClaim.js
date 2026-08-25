import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./claims.css";
import { formatApiError } from "../utils/formatApiError";

// ── Step progress indicator
const STEPS = ["Policy Details", "Incident & Documents", "Review & Submit"];

function StepIndicator({ current }) {
  return (
    <div className="claim-stepper" aria-label="Form progress">
      {STEPS.map((label, idx) => {
        const stepNum = idx + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;
        return (
          <React.Fragment key={stepNum}>
            <div className={`stepper-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
              <div className="stepper-circle">
                {isDone ? <span className="stepper-check">&#10003;</span> : stepNum}
              </div>
              <span className="stepper-label">{label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`stepper-line ${isDone ? "done" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── File size formatter
function fmtSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// ── Validation helpers
function validateStep1(form) {
  const errors = {};
  if (!form.user_name.trim()) errors.user_name = "Full name is required.";
  if (!form.policy_number.trim()) errors.policy_number = "Policy number is required.";
  else if (form.policy_number.trim().length < 4) errors.policy_number = "Enter a valid policy number.";
  if (!form.claim_type) errors.claim_type = "Please select a claim type.";
  return errors;
}

function validateStep2(form) {
  const errors = {};
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (!form.incident_date) {
    errors.incident_date = "Incident date is required.";
  } else if (new Date(form.incident_date) > today) {
    errors.incident_date = "Incident date cannot be a future date.";
  }

  const amt = Number(form.amount);
  if (!form.amount || isNaN(amt) || amt <= 0) {
    errors.amount = "Enter a valid amount greater than 0.";
  }

  if (!form.reason.trim()) {
    errors.reason = "Please describe the reason for this claim.";
  } else if (form.reason.trim().length < 20) {
    errors.reason = "Please provide more detail (at least 20 characters).";
  }

  return errors;
}

const CLAIM_TYPES = [
  { value: "Hospital", label: "Hospitalisation" },
  { value: "Accident", label: "Accident" },
  { value: "Theft", label: "Theft" },
  { value: "Natural Disaster", label: "Natural Disaster" },
  { value: "Fire Damage", label: "Fire Damage" },
  { value: "Travel Emergency", label: "Travel Emergency" },
  { value: "Other", label: "Other" },
];

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_SIZE = 10 * 1024 * 1024;

export default function FileClaim() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState({
    user_name: "",
    policy_number: "",
    claim_type: "",
    incident_date: "",
    amount: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [receipt, setReceipt] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  };

  // ── File handling
  const processFiles = (incoming) => {
    setFileError("");
    const valid = [];
    for (const file of incoming) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setFileError("Only PDF, JPG, and PNG files are allowed.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setFileError(`"${file.name}" exceeds the 10 MB limit.`);
        return;
      }
      valid.push(file);
    }
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      return [...prev, ...valid.filter((f) => !existingNames.has(f.name))];
    });
  };

  const handleFileInput = (e) => {
    processFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (name) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  // ── Step navigation with validation
  const goToStep2 = () => {
    const errs = validateStep1(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(2);
  };

  const goToStep3 = () => {
    const errs = validateStep2(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(3);
  };

  // ── Submit — preserves the exact existing API calls
  const submitClaim = async () => {
    setLoading(true);
    setSubmitError("");

    try {
      // 1. CREATE CLAIM
      const res = await fetch("http://127.0.0.1:8000/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });

      if (!res.ok) {
        const err = await res.json();
        setSubmitError(formatApiError(err.detail, "Claim creation failed."));
        return;
      }

      const claim = await res.json();
      const claimId = claim.id;

      // 2. UPLOAD DOCUMENTS
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        await fetch(`http://127.0.0.1:8000/claims/${claimId}/documents`, {
          method: "POST",
          body: formData,
        });
      }

      // 3. SUCCESS
      setReceipt(claim);
    } catch (err) {
      console.error(err);
      setSubmitError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => setTimeout(() => window.print(), 300);

  // ── Today's date for date input max
  const todayStr = new Date().toISOString().split("T")[0];

  // ── Success receipt screen
  if (receipt) {
    return (
      <div className="page-center">
        <div className="claim-card-outer claim-success-card">
          <div className="success-icon-ring" aria-hidden="true">&#10003;</div>
          <h2 className="success-title">Claim Submitted Successfully</h2>
          <p className="success-subtitle">
            Your claim has been received. You can track its status from <strong>My Claims</strong>.
          </p>

          <div className="review-section-grid">
            <div className="review-section">
              <h4 className="review-section-title">Applicant &amp; Policy</h4>
              <div className="review-row"><span>Full Name</span><strong>{form.user_name}</strong></div>
              <div className="review-row"><span>Policy Number</span><strong>{form.policy_number}</strong></div>
              <div className="review-row"><span>Claim Type</span><strong>{form.claim_type}</strong></div>
            </div>
            <div className="review-section">
              <h4 className="review-section-title">Claim Details</h4>
              <div className="review-row"><span>Incident Date</span><strong>{form.incident_date}</strong></div>
              <div className="review-row"><span>Claim ID</span><strong>#{receipt.id}</strong></div>
              <div className="review-row"><span>Status</span>
                <strong className={`claim-status-badge ${receipt.status}`}>{receipt.status}</strong>
              </div>
              <div className="review-row"><span>Amount Claimed</span>
                <strong className="review-amount">&#8377;{Number(form.amount).toLocaleString("en-IN")}</strong>
              </div>
            </div>
          </div>

          {form.reason && (
            <div className="review-section" style={{ marginTop: 16 }}>
              <h4 className="review-section-title">Reason</h4>
              <p className="review-reason-text">{form.reason}</p>
            </div>
          )}

          {files.length > 0 && (
            <div className="review-section" style={{ marginTop: 16 }}>
              <h4 className="review-section-title">Documents Submitted ({files.length})</h4>
              <ul className="review-doc-list">
                {files.map((f) => <li key={f.name}>{f.name}</li>)}
              </ul>
            </div>
          )}

          <div className="btn-row" style={{ marginTop: 24 }}>
            <button className="btn-purple full" onClick={() => navigate("/my-claims")}>
              Track My Claim Status
            </button>
            <button className="btn-outline full" onClick={handlePrint}>
              Print Summary
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-center">
      <div className="page-header-block">
        <span className="section-kicker">Insurance Claims</span>
        <h2 className="page-title">File a Claim</h2>
        <p className="page-desc">
          Submit your insurance claim in three simple steps. Upload supporting documents and track status in real time.
        </p>
      </div>

      <div className="claim-card-outer">
        <StepIndicator current={step} />

        {/* ── STEP 1: Policy Details ── */}
        {step === 1 && (
          <div className="claim-step-body">
            <h3 className="step-section-title">Step 1 &mdash; Policy Details</h3>
            <p className="step-section-desc">Enter your personal information and the policy you are claiming against.</p>

            <div className="form-field">
              <label className="form-label" htmlFor="user_name">
                Full Name <span className="req">*</span>
              </label>
              <input
                id="user_name"
                className={`input-box ${errors.user_name ? "input-error" : ""}`}
                name="user_name"
                type="text"
                placeholder="e.g. Priya Sharma"
                value={form.user_name}
                onChange={handleChange}
                autoComplete="name"
              />
              {errors.user_name && <p className="field-error">{errors.user_name}</p>}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="policy_number">
                Policy Number <span className="req">*</span>
              </label>
              <input
                id="policy_number"
                className={`input-box ${errors.policy_number ? "input-error" : ""}`}
                name="policy_number"
                type="text"
                placeholder="e.g. LIC1001, HDFC2002"
                value={form.policy_number}
                onChange={handleChange}
                autoComplete="off"
              />
              <p className="field-hint">Enter the policy number exactly as shown on your policy document.</p>
              {errors.policy_number && <p className="field-error">{errors.policy_number}</p>}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="claim_type">
                Claim Type <span className="req">*</span>
              </label>
              <select
                id="claim_type"
                className={`input-box ${errors.claim_type ? "input-error" : ""}`}
                name="claim_type"
                value={form.claim_type}
                onChange={handleChange}
              >
                <option value="">-- Select claim type --</option>
                {CLAIM_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>{ct.label}</option>
                ))}
              </select>
              {errors.claim_type && <p className="field-error">{errors.claim_type}</p>}
            </div>

            <div className="btn-row" style={{ justifyContent: "flex-end" }}>
              <button className="btn-purple" onClick={goToStep2}>
                Continue &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Incident & Documents ── */}
        {step === 2 && (
          <div className="claim-step-body">
            <h3 className="step-section-title">Step 2 &mdash; Incident &amp; Documents</h3>
            <p className="step-section-desc">Provide incident details and upload supporting documents.</p>

            <div className="form-field">
              <label className="form-label" htmlFor="incident_date">
                Incident Date <span className="req">*</span>
              </label>
              <input
                id="incident_date"
                className={`input-box ${errors.incident_date ? "input-error" : ""}`}
                type="date"
                name="incident_date"
                value={form.incident_date}
                max={todayStr}
                onChange={handleChange}
              />
              <p className="field-hint">Date when the incident occurred. Cannot be a future date.</p>
              {errors.incident_date && <p className="field-error">{errors.incident_date}</p>}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="amount">
                Amount Claimed (&#8377;) <span className="req">*</span>
              </label>
              <input
                id="amount"
                className={`input-box ${errors.amount ? "input-error" : ""}`}
                type="number"
                name="amount"
                placeholder="e.g. 45000"
                value={form.amount}
                min="1"
                onChange={handleChange}
              />
              <p className="field-hint">Enter the total amount you are claiming in Indian Rupees.</p>
              {errors.amount && <p className="field-error">{errors.amount}</p>}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="reason">
                Reason / Description <span className="req">*</span>
              </label>
              <textarea
                id="reason"
                className={`input-box textarea-box ${errors.reason ? "input-error" : ""}`}
                name="reason"
                placeholder="Briefly describe what happened and why you are filing this claim..."
                value={form.reason}
                onChange={handleChange}
                rows={4}
              />
              <p className="field-hint">
                Minimum 20 characters. Currently: {form.reason.trim().length} / 20 minimum.
              </p>
              {errors.reason && <p className="field-error">{errors.reason}</p>}
            </div>

            {/* Document Upload */}
            <div className="form-field">
              <label className="form-label">Supporting Documents</label>
              <p className="field-hint" style={{ marginBottom: 8 }}>
                Accepted: PDF, JPG, PNG &mdash; Max 10 MB per file. Upload bills, reports, or incident records.
              </p>

              <div
                className={`upload-drop-zone ${dragOver ? "drag-active" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                aria-label="Upload documents"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInput}
                />
                <div className="upload-drop-icon" aria-hidden="true">&#8679;</div>
                <p className="upload-drop-main">Drag &amp; drop files here</p>
                <p className="upload-drop-sub">or</p>
                <button type="button" className="btn-outline upload-browse-btn">
                  Browse Files
                </button>
                <p className="upload-drop-hint">PDF, JPG, PNG &bull; Max 10 MB each</p>
              </div>

              {fileError && <p className="field-error" style={{ marginTop: 8 }}>{fileError}</p>}

              {files.length > 0 && (
                <ul className="file-list">
                  {files.map((file) => (
                    <li key={file.name} className="file-list-item">
                      <span className="file-icon" aria-hidden="true">&#128196;</span>
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{fmtSize(file.size)}</span>
                      </div>
                      <button
                        type="button"
                        className="file-remove-btn"
                        onClick={() => removeFile(file.name)}
                        aria-label={`Remove ${file.name}`}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="btn-row">
              <button className="btn-outline" onClick={() => setStep(1)}>&larr; Back</button>
              <button className="btn-purple" onClick={goToStep3}>Review &rarr;</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review & Submit ── */}
        {step === 3 && (
          <div className="claim-step-body">
            <h3 className="step-section-title">Step 3 &mdash; Review &amp; Submit</h3>
            <p className="step-section-desc">Please review all details before submitting your claim.</p>

            <div className="review-section-grid">
              <div className="review-section">
                <h4 className="review-section-title">Applicant &amp; Policy</h4>
                <div className="review-row">
                  <span>Full Name</span>
                  <strong>{form.user_name}</strong>
                </div>
                <div className="review-row">
                  <span>Policy Number</span>
                  <strong>{form.policy_number}</strong>
                </div>
                <div className="review-row">
                  <span>Claim Type</span>
                  <strong>{form.claim_type}</strong>
                </div>
              </div>

              <div className="review-section">
                <h4 className="review-section-title">Claim Details</h4>
                <div className="review-row">
                  <span>Incident Date</span>
                  <strong>{form.incident_date}</strong>
                </div>
                <div className="review-row">
                  <span>Amount Claimed</span>
                  <strong className="review-amount">&#8377;{Number(form.amount).toLocaleString("en-IN")}</strong>
                </div>
              </div>
            </div>

            <div className="review-section" style={{ marginTop: 16 }}>
              <h4 className="review-section-title">Reason / Description</h4>
              <p className="review-reason-text">{form.reason}</p>
            </div>

            {files.length > 0 && (
              <div className="review-section" style={{ marginTop: 16 }}>
                <h4 className="review-section-title">Supporting Documents ({files.length})</h4>
                <ul className="file-list review-file-list">
                  {files.map((file) => (
                    <li key={file.name} className="file-list-item">
                      <span className="file-icon" aria-hidden="true">&#128196;</span>
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{fmtSize(file.size)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {files.length === 0 && (
              <p className="review-no-docs">No documents attached. You may submit without documents.</p>
            )}

            {submitError && (
              <div className="submit-error-box">{submitError}</div>
            )}

            <div className="btn-row">
              <button className="btn-outline" onClick={() => setStep(2)} disabled={loading}>
                &larr; Back
              </button>
              <button
                className="btn-purple"
                onClick={submitClaim}
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="btn-spinner" /> Submitting...
                  </span>
                ) : (
                  "Submit Claim"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
