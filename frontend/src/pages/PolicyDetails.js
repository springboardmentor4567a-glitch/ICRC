import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";

export default function PolicyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/policies/${id}`)
      .then((res) => res.json())
      .then(setPolicy);
  }, [id]);

  if (!policy) {
    return (
      <h3 style={{ textAlign: "center", marginTop: 80, color: "#6C63FF" }}>
        Loading policy details...
      </h3>
    );
  }

  return (
    <>
      <Header />

      <div className="policy-details-container">
        <div className="policy-details-card">
          <h2 className="policy-title">{policy.name}</h2>

          <div className="policy-section">
            <p><b>Provider:</b> {policy.provider_name || "—"}</p>
            <p><b>Category:</b> {policy.category}</p>
            <p><b>Policy Code:</b> {policy.policy_number}</p>
          </div>

          <div className="policy-section">
            <p><b>Coverage Amount:</b> ₹{policy.coverage}</p>
            <p><b>Annual Premium:</b> ₹{policy.premium}</p>
          </div>

          <div className="policy-section">
            <h4>Benefits</h4>
            <p>{policy.benefits}</p>
          </div>

          {/* ✅ TERMS & CONDITIONS */}
          <div className="policy-section">
            <h4>Terms & Conditions</h4>
            <p>
              {policy.terms_conditions ||
                "Policy is subject to standard terms and conditions. Premiums must be paid on time to keep the policy active. Claims are subject to verification by the insurer."}
            </p>
          </div>

          {/* ✅ ACTION BUTTONS */}
          <div className="policy-actions-row">
            <button
              className="btn-outline"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>

            <button
              className="btn-purple"
              onClick={() => navigate("/compare")}
            >
              Go to Compare
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
