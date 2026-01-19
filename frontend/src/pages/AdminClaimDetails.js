import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminClaimDetails.css";

export default function AdminClaimDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [fraudFlags, setFraudFlags] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem("access_token");

  /* ===== FETCH CLAIM DETAILS ===== */
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/admin/claims/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setClaim(data.claim);
        setFraudFlags(data.fraud_flags || []);
      });
  }, [id, token]);

  /* ===== FETCH DOCUMENTS ===== */
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/admin/claims/${id}/documents`, {
      headers: {
      token: localStorage.getItem("access_token"),
      },
    })
      .then((res) => res.json())
      .then((docs) => {
        setDocuments(Array.isArray(docs) ? docs : []);
      });
  }, [id, token]);

  /* ===== UPDATE STATUS ===== */
  const updateStatus = (status) => {
    setUpdating(true);

    fetch(
      `http://127.0.0.1:8000/admin/claims/${id}/status?status=${status}`,
      {
        method: "PATCH",
        headers: {
    token: localStorage.getItem("access_token"),
        },
      }
    ).then(() => navigate("/admin/claims"));
  };

  if (!claim) return <p>Loading...</p>;

  return (
    <div className="claim-details-page">

      <h2 className="section-title">📄 Claim Details</h2>

      <div className="claim-details-card">
        <p><strong>User:</strong> {claim.user_name}</p>
        <p><strong>Policy No:</strong> {claim.policy_number}</p>
        <p><strong>Amount:</strong> ₹{claim.amount}</p>

        <p>
          <strong>Status:</strong>
          <span className={`status-badge ${claim.status}`}>
            {claim.status.replace("_", " ")}
          </span>
        </p>

        <p><strong>Reason:</strong> {claim.reason}</p>
        <p><strong>Incident Date:</strong> {claim.incident_date}</p>
      </div>

      {/* ===== FRAUD FLAGS ===== */}
      <div className="fraud-section">
        <h3 className="section-title">🚨 Fraud Flags</h3>

        {fraudFlags.length === 0 ? (
          <p className="no-fraud">No fraud detected</p>
        ) : (
          fraudFlags.map((f) => (
            <div key={f.id} className={`fraud-flag ${f.severity}`}>
              {f.rule_code} – {f.details}
            </div>
          ))
        )}
      </div>

      {/* ===== DOCUMENTS ===== */}
      <div className="documents-section">
        <h3 className="section-title">📁 Uploaded Documents</h3>

        {documents.length === 0 ? (
          <p>No documents uploaded</p>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="document-row">
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
              >
                📄 {doc.filename}
              </a>
            </div>
          ))
        )}
      </div>

      {/* ===== ACTION BUTTONS ===== */}
      <div className="action-buttons">
        <button
          className="btn progress"
          disabled={updating || claim.status !== "submitted"}
          onClick={() => updateStatus("in_progress")}
        >
          ⏳ In-Progress
        </button>

        <button
          className="btn approve"
          disabled={updating || claim.status === "approved"}
          onClick={() => updateStatus("approved")}
        >
          ✅ Approve
        </button>

        <button
          className="btn reject"
          disabled={updating || claim.status === "rejected"}
          onClick={() => updateStatus("rejected")}
        >
          ❌ Reject
        </button>
      </div>
    </div>
  );
}
