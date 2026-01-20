import React, { useState } from "react";
import "../styles/calculator.css";
import { useNavigate } from "react-router-dom";


const Calculator = () => {
 const navigate = useNavigate();


  // ===== STATE VARIABLES =====
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [coverageAmount, setCoverageAmount] = useState("");
  const [healthCondition, setHealthCondition] = useState("");
  const [cityType, setCityType] = useState("");
  const [policyDuration, setPolicyDuration] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [result, setResult] = useState(null);

  // ===== PREMIUM CALCULATION LOGIC =====
  const calculatePremium = () => {
    if (
      !age ||
      !coverageAmount ||
      !healthCondition ||
      !cityType ||
      !policyDuration ||
      !paymentMode
    ) {
      alert("Please fill all required fields");
      return;
    }

    // ===== BASE RATE =====
    const baseRate = 0.5;

    // Base premium
    let basePremium = (coverageAmount / 1000) * baseRate;

    // ===== AGE FACTOR =====
    let ageFactor = 1;
    if (age >= 30 && age <= 45) ageFactor = 1.2;
    else if (age > 45) ageFactor = 1.5;

    // ===== HEALTH FACTOR =====
    let healthFactor = 1;
    if (healthCondition === "Average") healthFactor = 1.3;
    else if (healthCondition === "Poor") healthFactor = 1.6;

    // ===== CITY FACTOR =====
    let cityFactor = 1;
    if (cityType === "Semi-Urban") cityFactor = 1.1;
    else if (cityType === "Metro") cityFactor = 1.2;

    // ===== POLICY DURATION FACTOR (NEW) =====
    let durationFactor = 1;
    if (policyDuration >= 3 && policyDuration <= 5) durationFactor = 1.1;
    else if (policyDuration > 5) durationFactor = 1.25;

    // ===== FINAL MONTHLY PREMIUM =====
    let monthlyPremium =
      basePremium *
      ageFactor *
      healthFactor *
      cityFactor *
      durationFactor;

    // ===== PAYMENT MODE ADJUSTMENT =====
    let yearlyPremium = monthlyPremium * 12;

    // ===== TOTAL PAYABLE (NEW) =====
    let totalPayable =
      paymentMode === "Monthly"
        ? yearlyPremium * policyDuration
        : yearlyPremium * policyDuration * 0.95; // 5% discount for yearly payment

    // ===== RISK TAG =====
    let risk =
      healthCondition === "Good" && age < 45
        ? "LOW RISK"
        : "MODERATE RISK";

    setResult({
      monthly: Math.round(monthlyPremium),
      yearly: Math.round(yearlyPremium),
      total: Math.round(totalPayable),
      ageFactor,
      healthFactor,
      cityFactor,
      durationFactor,
      risk,
    });
  };

  return (
    
    <div className="calculator-container">
      {/* LEFT FORM */}

<button
  onClick={() => navigate("/dashboard")}
  style={{
    position: "absolute",
    top: "20px",
    left: "20px",
    padding: "6px 12px",          // ⭐ smaller padding
    fontSize: "13px",
    borderRadius: "18px",
    border: "none",
    background: "#34d399",
    color: "#fff",
    cursor: "pointer",
    width: "auto",                // ⭐ prevents stretching
    maxWidth: "fit-content",      // ⭐ key line
    display: "inline-flex",       // ⭐ not full-width
    alignItems: "center",
    gap: "6px",
    whiteSpace: "nowrap", 
     zIndex: 1000,         // ⭐ no wrapping
  }}
>
  ← Back
</button>



      
      <div className="calculator-form">
        <h1 className="calculator-title">Premium Calculator</h1>

        <label>Age</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <label>Gender</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Select</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <label>Coverage Amount (₹)</label>
        <input
          type="number"
          value={coverageAmount}
          onChange={(e) => setCoverageAmount(e.target.value)}
        />

        <label>Health Condition</label>
        <select
          value={healthCondition}
          onChange={(e) => setHealthCondition(e.target.value)}
        >
          <option value="">Select</option>
          <option>Good</option>
          <option>Average</option>
          <option>Poor</option>
        </select>

        <label>City Type</label>
        <select value={cityType} onChange={(e) => setCityType(e.target.value)}>
          <option value="">Select</option>
          <option>Rural</option>
          <option>Semi-Urban</option>
          <option>Metro</option>
        </select>

        <label>Policy Duration (Years)</label>
        <input
          type="number"
          value={policyDuration}
          onChange={(e) => setPolicyDuration(e.target.value)}
        />

        <label>Payment Mode</label>
        <select
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
        >
          <option value="">Select</option>
          <option>Monthly</option>
          <option>Yearly</option>
        </select>

        <button onClick={calculatePremium}>Calculate Premium</button>
      </div>

      {/* RIGHT RESULT CARD */}
      {result && (
        <div className="calculator-result">
          <span className="risk-badge">{result.risk}</span>

          <h2 className="result-title">Your Premium Calculation</h2>

          <h1 className="premium-amount">
            ₹{result.monthly} / month
          </h1>

          <p className="yearly-premium">
            Yearly Premium: ₹{result.yearly}
          </p>

          <hr style={{ opacity: 0.2 }} />
<h2 style={{ marginTop: "20px", fontWeight: "bold", fontSize: "24px" }}>

            Total Payable: ₹{result.total}
          </h2>
        </div>
      )}
    </div>
  );
};

export default Calculator;
