import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Indian currency formatter
// coverage stored as string like "5,00,000" - prefix ₹
// premium stored as float like 12000 - format with en-IN locale
function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "string" && value.trim() !== "") {
    return "₹" + value;
  }
  const num = Number(value);
  if (isNaN(num)) return "-";
  return "₹" + num.toLocaleString("en-IN");
}

function splitBenefits(value) {
  if (!value) return ["Comprehensive coverage", "Cashless claim support", "Simple document verification"];
  return value
    .split(/[,.]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

// Buy Plan Application Modal
function ApplicationModal({ policy, providerName, onClose, onSuccess }) {
  const [applicantName, setApplicantName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill from logged-in user info
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    fetch("http://127.0.0.1:8000/users/me", { headers: { token } })
      .then((r) => r.json())
      .then((user) => {
        if (user && user.name) setApplicantName(user.name);
        if (user && user.phone) setPhone(user.phone);
      })
      .catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!applicantName.trim()) { setError("Please enter your full name."); return; }
    setSubmitting(true);
    setError("");
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch("http://127.0.0.1:8000/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({
          policy_id: policy.id,
          applicant_name: applicantName.trim(),
          phone: phone.trim() || null,
        }),
      });
      if (res.ok) { onSuccess(); }
      else { const d = await res.json(); setError(d.detail || "Submission failed."); }
    } catch { setError("Server not reachable."); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="app-modal-overlay" onClick={onClose}>
      <div className="app-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="app-modal-title">Apply for this Plan</h3>
        <div className="app-modal-summary">
          <p><span>Policy</span><strong>{policy.name}</strong></p>
          <p><span>Provider</span><strong>{providerName}</strong></p>
          <p><span>Category</span><strong>{policy.category || "-"}</strong></p>
          <p><span>Coverage</span><strong>{formatCurrency(policy.coverage)}</strong></p>
          <p><span>Annual Premium</span><strong>{formatCurrency(policy.premium)}</strong></p>
        </div>
        <form onSubmit={submit} className="app-modal-form">
          <label className="app-modal-field">
            <span>Full Name <span className="req">*</span></span>
            <input type="text" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} placeholder="Enter your full name" required />
          </label>
          <label className="app-modal-field">
            <span>Phone Number</span>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter contact number" />
          </label>
          <p className="app-modal-note">This is a demo application. No payment or financial details are required.</p>
          {error && <p className="app-modal-error">{error}</p>}
          <div className="app-modal-actions">
            <button type="submit" className="btn-purple full" disabled={submitting}>{submitting ? "Submitting..." : "Submit Application"}</button>
            <button type="button" className="btn-outline full" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Application Confirmation Modal
function ConfirmationModal({ policy, providerName, onClose }) {
  return (
    <div className="app-modal-overlay" onClick={onClose}>
      <div className="app-modal app-modal-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">✓</div>
        <h3>Application Submitted Successfully</h3>
        <p className="confirm-desc">Your application for <strong>{policy.name}</strong> by <strong>{providerName}</strong> has been received and is currently <strong>pending review</strong>.</p>
        <p className="confirm-note">This is a demo application. No real policy has been issued.</p>
        <button className="btn-purple full" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

export default function PolicyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [showApply, setShowApply] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/policies/${id}`)
      .then((res) => res.json())
      .then(setPolicy);
  }, [id]);

  if (!policy) {
    return <h3 className="loading-state">Loading policy details...</h3>;
  }

  // Provider name from nested provider object returned by API
  const providerName = policy.provider?.name || "Insurance Provider";
  const benefits = splitBenefits(policy.benefits);

  const handleBuyPlan = () => {
    const token = localStorage.getItem("access_token");
    if (!token) { navigate("/login"); return; }
    setShowApply(true);
  };

  return (
    <div className="policy-details-container policy-details-page-clean">
      <div className="policy-details-layout">
        <section className="policy-details-main">
          <div className="policy-title-block">
            <span className="section-kicker">Policy Details</span>
            <h2 className="policy-title">{policy.name}</h2>
            <p>{providerName}{policy.category ? " · " + policy.category : ""}</p>
          </div>

          <div className="policy-info-grid">
            <div className="info-tile"><span>Coverage Amount</span><strong>{formatCurrency(policy.coverage)}</strong></div>
            <div className="info-tile"><span>Annual Premium</span><strong>{formatCurrency(policy.premium)}</strong></div>
            <div className="info-tile"><span>Policy Code</span><strong>{policy.policy_number || "-"}</strong></div>
          </div>

          <section className="policy-section-card">
            <h3>Benefits</h3>
            <ul className="policy-detail-list">{benefits.map((b, i) => <li key={i}>{b}</li>)}</ul>
          </section>

          <section className="policy-section-card">
            <h3>Eligibility</h3>
            <ul className="policy-detail-list">
              <li>Applicant should have valid identity and contact details.</li>
              <li>Eligibility and premium may vary based on age, health and risk profile.</li>
              <li>Final policy issuance is subject to insurer verification.</li>
            </ul>
          </section>

          <section className="policy-section-card">
            <h3>Documents Required</h3>
            <ul className="policy-detail-list">
              <li>Identity proof (Aadhaar, PAN, Passport)</li>
              <li>Address proof</li>
              <li>Income or medical documents if requested by insurer</li>
            </ul>
          </section>

          <section className="policy-section-card">
            <h3>Terms &amp; Conditions</h3>
            <p>{policy.terms_conditions || "Policy is subject to standard terms and conditions. Premiums must be paid on time to keep the policy active. Claims are subject to verification by the insurer."}</p>
          </section>
        </section>

        <aside className="policy-summary-panel">
          <div className="provider-logo large" aria-hidden="true">{providerName.charAt(0).toUpperCase()}</div>
          <h3>{providerName}</h3>
          <p className="policy-badge">{policy.category || "Insurance"}</p>
          <div className="summary-price">
            <span>Premium</span>
            <strong>{formatCurrency(policy.premium)}</strong>
            <small>per year</small>
          </div>
          <button className="btn-purple full" type="button" onClick={handleBuyPlan}>Buy Plan</button>
          <button className="btn-outline full" type="button" onClick={() => navigate("/compare")}>Compare Plan</button>
          <button className="btn-outline full" type="button" onClick={() => navigate(-1)}>Back</button>
        </aside>
      </div>

      {showApply && (
        <ApplicationModal
          policy={policy}
          providerName={providerName}
          onClose={() => setShowApply(false)}
          onSuccess={() => { setShowApply(false); setShowConfirm(true); }}
        />
      )}
      {showConfirm && (
        <ConfirmationModal
          policy={policy}
          providerName={providerName}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
