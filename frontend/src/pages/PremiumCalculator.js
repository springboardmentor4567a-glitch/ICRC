import React, { useState } from "react";

export default function Calculator() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [coverage, setCoverage] = useState("");
  const [health, setHealth] = useState("good");
  const [smoker, setSmoker] = useState("no");
  const [city, setCity] = useState("metro");
  const [years, setYears] = useState("");
  const [paymentMode, setPaymentMode] = useState("yearly");
  const [result, setResult] = useState(null);

  const calculatePremium = () => {
    if (!age || !coverage || !years) {
      setResult({ error: "⚠ Please fill all required fields" });
      return;
    }

    /* ===== PREMIUM CALCULATION ===== */

    const base = coverage / 1000;

    // Age factor
    let ageFactor = 1;
    if (age <= 30) ageFactor = 1;
    else if (age <= 45) ageFactor = 1.3;
    else if (age <= 60) ageFactor = 1.8;
    else ageFactor = 2.5;

    // Health factor
    let healthFactor = 1;
    if (health === "average") healthFactor = 1.3;
    if (health === "poor") healthFactor = 1.7;

    // Smoker factor
    const smokerFactor = smoker === "yes" ? 1.6 : 1;

    // City factor
    let cityFactor = 1;
    if (city === "metro") cityFactor = 1.2;
    else if (city === "tier2") cityFactor = 1.1;

    const yearly = Math.round(
      base * ageFactor * healthFactor * smokerFactor * cityFactor
    );

    const monthly = Math.round(yearly / 12);
    const total = yearly * years;

    /* ===== RISK LEVEL (IMPORTANT FIX) ===== */
    const combinedRisk =
      ageFactor * healthFactor * smokerFactor * cityFactor;

    let riskLevel = "low";
    if (combinedRisk > 3) riskLevel = "high";
    else if (combinedRisk > 1.8) riskLevel = "medium";

    setResult({
      yearly,
      monthly,
      total,
      ageFactor,
      healthFactor,
      smokerFactor,
      cityFactor,
      riskLevel, // ✅ FIXED
    });
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2 className="page-title">Premium Calculator</h2>
      <p className="page-desc">
        Estimate your insurance premium using real-life risk factors
      </p>

      <div className="calculator-layout">
        {/* LEFT – FORM */}
        <div className="calc-card">
          <label>Age</label>
          <input className="calc-input" type="number" value={age}
            onChange={(e) => setAge(e.target.value)} />

          <label>Gender</label>
          <select className="calc-input" value={gender}
            onChange={(e) => setGender(e.target.value)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <label>Coverage Amount (₹)</label>
          <input className="calc-input" type="number" value={coverage}
            onChange={(e) => setCoverage(e.target.value)} />

          <label>Health Condition</label>
          <select className="calc-input" value={health}
            onChange={(e) => setHealth(e.target.value)}>
            <option value="good">Good</option>
            <option value="average">Average</option>
            <option value="poor">Poor</option>
          </select>

          <label>Smoker</label>
          <select className="calc-input" value={smoker}
            onChange={(e) => setSmoker(e.target.value)}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>

          <label>City Type</label>
          <select className="calc-input" value={city}
            onChange={(e) => setCity(e.target.value)}>
            <option value="metro">Metro</option>
            <option value="tier2">Tier-2</option>
            <option value="rural">Rural</option>
          </select>

          <label>Policy Duration (Years)</label>
          <input className="calc-input" type="number" value={years}
            onChange={(e) => setYears(e.target.value)} />

          <label>Payment Mode</label>
          <select className="calc-input" value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}>
            <option value="yearly">Yearly</option>
            <option value="monthly">Monthly</option>
          </select>

          <button className="btn-purple full" onClick={calculatePremium}>
            Calculate Premium
          </button>
        </div>

        {/* RIGHT – RESULT */}
        {result && !result.error && (
          <div className="premium-quote-card">

            <div className="quote-header">
              <h3>Your Premium Quote</h3>
              <span className={`risk-pill ${result.riskLevel}`}>
                {result.riskLevel.toUpperCase()} RISK
              </span>
            </div>

            <div className="quote-main">
              ₹{paymentMode === "monthly" ? result.monthly : result.yearly}
              <span> / {paymentMode}</span>
            </div>

            <div className="quote-sub">
              Yearly Premium: <b>₹{result.yearly}</b>
            </div>

            <div className="quote-divider"></div>

            <div className="quote-breakdown">
              <p><span>Age Factor</span><b>{result.ageFactor}x</b></p>
              <p><span>Health Factor</span><b>{result.healthFactor}x</b></p>
              <p><span>Smoker Factor</span><b>{result.smokerFactor}x</b></p>
              <p><span>City Factor</span><b>{result.cityFactor}x</b></p>
            </div>

            <div className="quote-total">
              Total Payable ({years} yrs)
              <div>₹{result.total}</div>
            </div>

          </div>
        )}

        {result?.error && (
          <div className="calc-placeholder">{result.error}</div>
        )}
      </div>
    </div>
  );
}
