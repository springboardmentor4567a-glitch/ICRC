import React, { useState } from "react";
import "./PremiumCalculator.css";

// ── Currency formatter
function currency(value) {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

// ── Validation helper
function validate(form) {
  const errors = {};
  
  const age = Number(form.age);
  if (!form.age) errors.age = "Age is required.";
  else if (isNaN(age) || age < 18 || age > 99) errors.age = "Enter a valid age (18-99).";

  const cov = Number(form.coverage);
  if (!form.coverage) errors.coverage = "Coverage amount is required.";
  else if (isNaN(cov) || cov <= 0) errors.coverage = "Enter a valid positive amount.";

  const yrs = Number(form.years);
  if (!form.years) errors.years = "Policy duration is required.";
  else if (isNaN(yrs) || !Number.isInteger(yrs) || yrs < 1 || yrs > 50) errors.years = "Enter a valid duration (1-50 years).";

  return errors;
}

  // ── Helper for form fields moved OUTSIDE to prevent re-rendering focus loss
const Field = ({ id, label, hint, error, children }) => (
  <div className="calc-field">
    <label className="calc-label" htmlFor={id}>
      {label}
    </label>
    {children}
    {hint && !error && <p className="calc-hint">{hint}</p>}
    {error && <p className="calc-error">{error}</p>}
  </div>
);

export default function PremiumCalculator() {
  const defaultForm = {
    age: "",
    gender: "male",
    coverage: "",
    health: "good",
    smoker: "no",
    city: "metro",
    years: "",
    paymentMode: "yearly",
  };

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const handleReset = () => {
    setForm(defaultForm);
    setErrors({});
    setResult(null);
  };

  const calculatePremium = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsCalculating(true);

    // Simulate slight API delay for professional feel
    setTimeout(() => {
      const base = Number(form.coverage) / 1000;
      const age = Number(form.age);

      let ageFactor = 1;
      if (age <= 30) ageFactor = 1;
      else if (age <= 45) ageFactor = 1.3;
      else if (age <= 60) ageFactor = 1.8;
      else ageFactor = 2.5;

      let healthFactor = 1;
      if (form.health === "average") healthFactor = 1.3;
      if (form.health === "poor") healthFactor = 1.7;

      const smokerFactor = form.smoker === "yes" ? 1.6 : 1;

      let cityFactor = 1;
      if (form.city === "metro") cityFactor = 1.2;
      else if (form.city === "tier2") cityFactor = 1.1;

      const yearly = Math.round(base * ageFactor * healthFactor * smokerFactor * cityFactor);
      let paymentAmount = yearly;
      let paymentLabel = "Estimated Annual Payment";

      if (form.paymentMode === "monthly") {
        paymentAmount = Math.round(yearly / 12);
        paymentLabel = "Estimated Monthly Payment";
      } else if (form.paymentMode === "quarterly") {
        paymentAmount = Math.round(yearly / 4);
        paymentLabel = "Estimated Quarterly Payment";
      }

      const total = yearly * Number(form.years);
      const combinedRisk = ageFactor * healthFactor * smokerFactor * cityFactor;

      let riskLevel = "Low";
      if (combinedRisk > 3) riskLevel = "High";
      else if (combinedRisk > 1.8) riskLevel = "Moderate";

      setResult({
        base,
        yearly,
        paymentAmount,
        paymentLabel,
        total,
        ageFactor,
        healthFactor,
        smokerFactor,
        cityFactor,
        riskLevel,
        duration: form.years,
      });
      setIsCalculating(false);
    }, 600);
  };

  return (
    <div className="calc-page">
      <div className="calc-header">
        <span className="calc-kicker">Tools</span>
        <h2 className="calc-title">Insurance Premium Calculator</h2>
        <p className="calc-desc">
          Estimate your insurance premium based on coverage, age and risk factors.
        </p>
      </div>

      <div className="calc-container">
        
        {/* LEFT COLUMN: Applicant & Policy Details */}
        <section className="calc-form-panel">
          <h3 className="calc-panel-title">Applicant &amp; Policy Details</h3>
          
          <div className="calc-grid">
            <Field id="age" label="Age" error={errors.age}>
              <input id="age" name="age" type="number" 
                className={`calc-input ${errors.age ? "input-err" : ""}`}
                value={form.age} onChange={handleChange} placeholder="e.g. 35" min="18" max="99" />
            </Field>
            
            <Field id="gender" label="Gender">
              <select id="gender" name="gender" className="calc-input" value={form.gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </Field>

            <Field id="coverage" label="Coverage Amount (&#8377;)" error={errors.coverage}>
              <input id="coverage" name="coverage" type="number" 
                className={`calc-input ${errors.coverage ? "input-err" : ""}`}
                value={form.coverage} onChange={handleChange} placeholder="e.g. 500000" min="10000" />
            </Field>

            <Field id="years" label="Policy Duration (Years)" error={errors.years}>
              <input id="years" name="years" type="number" 
                className={`calc-input ${errors.years ? "input-err" : ""}`}
                value={form.years} onChange={handleChange} placeholder="e.g. 10" min="1" max="50" />
            </Field>

            <Field id="health" label="Health Condition">
              <select id="health" name="health" className="calc-input" value={form.health} onChange={handleChange}>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="poor">Poor</option>
              </select>
            </Field>

            <Field id="smoker" label="Smoker">
              <select id="smoker" name="smoker" className="calc-input" value={form.smoker} onChange={handleChange}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </Field>

            <Field id="city" label="City Type">
              <select id="city" name="city" className="calc-input" value={form.city} onChange={handleChange}>
                <option value="metro">Metro</option>
                <option value="tier2">Tier-2</option>
                <option value="rural">Rural</option>
              </select>
            </Field>

            <Field id="paymentMode" label="Payment Mode">
              <select id="paymentMode" name="paymentMode" className="calc-input" value={form.paymentMode} onChange={handleChange}>
                <option value="yearly">Yearly</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
              </select>
            </Field>
          </div>

          <div className="calc-btn-row">
            <button className="calc-btn-secondary" onClick={handleReset} disabled={isCalculating}>
              Reset
            </button>
            <button className="calc-btn-primary" onClick={calculatePremium} disabled={isCalculating}>
              {isCalculating ? (
                <span className="calc-spinner-row"><span className="calc-spinner"/> Calculating...</span>
              ) : (
                "Calculate Premium"
              )}
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: Premium Estimate */}
        <aside className="calc-result-panel">
          <h3 className="calc-panel-title">Premium Estimate</h3>
          
          {!result && !isCalculating && (
            <div className="calc-empty-state">
              <span className="calc-empty-icon" aria-hidden="true">&#128181;</span>
              <p>Enter applicant and coverage details to view your estimated premium.</p>
            </div>
          )}

          {isCalculating && (
            <div className="calc-empty-state">
              <span className="calc-spinner large" />
              <p>Generating personalized estimate...</p>
            </div>
          )}

          {result && !isCalculating && (
            <div className="calc-result-card fade-in">
              <div className="calc-result-header">
                <span className={`calc-risk-badge ${result.riskLevel.toLowerCase()}`}>
                  {result.riskLevel} Risk
                </span>
              </div>
              
              <div className="calc-main-amount">
                <span className="calc-amount-label">Estimated Premium</span>
                <strong className="calc-amount-value">{currency(result.yearly)} <span>/ year</span></strong>
              </div>

              <div className="calc-payment-highlight">
                <span>{result.paymentLabel}</span>
                <strong>{currency(result.paymentAmount)}</strong>
              </div>

              <div className="calc-breakdown">
                <h4>Premium Breakdown</h4>
                <div className="calc-breakdown-row">
                  <span>Base Premium</span>
                  <strong>{currency(result.base)}</strong>
                </div>
                <div className="calc-breakdown-row sub">
                  <span>Age Adjustment</span>
                  <strong>{result.ageFactor}x</strong>
                </div>
                <div className="calc-breakdown-row sub">
                  <span>Health Adjustment</span>
                  <strong>{result.healthFactor}x</strong>
                </div>
                <div className="calc-breakdown-row sub">
                  <span>Smoker Adjustment</span>
                  <strong>{result.smokerFactor}x</strong>
                </div>
                <div className="calc-breakdown-row sub">
                  <span>City/Risk Adjustment</span>
                  <strong>{result.cityFactor}x</strong>
                </div>
                <div className="calc-breakdown-row sub">
                  <span>Duration</span>
                  <strong>{result.duration} Years</strong>
                </div>
                <div className="calc-breakdown-row total">
                  <span>Total Payable Over Term</span>
                  <strong>{currency(result.total)}</strong>
                </div>
              </div>

              <p className="calc-disclaimer">
                Premium shown is an estimate based on the information provided and may vary depending on insurer underwriting and policy terms.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
