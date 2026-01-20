import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/fileclaim.css";

export default function FileClaim() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    policy_id: "",
    claim_amount: "",
    reason: "",
    document: null,
  });

  useEffect(() => {
    const storedPolicy = localStorage.getItem("policy_id");
    if (storedPolicy) {
      setFormData((prev) => ({ ...prev, policy_id: storedPolicy }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      document: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("policy_id", Number(formData.policy_id));
      data.append("claim_amount", Number(formData.claim_amount));
      data.append("reason", formData.reason);
      data.append("document", formData.document);

      await axios.post("http://127.0.0.1:8000/claims/", data);

      setFormData({
        policy_id: "",
        claim_amount: "",
        reason: "",
        document: null,
      });
    } catch (error) {
      console.error("Claim error:", error.response?.data || error);
      alert("❌ Failed to submit claim");
    }
  };

  return (
    <div className="claim-wrapper">
      {/* 🔙 BACK BUTTON */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "6px 12px",
          fontSize: "13px",
          borderRadius: "18px",
          border: "none",
          background: "#34d399",
          color: "#fff",
          cursor: "pointer",
          width: "auto",
          maxWidth: "fit-content",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          whiteSpace: "nowrap",
          zIndex: 1000,
        }}
      >
        ← Back
      </button>

      <h2>📄 File Insurance Claim</h2>

      <form className="claim-form" onSubmit={handleSubmit}>
        <input
          type="number"
          name="policy_id"
          placeholder="Policy ID"
          value={formData.policy_id}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="claim_amount"
          placeholder="Claim Amount"
          value={formData.claim_amount}
          onChange={handleChange}
          required
        />

        <textarea
          name="reason"
          placeholder="Reason for claim"
          value={formData.reason}
          onChange={handleChange}
          required
        />

        <input type="file" onChange={handleFileChange} required />
        <button type="submit">Submit Claim</button>
      </form>
    </div>
  );
}
