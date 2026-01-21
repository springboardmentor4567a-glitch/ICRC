import React, { useState, useMemo } from "react";
import { useAuth } from "./authContext";
import { useNavigate } from "react-router-dom";
import "./premium-calculator.css";

const insuranceTypes = [
  { id: 'life', name: 'Life Insurance', icon: '🛡️', basePremium: 5000 },
  { id: 'health', name: 'Health Insurance', icon: '🏥', basePremium: 8000 },
  { id: 'auto', name: 'Auto Insurance', icon: '🚗', basePremium: 6000 },
  { id: 'home', name: 'Home Insurance', icon: '🏠', basePremium: 4000 },
  { id: 'travel', name: 'Travel Insurance', icon: '✈️', basePremium: 2000 }
];

const coverageOptions = {
  life: [500000, 1000000, 2000000, 5000000, 10000000],
  health: [100000, 300000, 500000, 1000000, 2000000],
  auto: [100000, 300000, 500000, 1000000, 2000000],
  home: [500000, 1000000, 2000000, 5000000, 10000000],
  travel: [50000, 100000, 200000, 500000, 1000000]
};

export default function PremiumCalculator() {
  const { logout, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState('life');
  const [coverage, setCoverage] = useState(1000000);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState('male');
  const [occupationRisk, setOccupationRisk] = useState('low');
  const [smokingStatus, setSmokingStatus] = useState('non-smoker');
  const [healthCondition, setHealthCondition] = useState('good');
  const [term, setTerm] = useState(20);
  const [paymentMode, setPaymentMode] = useState('monthly');
  const [deductible, setDeductible] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCalculate = () => {
    setShowResult(true);
  };

  const calculatedPremium = useMemo(() => {
    const typeData = insuranceTypes.find(t => t.id === selectedType);
    if (!typeData) return 0;

    let premium = typeData.basePremium;

    // Coverage multiplier
    const coverageMultiplier = coverage / 1000000;
    premium *= coverageMultiplier;

    // Age multiplier
    let ageMultiplier = 1;
    if (age < 25) ageMultiplier = 0.8;
    else if (age < 35) ageMultiplier = 1.0;
    else if (age < 45) ageMultiplier = 1.3;
    else if (age < 55) ageMultiplier = 1.8;
    else if (age < 65) ageMultiplier = 2.5;
    else ageMultiplier = 3.5;
    premium *= ageMultiplier;

    // Gender multiplier
    if (gender === 'female') premium *= 0.95;

    // Health condition multiplier
    let healthMultiplier = 1;
    if (healthCondition === 'excellent') healthMultiplier = 0.9;
    else if (healthCondition === 'good') healthMultiplier = 1.0;
    else if (healthCondition === 'fair') healthMultiplier = 1.2;
    else if (healthCondition === 'poor') healthMultiplier = 1.5;
    premium *= healthMultiplier;

    // Occupation risk multiplier
    let occupationMultiplier = 1;
    if (occupationRisk === 'low') occupationMultiplier = 0.95;
    else if (occupationRisk === 'medium') occupationMultiplier = 1.0;
    else if (occupationRisk === 'high') occupationMultiplier = 1.2;
    premium *= occupationMultiplier;

    // Smoking status multiplier
    if (smokingStatus === 'smoker') premium *= 1.3;

    // Term adjustment (for life insurance)
    if (selectedType === 'life') {
      const termMultiplier = term / 20;
      premium *= termMultiplier;
    }

    // Deductible adjustment
    if (deductible > 0) {
      premium *= (1 - deductible / coverage * 0.5);
    }

    return Math.round(premium);
  }, [selectedType, coverage, age, gender, occupationRisk, smokingStatus, healthCondition, term, deductible]);

  const breakdown = useMemo(() => {
    const typeData = insuranceTypes.find(t => t.id === selectedType);
    if (!typeData) return {};

    let base = typeData.basePremium;
    let coverageAdj = base * (coverage / 1000000);
    let ageAdj = coverageAdj;

    // Age multiplier
    let ageMultiplier = 1;
    if (age < 25) ageMultiplier = 0.8;
    else if (age < 35) ageMultiplier = 1.0;
    else if (age < 45) ageMultiplier = 1.3;
    else if (age < 55) ageMultiplier = 1.8;
    else if (age < 65) ageMultiplier = 2.5;
    else ageMultiplier = 3.5;
    ageAdj *= ageMultiplier;

    let genderAdj = ageAdj;
    if (gender === 'female') genderAdj *= 0.95;

    let healthAdj = genderAdj;
    let healthMultiplier = 1;
    if (healthCondition === 'excellent') healthMultiplier = 0.9;
    else if (healthCondition === 'good') healthMultiplier = 1.0;
    else if (healthCondition === 'fair') healthMultiplier = 1.2;
    else if (healthCondition === 'poor') healthMultiplier = 1.5;
    healthAdj *= healthMultiplier;

    let occupationAdj = healthAdj;
    let occupationMultiplier = 1;
    if (occupationRisk === 'low') occupationMultiplier = 0.95;
    else if (occupationRisk === 'medium') occupationMultiplier = 1.0;
    else if (occupationRisk === 'high') occupationMultiplier = 1.2;
    occupationAdj *= occupationMultiplier;

    let smokingAdj = occupationAdj;
    if (smokingStatus === 'smoker') smokingAdj *= 1.3;

    let termAdj = smokingAdj;
    if (selectedType === 'life') {
      const termMultiplier = term / 20;
      termAdj *= termMultiplier;
    }

    let final = termAdj;
    if (deductible > 0) {
      final *= (1 - deductible / coverage * 0.5);
    }

    return {
      base: Math.round(base),
      coverage: Math.round(coverageAdj),
      age: Math.round(ageAdj),
      gender: Math.round(genderAdj),
      occupation: Math.round(occupationAdj),
      smoking: Math.round(smokingAdj),
      health: Math.round(healthAdj),
      term: selectedType === 'life' ? Math.round(termAdj) : 0,
      final: Math.round(final)
    };
  }, [selectedType, coverage, age, gender, occupationRisk, smokingStatus, healthCondition, term, deductible]);

  const getPaymentMultiplier = () => {
    switch (paymentMode) {
      case 'quarterly': return 3;
      case 'semi-annual': return 6;
      case 'annual': return 12;
      default: return 1; // monthly
    }
  };

  const paymentAmount = calculatedPremium * getPaymentMultiplier();



  return (
    <div className="premium-calculator-page">
      <header className="page-header">
        <h2>Estimate your insurance premium based on your profile and coverage needs</h2>
        <div>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/policies")}>Policies</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="calculator-container-centered">
        <div className="calculator-main">
          <div className="calculator-form">
            <h3>Calculate Your Premium</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Policy Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {insuranceTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Coverage Amount</label>
                <select
                  value={coverage}
                  onChange={(e) => setCoverage(Number(e.target.value))}
                >
                  {coverageOptions[selectedType].map(amount => (
                    <option key={amount} value={amount}>
                      ₹{amount.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Age (years)</label>
                <input
                  type="number"
                  min="18"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  placeholder="Enter your age"
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Occupation Risk</label>
                <select
                  value={occupationRisk}
                  onChange={(e) => setOccupationRisk(e.target.value)}
                >
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>

              <div className="form-group">
                <label>Smoking Status</label>
                <select
                  value={smokingStatus}
                  onChange={(e) => setSmokingStatus(e.target.value)}
                >
                  <option value="non-smoker">Non-Smoker</option>
                  <option value="smoker">Smoker</option>
                </select>
              </div>

              {selectedType === 'life' && (
                <div className="form-group">
                  <label>Policy Term (years)</label>
                  <input
                    type="number"
                    min="5"
                    max="40"
                    value={term}
                    onChange={(e) => setTerm(Number(e.target.value))}
                    placeholder="Enter policy term"
                  />
                </div>
              )}
            </div>

            <div className="calculator-actions">
              <button className="calculate-button" onClick={handleCalculate}>
                Calculate Premium
              </button>
            </div>
          </div>

          {showResult && (
            <div className="calculator-results">
              <div className="premium-display">
                <h3>Estimated Premium Amount</h3>
                <div className="premium-amounts">
                  <div className="premium-amount">
                    <span className="amount">₹{calculatedPremium.toLocaleString()}</span>
                    <span className="period">per month</span>
                  </div>
                  <div className="premium-amount">
                    <span className="amount">₹{(calculatedPremium * 12).toLocaleString()}</span>
                    <span className="period">per year</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
