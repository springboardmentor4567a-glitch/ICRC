import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserPreferences() {
  const navigate = useNavigate();

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    age: "",
    gender: "",
    smoker: false,
    marital_status: "",
    policy_type: "",
    annual_income: "",
    dependents: "",
    pre_existing_conditions: false,
    employment_type: "",
    coverage_amount: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Session expired. Please login again.");
      return;
    }

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/users/me/preferences",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token, // ✅ backend expects this
          },
          body: JSON.stringify({
            age: Number(form.age),
            gender: form.gender,
            smoker: form.smoker,
            marital_status: form.marital_status,
            policy_type: form.policy_type,
            employment_type: form.employment_type,
            pre_existing_conditions: form.pre_existing_conditions,
            dependents: Number(form.dependents),

            // ✅ SEND AS STRINGS (CRITICAL FIX)
            annual_income: form.annual_income,
            coverage_amount: form.coverage_amount,
          }),
        }
      );

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/recommend"), 1200);
      } else {
        const msg = await res.text();
        console.error("Backend error:", msg);
        setError("Invalid preference values. Please review inputs.");
      }
    } catch (err) {
      console.error(err);
      setError("Server not reachable. Try again later.");
    }
  };

  return (
    <div className="pref-container">
      <div className="pref-card">
        <h2 className="page-title">User Preferences</h2>
        <p className="page-desc">
          Help us recommend the best insurance for you
        </p>

        {error && <div className="msg-error">❌ {error}</div>}
        {success && (
          <div className="pref-success">
            ✅ Preferences saved successfully
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="pref-grid">
            <div className="pref-field">
              <label>Age</label>
              <input
                className="pref-input"
                type="number"
                name="age"
                required
                onChange={handleChange}
              />
            </div>

            <div className="pref-field">
              <label>Gender</label>
              <select
                className="pref-input"
                name="gender"
                required
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="pref-field">
              <label>Employment Type</label>
              <select
                className="pref-input"
                name="employment_type"
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="student">Student</option>
                <option value="salaried">Salaried</option>
                <option value="self-employed">Self-employed</option>
              </select>
            </div>

            <div className="pref-field">
              <label>Marital Status</label>
              <select
                className="pref-input"
                name="marital_status"
                required
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
              </select>
            </div>

            <div className="pref-field">
              <label>Policy Type</label>
              <select
                className="pref-input"
                name="policy_type"
                required
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="health">Health</option>
                <option value="life">Life</option>
              </select>
            </div>

            <div className="pref-field">
              <label>Annual Income</label>
              <select
                className="pref-input"
                name="annual_income"
                required
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="1-3L">1–3 Lakhs</option>
                <option value="3-5L">3–5 Lakhs</option>
                <option value="5L+">5+ Lakhs</option>
              </select>
            </div>

            <div className="pref-field">
              <label>Coverage Amount</label>
              <select
                className="pref-input"
                name="coverage_amount"
                required
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="5L">5 Lakhs</option>
                <option value="10L">10 Lakhs</option>
                <option value="20L">20 Lakhs</option>
              </select>
            </div>

            <div className="pref-field">
              <label>Dependents</label>
              <input
                className="pref-input"
                type="number"
                name="dependents"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pref-checkbox-row">
            <label>
              <input type="checkbox" name="smoker" onChange={handleChange} /> Smoker
            </label>
            <label>
              <input
                type="checkbox"
                name="pre_existing_conditions"
                onChange={handleChange}
              />{" "}
              Pre-existing Conditions
            </label>
          </div>

          <div style={{ marginTop: "26px" }}>
            <button className="btn-purple full" type="submit">
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
