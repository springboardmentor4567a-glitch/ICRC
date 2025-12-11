import React, { useState } from "react";

export default function Calculator() {
  const [age, setAge] = useState("");
  const [coverage, setCoverage] = useState("");
  const [health, setHealth] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState("");

  const calculatePremium = () => {
    if (!age || !coverage || !health || !years) {
      setResult("⚠ Please fill all fields");
      return;
    }

    let premium = coverage / 100;

    if (age > 40) premium += 500;
    if (health === "average") premium += 300;
    if (health === "poor") premium += 700;

    premium = premium * years;

    setResult(`Estimated Premium: ₹${premium.toFixed(2)}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 className="page-title">Premium Calculator</h2>

      <div className="calc-card">

        <label>Age</label>
        <input
          type="number"
          value={age}
          placeholder="Enter your age"
          onChange={(e) => setAge(e.target.value)}
          className="calc-input"
        />

        <label>Coverage Amount (₹)</label>
        <input
          type="number"
          value={coverage}
          placeholder="Enter coverage amount"
          onChange={(e) => setCoverage(e.target.value)}
          className="calc-input"
        />

        <label>Health Condition</label>
        <select
          value={health}
          onChange={(e) => setHealth(e.target.value)}
          className="calc-input"
        >
          <option value="">Select your health condition</option>
          <option value="good">Good</option>
          <option value="average">Average</option>
          <option value="poor">Poor</option>
        </select>

        <label>Duration (Years)</label>
        <input
          type="number"
          value={years}
          placeholder="Enter number of years"
          onChange={(e) => setYears(e.target.value)}
          className="calc-input"
        />

        <button className="btn-purple" onClick={calculatePremium}>
          Calculate Premium
        </button>

        {result && <h3 className="result-text">{result}</h3>}
      </div>
    </div>
  );
}
