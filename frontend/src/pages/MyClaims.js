import React, { useEffect, useState } from "react";
import "./claims.css";

const timelineSteps = ["Submitted", "Under Review", "Documents Verified", "Approved", "Completed"];

function activeStep(status) {
  if (status === "approved") return 3;
  if (status === "in_progress") return 1;
  if (status === "rejected") return 1;
  return 0;
}

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchClaims();
  }, [filter]);

  const fetchClaims = async () => {
    const url =
      filter === "all"
        ? "http://127.0.0.1:8000/claims"
        : `http://127.0.0.1:8000/claims/status/${filter}`;

    const res = await fetch(url);
    const data = await res.json();
    setClaims(data);
  };

  return (
    <div className="page-center claims-page-clean">
      <div className="page-header-block">
        <span className="section-kicker">Claim Tracking</span>
        <h2 className="page-title">My Claims</h2>
        <p className="page-desc">Track submitted claims and review current processing status.</p>
      </div>

      <div className="status-tabs">
        {["all", "submitted", "in_progress", "approved", "rejected"].map((s) => (
          <button key={s} className={`tab-btn ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>
            {s.replace("_", " ").toUpperCase()}
          </button>
        ))}
      </div>

      <div className="claims-list">
        {claims.map((claim) => {
          const currentStep = activeStep(claim.status);
          return (
            <article key={claim.id} className={`claim-card ${claim.status}`}>
              <div className="claim-content">
                <div className="claim-top">
                  <div>
                    <h4>Claim #{claim.id}</h4>
                    <p className="claim-policy"><b>Policy:</b> {claim.policy_number}</p>
                  </div>
                  <span className={`status ${claim.status}`}>{claim.status.replace("_", " ")}</span>
                </div>

                <p className="claim-amount">?{claim.amount}</p>

                <div className="claim-timeline" aria-label="Claim status timeline">
                  {timelineSteps.map((step, index) => (
                    <div className={`timeline-step ${index <= currentStep ? "active" : ""}`} key={step}>
                      <span />
                      <p>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}