import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Profile.css";

// ── Currency formatter
function formatCurrency(value) {
  if (!value && value !== 0) return "Not provided";
  // Check if it's already a formatted string like "5L" or "1-3L"
  if (typeof value === "string" && value.includes("L")) return value;
  const num = Number(value);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch("http://127.0.0.1:8000/users/me", {
        headers: { Authorization: `Bearer ${token}`, token: token },
      }).then((res) => (res.ok ? res.json() : null)),
      fetch("http://127.0.0.1:8000/users/me/preferences", {
        headers: { Authorization: `Bearer ${token}`, token: token },
      }).then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([userData, prefData]) => {
        setUser(userData);
        setPrefs(prefData || {});
      })
      .catch((err) => console.error("Error fetching profile data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleEditClick = () => {
    setEditForm({
      name: user.name || "",
      phone: user.phone || "",
      age: prefs.age || "",
      gender: prefs.gender || "male",
      marital_status: prefs.marital_status || "single",
      employment_type: prefs.employment_type || "salaried",
      annual_income: prefs.annual_income || "1-3L",
      dependents: prefs.dependents !== undefined && prefs.dependents !== null ? prefs.dependents : 0,
      smoker: prefs.smoker || false,
      pre_existing_conditions: prefs.pre_existing_conditions || false,
    });
    setUpdateError("");
    setIsEditing(true);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://127.0.0.1:8000/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        token: token,
      },
      body: JSON.stringify({
        full_name: editForm.name,
        phone: editForm.phone,
        age: Number(editForm.age),
        gender: editForm.gender,
        marital_status: editForm.marital_status,
        employment_type: editForm.employment_type,
        annual_income: editForm.annual_income,
        dependents: Number(editForm.dependents),
        smoker: Boolean(editForm.smoker),
        pre_existing_conditions: Boolean(editForm.pre_existing_conditions),
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update profile");
        return res.json();
      })
      .then((updatedUser) => {
        setUser(updatedUser);
        return fetch("http://127.0.0.1:8000/users/me/preferences", {
          headers: { Authorization: `Bearer ${token}`, token: token },
        });
      })
      .then((res) => res.json())
      .then((prefData) => {
        setPrefs(prefData || {});
        setIsEditing(false);
      })
      .catch((err) => {
        console.error(err);
        setUpdateError("Failed to update profile. Please try again.");
      });
  };

  if (loading) {
    return (
      <div className="profile-page-clean">
        <div className="prof-loading"><span className="prof-spinner" /> Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page-clean">
        <div className="prof-empty">Session expired. Please <Link to="/login">login</Link>.</div>
      </div>
    );
  }

  const avatarLetter = (user.name?.charAt(0) || user.email?.charAt(0) || "U").toUpperCase();

  // ── Compute Profile Completion
  // Available fields we check for completeness:
  // User: name, email, phone (3)
  // Prefs: age, gender, marital_status, dependents, policy_type, coverage_amount, smoker, pre_existing_conditions, annual_income, employment_type (10)
  const totalFields = 13;
  let filledFields = 0;
  if (user.name) filledFields++;
  if (user.email) filledFields++;
  if (user.phone) filledFields++;
  
  if (prefs.age) filledFields++;
  if (prefs.gender) filledFields++;
  if (prefs.marital_status) filledFields++;
  if (prefs.dependents !== undefined && prefs.dependents !== null && prefs.dependents !== "") filledFields++;
  if (prefs.policy_type) filledFields++;
  if (prefs.coverage_amount) filledFields++;
  if (prefs.smoker !== undefined && prefs.smoker !== null) filledFields++;
  if (prefs.pre_existing_conditions !== undefined && prefs.pre_existing_conditions !== null) filledFields++;
  if (prefs.annual_income) filledFields++;
  if (prefs.employment_type) filledFields++;

  const completionPct = Math.round((filledFields / totalFields) * 100);

  // ── Compute Risk Level based on existing data if available
  let riskLevel = "Not evaluated";
  if (prefs.age) {
    let riskScore = 1;
    if (prefs.age > 45) riskScore += 1;
    if (prefs.smoker) riskScore += 1;
    if (prefs.pre_existing_conditions) riskScore += 1;

    if (riskScore >= 3) riskLevel = "High";
    else if (riskScore === 2) riskLevel = "Moderate";
    else riskLevel = "Low";
  } else {
    riskLevel = "Complete your insurance preferences to view risk assessment.";
  }

  const DataItem = ({ label, value, fallback = "Not provided" }) => (
    <div className="prof-data-item">
      <span className="prof-data-label">{label}</span>
      <strong className="prof-data-value">{value !== undefined && value !== null && value !== "" ? value : fallback}</strong>
    </div>
  );

  return (
    <div className="profile-page-clean">
      
      {/* ── PROFILE HEADER ── */}
      <section className="prof-header-card fade-in">
        <div className="prof-header-main">
          <div className="prof-avatar">{avatarLetter}</div>
          <div className="prof-user-info">
            <h2 className="prof-name">{user.name || "Not provided"}</h2>
            <p className="prof-email">{user.email || "Not provided"}</p>
            <span className="prof-status-badge active">● Active</span>
          </div>
        </div>
        
        <div className="prof-completion-block">
          <div className="prof-completion-text">
            <span>Profile Completion</span>
            <strong>{completionPct}%</strong>
          </div>
          <div className="prof-progress-bar">
            <div className="prof-progress-fill" style={{ width: `${completionPct}%` }} />
          </div>
          <button className="prof-edit-btn" onClick={handleEditClick}>
            Edit Profile
          </button>
        </div>
      </section>

      {/* ── EDIT PROFILE MODAL ── */}
      {isEditing && (
        <div className="prof-modal-backdrop">
          <div className="prof-modal">
            <h3 className="prof-modal-title">Edit Profile Details</h3>
            <form onSubmit={handleUpdateSubmit}>
              {updateError && <p className="prof-modal-error">{updateError}</p>}
              
              <div className="prof-modal-scroll-area">
                <div className="prof-modal-grid">
                  <div className="prof-modal-field">
                    <label className="prof-modal-label" htmlFor="edit-name">Full Name</label>
                    <input
                      id="edit-name"
                      type="text"
                      className="prof-modal-input"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="prof-modal-field">
                    <label className="prof-modal-label" htmlFor="edit-phone">Phone Number</label>
                    <input
                      id="edit-phone"
                      type="text"
                      className="prof-modal-input"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div className="prof-modal-field">
                    <label className="prof-modal-label" htmlFor="edit-age">Age</label>
                    <input
                      id="edit-age"
                      type="number"
                      className="prof-modal-input"
                      value={editForm.age}
                      onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                      min="1" max="100"
                      required
                    />
                  </div>

                  <div className="prof-modal-field">
                    <label className="prof-modal-label" htmlFor="edit-gender">Gender</label>
                    <select
                      id="edit-gender"
                      className="prof-modal-input"
                      value={editForm.gender}
                      onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div className="prof-modal-field">
                    <label className="prof-modal-label" htmlFor="edit-marital">Marital Status</label>
                    <select
                      id="edit-marital"
                      className="prof-modal-input"
                      value={editForm.marital_status}
                      onChange={(e) => setEditForm(prev => ({ ...prev, marital_status: e.target.value }))}
                    >
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                    </select>
                  </div>

                  <div className="prof-modal-field">
                    <label className="prof-modal-label" htmlFor="edit-employment">Employment Type</label>
                    <select
                      id="edit-employment"
                      className="prof-modal-input"
                      value={editForm.employment_type}
                      onChange={(e) => setEditForm(prev => ({ ...prev, employment_type: e.target.value }))}
                    >
                      <option value="salaried">Salaried</option>
                      <option value="self-employed">Self Employed</option>
                      <option value="student">Student</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>

                  <div className="prof-modal-field">
                    <label className="prof-modal-label" htmlFor="edit-income">Annual Income</label>
                    <select
                      id="edit-income"
                      className="prof-modal-input"
                      value={editForm.annual_income}
                      onChange={(e) => setEditForm(prev => ({ ...prev, annual_income: e.target.value }))}
                    >
                      <option value="1-3L">1 – 3 Lakhs</option>
                      <option value="3-5L">3 – 5 Lakhs</option>
                      <option value="5L+">5+ Lakhs</option>
                    </select>
                  </div>

                  <div className="prof-modal-field">
                    <label className="prof-modal-label" htmlFor="edit-dependents">Dependents</label>
                    <input
                      id="edit-dependents"
                      type="number"
                      className="prof-modal-input"
                      value={editForm.dependents}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dependents: e.target.value }))}
                      min="0"
                      required
                    />
                  </div>

                  <div className="prof-modal-field">
                    <label className="prof-modal-label" htmlFor="edit-smoker">Smoker</label>
                    <select
                      id="edit-smoker"
                      className="prof-modal-input"
                      value={editForm.smoker ? "yes" : "no"}
                      onChange={(e) => setEditForm(prev => ({ ...prev, smoker: e.target.value === "yes" }))}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>

                  <div className="prof-modal-field">
                    <label className="prof-modal-label" htmlFor="edit-conditions">Pre-existing Conditions</label>
                    <select
                      id="edit-conditions"
                      className="prof-modal-input"
                      value={editForm.pre_existing_conditions ? "yes" : "no"}
                      onChange={(e) => setEditForm(prev => ({ ...prev, pre_existing_conditions: e.target.value === "yes" }))}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="prof-modal-buttons">
                <button type="button" className="prof-modal-btn secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="prof-modal-btn primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="prof-grid-layout fade-in-delay">
        
        {/* ── LEFT COLUMN ── */}
        <div className="prof-col">
          
          <div className="prof-card">
            <h3 className="prof-card-title">Personal Information</h3>
            <div className="prof-card-grid">
              <DataItem label="Full Name" value={user.name} />
              <DataItem label="Email" value={user.email} />
              <DataItem label="Phone" value={user.phone} />
              <DataItem label="Age" value={prefs.age} />
              <DataItem label="Gender" value={prefs.gender ? prefs.gender.charAt(0).toUpperCase() + prefs.gender.slice(1) : ""} />
              <DataItem label="Marital Status" value={prefs.marital_status ? prefs.marital_status.charAt(0).toUpperCase() + prefs.marital_status.slice(1) : ""} />
            </div>
          </div>

          <div className="prof-card">
            <h3 className="prof-card-title">Insurance Profile</h3>
            <div className="prof-card-grid">
              <DataItem label="Employment" value={prefs.employment_type ? prefs.employment_type.charAt(0).toUpperCase() + prefs.employment_type.slice(1) : ""} />
              <DataItem label="Annual Income" value={prefs.annual_income} />
              <DataItem label="Dependents" value={prefs.dependents} />
              <DataItem label="Smoker" value={prefs.smoker !== undefined ? (prefs.smoker ? "Yes" : "No") : ""} />
              <DataItem label="Pre-existing Conditions" value={prefs.pre_existing_conditions !== undefined ? (prefs.pre_existing_conditions ? "Yes" : "No") : ""} />
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="prof-col">
          
          <div className="prof-card">
            <h3 className="prof-card-title">Coverage Summary</h3>
            <div className="prof-coverage-block">
              <DataItem label="Preferred Policy Type" value={prefs.policy_type ? prefs.policy_type.charAt(0).toUpperCase() + prefs.policy_type.slice(1) : ""} />
              <DataItem label="Preferred Coverage" value={formatCurrency(prefs.coverage_amount)} />
              <div className="prof-data-item mt-3">
                <span className="prof-data-label">Active Policies</span>
                <strong className="prof-data-value text-muted">No active policy currently bound.</strong>
              </div>
            </div>
          </div>

          <div className="prof-card">
            <h3 className="prof-card-title">Risk Profile</h3>
            {riskLevel === "Low" || riskLevel === "Moderate" || riskLevel === "High" ? (
              <div className="prof-risk-box">
                <span className={`prof-risk-badge ${riskLevel.toLowerCase()}`}>{riskLevel}</span>
                <p className="prof-risk-desc">Based on your saved insurance preferences.</p>
              </div>
            ) : (
              <p className="prof-risk-desc text-muted">{riskLevel}</p>
            )}
          </div>

          <div className="prof-card">
            <h3 className="prof-card-title">Account Activity</h3>
            <ul className="prof-activity-list">
              <li>
                <span className="prof-act-dot"></span>
                <div>
                  <strong>Profile initialized</strong>
                  <span>Account active and ready for policy matching.</span>
                </div>
              </li>
              {completionPct > 50 && (
                <li>
                  <span className="prof-act-dot"></span>
                  <div>
                    <strong>Preferences updated</strong>
                    <span>Insurance matching profile saved.</span>
                  </div>
                </li>
              )}
            </ul>
          </div>

        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <section className="prof-card mt-4 fade-in-delay-2">
        <h3 className="prof-card-title">Quick Actions</h3>
        <div className="prof-actions-grid">
          <Link to="/preferences" className="prof-action-card">
            <span className="prof-action-icon">&#9881;</span>
            <strong>Update Preferences</strong>
            <p>Modify your insurance requirements</p>
          </Link>
          <Link to="/plans" className="prof-action-card">
            <span className="prof-action-icon">&#128269;</span>
            <strong>Browse Policies</strong>
            <p>View all available insurance plans</p>
          </Link>
          <Link to="/recommend" className="prof-action-card">
            <span className="prof-action-icon">&#11088;</span>
            <strong>View Recommendations</strong>
            <p>See plans matched to your profile</p>
          </Link>
          <Link to="/calculator" className="prof-action-card">
            <span className="prof-action-icon">&#128181;</span>
            <strong>Premium Calculator</strong>
            <p>Estimate your monthly payments</p>
          </Link>
          <Link to="/my-claims" className="prof-action-card">
            <span className="prof-action-icon">&#128193;</span>
            <strong>My Claims</strong>
            <p>Track your submitted claims</p>
          </Link>
        </div>
      </section>

    </div>
  );
}
