import React, { useState } from "react";

const POLICY_MAP = {
  Health: [
    { id: "health_plus", title: "Health Plus" },
    { id: "health_plus_plus", title: "Health Plus Plus" },
    { id: "health_plus_max", title: "Health Plus Max" }
  ],
  Auto: [
    { id: "auto_protect", title: "Auto Protect" },
    { id: "auto_protect_plus", title: "Auto Protect Plus" }
  ],
  Home: [
    { id: "home_secure", title: "Home Secure" },
    { id: "home_secure_plus", title: "Home Secure Plus" },
    { id: "home_secure_max", title: "Home Secure Max" }
  ],
  Life: [
    { id: "life_secure", title: "Life Secure" },
    { id: "life_secure_plus", title: "Life Secure Plus" }
  ]
};

const API_URL = "http://127.0.0.1:8000";

export default function ClaimForm({ onBack }) {
  const [type, setType] = useState("Health");
  const [policyId, setPolicyId] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  const submitClaim = async () => {
    const userId = localStorage.getItem("user_id");

    const form = new FormData();
    form.append("policy_id", policyId);
    form.append("description", description);
    form.append("file", file);

    const res = await fetch(`${API_URL}/claims`, {
      method: "POST",
      headers: { "user-id": userId },
      body: form
    });

    const data = await res.json();
    setMsg(data.message || "Submitted");
  };

  return (
    <div className="claim-container">
      <div className="claim-card">
        <button onClick={onBack}>⬅ Back</button>
        <h2>File a Claim</h2>

        <div className="claim-group">
          <label>Policy Type</label>
          <select
            value={type}
            onChange={e => {
              setType(e.target.value);
              setPolicyId("");
            }}
          >
            <option>Health</option>
            <option>Auto</option>
            <option>Home</option>
            <option>Life</option>
          </select>
        </div>

        <div className="claim-group">
          <label>Select Policy</label>
          <select value={policyId} onChange={e => setPolicyId(e.target.value)}>
            <option value="">Select policy</option>
            {POLICY_MAP[type].map(p => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="claim-group">
          <label>Description</label>
          <textarea
            placeholder="Describe issue..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className="claim-group">
          <label>Upload Document</label>
          <input type="file" onChange={e => setFile(e.target.files[0])} />
        </div>

        <button
          className="claim-submit"
          disabled={!policyId || !description}
          onClick={submitClaim}
        >
          Submit Claim
        </button>

        {msg && <div className="claim-msg">{msg}</div>}
      </div>
    </div>
  );
}
