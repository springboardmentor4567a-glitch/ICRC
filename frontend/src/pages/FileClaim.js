import React, { useState } from "react";
import "./claims.css";

export default function FileClaim() {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");

  const [form, setForm] = useState({
    user_name: "",
    policy_number: "",
    claim_type: "",
    incident_date: "",
    amount: "",
    reason: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState(null);

  /* ================= FORM CHANGE ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= FILE HANDLING ================= */
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFileError("");

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const maxSize = 10 * 1024 * 1024;

    for (let file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setFileError("Only PDF, JPG, and PNG files are allowed.");
        return;
      }
      if (file.size > maxSize) {
        setFileError("Each file must be under 10MB.");
        return;
      }
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  /* ================= SUBMIT CLAIM ================= */
  const submitClaim = async () => {
    if (
      !form.user_name.trim() ||
      !form.policy_number.trim() ||
      !form.claim_type ||
      !form.incident_date ||
      !form.amount ||
      !form.reason.trim()
    ) {
      setMessage("❌ Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const payload = {
        user_name: form.user_name,
        policy_number: form.policy_number,
        claim_type: form.claim_type,
        incident_date: form.incident_date,
        amount: Number(form.amount),
        reason: form.reason
      };

      const res = await fetch("http://127.0.0.1:8000/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        setMessage(err.detail || "Invalid data");
        return;
      }

      const data = await res.json();
      setReceipt(data);
      setMessage("✅ Claim submitted successfully. Confirmation email sent.");
    } catch {
      setMessage("❌ Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= PRINT ================= */
  const handlePrint = () => {
    setTimeout(() => window.print(), 300);
  };

  return (
    <>
      <div className="page-center">
        <h2 className="page-title">Insurance Claim Assistant</h2>
        <p className="page-desc">
          Submit and track your insurance claims securely — upload documents,
          review details, and receive real-time updates.
        </p>

        {message && <p className="msg">{message}</p>}

        {/* ================= FORM ================= */}
        {!receipt && (
          <div className="card">

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <h3 className="step-title">Step 1: Policy Details</h3>

                <input
                  className="input-box"
                  name="user_name"
                  placeholder="Full Name"
                  onChange={handleChange}
                />

                <input
                  className="input-box"
                  name="policy_number"
                  placeholder="Policy Number"
                  onChange={handleChange}
                />

                <select
                  className="input-box"
                  name="claim_type"
                  onChange={handleChange}
                >
                  <option value="">Select Claim Type</option>
                  <option>Hospital</option>
                  <option>Accident</option>
                  <option>Theft</option>
                </select>

                <button className="btn-purple full" onClick={() => setStep(2)}>
                  Continue
                </button>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <h3 className="step-title">Step 2: Incident & Documents</h3>

                <input
                  type="date"
                  className="input-box"
                  name="incident_date"
                  onChange={handleChange}
                />

                <input
                  className="input-box"
                  name="amount"
                  placeholder="Amount Claimed (₹)"
                  onChange={handleChange}
                />

                <textarea
                  className="input-box"
                  name="reason"
                  placeholder="Briefly explain the reason for filing this claim"
                  onChange={handleChange}
                />

                {/* UPLOAD */}
                <div className="upload-section">
                  <h4 className="upload-title">Upload Supporting Documents</h4>
                  <p className="upload-desc">Required documents:</p>

                  <ul className="required-docs">
                    <li>Hospital bills / invoices</li>
                    <li>Doctor’s prescription</li>
                    <li>Medical or incident reports</li>
                  </ul>

                  <label className="upload-box">
                    <input
                      type="file"
                      multiple
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                    <div className="upload-inner">
                      <p className="upload-main">📁 Drag & drop files here</p>
                      <p className="upload-sub">or click to browse</p>
                      <p className="upload-hint">PDF, JPG, PNG • Max 10MB per file</p>
                    </div>
                  </label>

                  {fileError && <p className="error-text">{fileError}</p>}

                  {files.length > 0 && (
                    <div className="file-preview">
                      {files.map((file, i) => (
                        <div key={i} className="file-item">
                          📎 {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="btn-row">
                  <button className="btn-outline" onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button className="btn-purple" onClick={() => setStep(3)}>
                    Review
                  </button>
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <h3 className="step-title">Step 3: Review & Submit</h3>

                <div className="review-box">
                  <p><b>Name:</b> {form.user_name}</p>
                  <p><b>Policy:</b> {form.policy_number}</p>
                  <p><b>Type:</b> {form.claim_type}</p>
                  <p><b>Date:</b> {form.incident_date}</p>
                  <p><b>Amount:</b> ₹{form.amount}</p>

                  <p><b>Reason:</b></p>
                  <div className="review-reason">{form.reason}</div>

                  <p><b>Documents:</b></p>
                  <ul className="review-doc-list">
                    {files.map((f, i) => (
                      <li key={i}> 📎 {f.name}</li>
                    ))}
                  </ul>
                </div>

                <div className="btn-row">
                  <button className="btn-outline" onClick={() => setStep(2)}>
                    Back
                  </button>
                  <button
                    className="btn-purple"
                    onClick={submitClaim}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Claim"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= SUCCESS ================= */}
        {receipt && (
          <div className="card receipt">
            <h3 className="receipt-title">🧾 Claim Submitted Successfully</h3>

            <div className="receipt-details">
              <p>
                <span className="label">Claim ID</span>
                <span className="value">#{receipt.id}</span>
              </p>

              <p>
                <span className="label">Status</span>
                <span className={`status ${receipt.status}`}>
                  {receipt.status}
                </span>
              </p>
            </div>

            <p className="receipt-note">
              You can track the status of your claim anytime from <b>My Claims</b>.
            </p>

            <div className="btn-row">
              <button
  className="btn-purple full"
  onClick={() => (window.location.href = "/my-claims")}
>
  📊 Track My Claims Status
</button>

              <button className="btn-purple" onClick={handlePrint}>
                Print Claim Summary
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
