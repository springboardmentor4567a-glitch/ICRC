import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserPreferences.css";

// ── Field-level validation
function validate(form) {
  const errors = {};
  const age = Number(form.age);
  if (!form.age || isNaN(age) || age < 1 || age > 100)
    errors.age = "Enter a valid age between 1 and 100.";
  if (!form.gender)
    errors.gender = "Please select a gender.";
  if (!form.marital_status)
    errors.marital_status = "Please select marital status.";
  const dep = Number(form.dependents);
  if (form.dependents === "" || isNaN(dep) || dep < 0)
    errors.dependents = "Dependents cannot be negative.";
  if (!form.employment_type)
    errors.employment_type = "Please select employment type.";
  if (!form.annual_income)
    errors.annual_income = "Please select an income range.";
  if (!form.policy_type)
    errors.policy_type = "Please select a policy type.";
  if (!form.coverage_amount)
    errors.coverage_amount = "Please select a coverage amount.";
  return errors;
}

export default function UserPreferences() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    age: "",
    gender: "",
    employment_type: "",
    marital_status: "",
    policy_type: "",
    annual_income: "",
    coverage_amount: "",
    dependents: "",
    smoker: false,
    pre_existing_conditions: false,
  });

  /* ---------- Handle Input Change (identical logic, preserved) ---------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  /* ---------- Submit Preferences (API call identical to original) ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Frontend validation
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Session expired. Please login again.");
      return;
    }

    const payload = {
      age: Number(form.age),
      gender: form.gender,
      employment_type: form.employment_type,
      marital_status: form.marital_status,
      policy_type: form.policy_type,
      annual_income: form.annual_income,
      coverage_amount: form.coverage_amount,
      dependents: Number(form.dependents),
      smoker: form.smoker,
      pre_existing_conditions: form.pre_existing_conditions,
    };

    setSubmitting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/users/me/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Backend error:", errText);
        setError(`Backend Error: ${res.status} - ${errText}`);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/recommend"), 1200);
    } catch (err) {
      console.error(err);
      setError("Server not reachable. Try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helper to render a labelled select
  const Field = ({ id, label, hint, error, children }) => (
    <div className="pref-form-field">
      <label className="pref-form-label" htmlFor={id}>
        {label} <span className="pref-req">*</span>
      </label>
      {children}
      {hint && !error && <p className="pref-hint">{hint}</p>}
      {error && <p className="pref-field-error">{error}</p>}
    </div>
  );

  return (
    <div className="pref-page">
      {/* ── Page Header ── */}
      <div className="pref-page-header">
        <span className="pref-kicker">Insurance Recommendations</span>
        <h2 className="pref-page-title">Insurance Recommendation Profile</h2>
        <p className="pref-page-desc">
          Tell us about your needs so we can identify insurance plans that best match your profile.
        </p>
        <div className="pref-info-banner">
          Your preferences help us compare available policies based on coverage, affordability and personal requirements.
        </div>
      </div>

      {/* ── Status messages ── */}
      {error && <div className="pref-alert error">{error}</div>}
      {success && <div className="pref-alert success">Preferences saved. Redirecting to recommendations&hellip;</div>}

      <form onSubmit={handleSubmit} noValidate>

        {/* ══════════════════════════════════════
            SECTION 1 — Personal Profile
            ══════════════════════════════════════ */}
        <section className="pref-section">
          <div className="pref-section-header">
            <span className="pref-section-num">1</span>
            <div>
              <h3 className="pref-section-title">Personal Profile</h3>
              <p className="pref-section-desc">Basic details to match policies suited for your age group and family situation.</p>
            </div>
          </div>

          <div className="pref-grid">
            <Field id="age" label="Age"
              hint="Used to identify policies suitable for your age group."
              error={fieldErrors.age}>
              <input
                id="age" type="number" name="age"
                className={`pref-input ${fieldErrors.age ? "pref-input-error" : ""}`}
                value={form.age} onChange={handleChange}
                placeholder="e.g. 30" min="1" max="100"
              />
            </Field>

            <Field id="gender" label="Gender" error={fieldErrors.gender}>
              <select id="gender" name="gender"
                className={`pref-input ${fieldErrors.gender ? "pref-input-error" : ""}`}
                value={form.gender} onChange={handleChange}>
                <option value="">-- Select --</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </Field>

            <Field id="marital_status" label="Marital Status" error={fieldErrors.marital_status}>
              <select id="marital_status" name="marital_status"
                className={`pref-input ${fieldErrors.marital_status ? "pref-input-error" : ""}`}
                value={form.marital_status} onChange={handleChange}>
                <option value="">-- Select --</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
              </select>
            </Field>

            <Field id="dependents" label="Dependents"
              hint="Number of family members financially dependent on you."
              error={fieldErrors.dependents}>
              <input
                id="dependents" type="number" name="dependents"
                className={`pref-input ${fieldErrors.dependents ? "pref-input-error" : ""}`}
                value={form.dependents} onChange={handleChange}
                placeholder="e.g. 2" min="0" max="10"
              />
            </Field>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 2 — Financial Profile
            ══════════════════════════════════════ */}
        <section className="pref-section">
          <div className="pref-section-header">
            <span className="pref-section-num">2</span>
            <div>
              <h3 className="pref-section-title">Financial Profile</h3>
              <p className="pref-section-desc">Your income and employment status help determine affordable premium ranges.</p>
            </div>
          </div>

          <div className="pref-grid">
            <Field id="employment_type" label="Employment Type" error={fieldErrors.employment_type}>
              <select id="employment_type" name="employment_type"
                className={`pref-input ${fieldErrors.employment_type ? "pref-input-error" : ""}`}
                value={form.employment_type} onChange={handleChange}>
                <option value="">-- Select --</option>
                <option value="student">Student</option>
                <option value="salaried">Salaried</option>
                <option value="self-employed">Self-Employed</option>
              </select>
            </Field>

            <Field id="annual_income" label="Annual Income"
              hint="Helps estimate an affordable premium range."
              error={fieldErrors.annual_income}>
              <select id="annual_income" name="annual_income"
                className={`pref-input ${fieldErrors.annual_income ? "pref-input-error" : ""}`}
                value={form.annual_income} onChange={handleChange}>
                <option value="">-- Select --</option>
                <option value="1-3L">1 – 3 Lakhs</option>
                <option value="3-5L">3 – 5 Lakhs</option>
                <option value="5L+">5+ Lakhs</option>
              </select>
            </Field>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 3 — Insurance Requirements
            ══════════════════════════════════════ */}
        <section className="pref-section">
          <div className="pref-section-header">
            <span className="pref-section-num">3</span>
            <div>
              <h3 className="pref-section-title">Insurance Requirements</h3>
              <p className="pref-section-desc">Select the type of coverage and the level of financial protection you need.</p>
            </div>
          </div>

          <div className="pref-grid">
            <Field id="policy_type" label="Policy Type" error={fieldErrors.policy_type}>
              <select id="policy_type" name="policy_type"
                className={`pref-input ${fieldErrors.policy_type ? "pref-input-error" : ""}`}
                value={form.policy_type} onChange={handleChange}>
                <option value="">-- Select --</option>
                <option value="health">Health</option>
                <option value="life">Life</option>
                <option value="auto">Auto (Motor)</option>
                <option value="home">Home / Property</option>
                <option value="travel">Travel</option>
                <option value="business">Business / Commercial</option>
              </select>
            </Field>

            <Field id="coverage_amount" label="Desired Coverage Amount"
              hint="Select the level of financial protection you are looking for."
              error={fieldErrors.coverage_amount}>
              <select id="coverage_amount" name="coverage_amount"
                className={`pref-input ${fieldErrors.coverage_amount ? "pref-input-error" : ""}`}
                value={form.coverage_amount} onChange={handleChange}>
                <option value="">-- Select --</option>
                <option value="5L">&#8377;5 Lakhs</option>
                <option value="10L">&#8377;10 Lakhs</option>
                <option value="20L">&#8377;20 Lakhs</option>
              </select>
            </Field>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 4 — Health & Risk Profile
            ══════════════════════════════════════ */}
        <section className="pref-section">
          <div className="pref-section-header">
            <span className="pref-section-num">4</span>
            <div>
              <h3 className="pref-section-title">Health &amp; Risk Profile</h3>
              <p className="pref-section-desc">Health information helps identify policies with suitable coverage conditions and premium estimates.</p>
            </div>
          </div>

          <div className="pref-toggle-grid">
            <div className="pref-toggle-card">
              <div className="pref-toggle-main">
                <label className="pref-toggle-label" htmlFor="smoker">Smoker</label>
                <label className="pref-switch" aria-label="Toggle smoker">
                  <input
                    id="smoker" type="checkbox" name="smoker"
                    checked={form.smoker} onChange={handleChange}
                  />
                  <span className="pref-switch-track" />
                </label>
              </div>
              <p className="pref-hint">May affect eligibility and premium estimates.</p>
            </div>

            <div className="pref-toggle-card">
              <div className="pref-toggle-main">
                <label className="pref-toggle-label" htmlFor="pre_existing_conditions">Pre-existing Conditions</label>
                <label className="pref-switch" aria-label="Toggle pre-existing conditions">
                  <input
                    id="pre_existing_conditions" type="checkbox" name="pre_existing_conditions"
                    checked={form.pre_existing_conditions} onChange={handleChange}
                  />
                  <span className="pref-switch-track" />
                </label>
              </div>
              <p className="pref-hint">Helps identify policies with suitable health coverage.</p>
            </div>
          </div>
        </section>

        {/* ── Submit ── */}
        <div className="pref-submit-row">
          <p className="pref-privacy-note">
            Your information is used only to personalise insurance recommendations.
          </p>
          <button type="submit" className="btn-purple pref-submit-btn" disabled={submitting}>
            {submitting ? (
              <span className="pref-btn-loading">
                <span className="pref-spinner" /> Saving&hellip;
              </span>
            ) : (
              "Save Preferences & Get Recommendations"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
