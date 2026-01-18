import React, { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function AdminClaims({ onBack }) {

  const [claims, setClaims] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please login first");
      return;
    }

    fetch(`${API_URL}/admin/claims`, {
      headers: {
        "user-id": user.id
      }
    })
      .then(res => res.json())
      .then(data => setClaims(data));

  }, []);

  const updateStatus = async (id, status) => {

    const user = JSON.parse(localStorage.getItem("user"));

    await fetch(`${API_URL}/claims/${id}/status?status=${status}`, {
      method: "PUT",
      headers: {
        "user-id": user.id
      }
    });

    alert(`Claim ${id} marked as ${status}`);

    fetch(`${API_URL}/admin/claims`, {
      headers: {
        "user-id": user.id
      }
    })
      .then(res => res.json())
      .then(data => setClaims(data));
  };

  return (
    <div className="page-container">

      <button className="back-btn" onClick={onBack}>
        ⬅ Back to Dashboard
      </button>

      <h2>Admin - Manage Claims</h2>

      {claims.length === 0 && <p>No claims available</p>}

      {claims.map(c => (
        <div key={c.id} className="card-box">

          <p><b>Claim ID:</b> {c.id}</p>
          <p><b>User ID:</b> {c.user_id}</p>
          <p><b>Policy:</b> {c.policy_id}</p>
          <p><b>Description:</b> {c.description}</p>
          <p><b>Status:</b> {c.status}</p>
          <p><b>Created At:</b> {new Date(c.created_at).toLocaleString()}</p>

          {c.document_url && (
            <p>
              <b>Uploaded File:</b>{" "}
              <button onClick={() => setPreviewUrl(c.document_url)}>
                Preview Document
              </button>
            </p>
          )}

          <button onClick={() => updateStatus(c.id, "Approved")}>
            Approve
          </button>

          <button onClick={() => updateStatus(c.id, "Rejected")}>
            Reject
          </button>

        </div>
      ))}

      {previewUrl && (
        <div style={{ marginTop: "20px", border: "1px solid gray", padding: "10px" }}>

          <h3>Document Preview</h3>

          {previewUrl.endsWith(".png") ||
           previewUrl.endsWith(".jpg") ||
           previewUrl.endsWith(".jpeg") ? (
            <img
              src={previewUrl}
              alt="document"
              style={{ maxWidth: "100%" }}
            />
          ) : (
            <iframe
              src={previewUrl}
              width="100%"
              height="500px"
              title="document"
            ></iframe>
          )}

          <br />

          <button onClick={() => setPreviewUrl(null)}>
            Close Preview
          </button>

        </div>
      )}

    </div>
  );
}
