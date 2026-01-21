import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './authContext';

const CalculatorPage = () => {
  const { policyId } = useParams();
  const navigate = useNavigate();
  const { getPolicies } = useAuth();

  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculatorState, setCalculatorState] = useState({
    age: 30,
    riskProfile: "medium",
    tenure: 1
  });

  // Helper function to extract coverage amount from coverage object
  const getCoverageAmount = (coverage) => {
    if (typeof coverage === 'number') {
      return coverage;
    }
    if (typeof coverage === 'object' && coverage !== null) {
      // Try common coverage keys
      return coverage.hospitalization || coverage.death_benefit || coverage.total || Object.values(coverage)[0] || 0;
    }
    return 0;
  };

  // Premium calculation function
  const calculatePremium = useCallback((policy, params) => {
    if (!policy?.priceBase) return 0;

    const baseRate = policy.priceBase;
    const coverageAmount = getCoverageAmount(policy.coverage);
    const coverageFactor = coverageAmount / 100000;

    // Age factor (2% increase per year after 30)
    const ageFactor = 1 + Math.max(0, (params.age - 30) * 0.02);

    // Risk factors
    const riskFactors = { low: 0.85, medium: 1.0, high: 1.25 };
    const riskFactor = riskFactors[params.riskProfile] || 1.0;

    // Tenure discount (5% per year after first year)
    const tenureFactor = 1 - Math.max(0, (params.tenure - 1) * 0.05);

    const monthlyPremium = Math.max(500, Math.round(
      baseRate * coverageFactor * ageFactor * riskFactor * tenureFactor
    ));

    return Math.round(monthlyPremium * 12); // Return yearly premium
  }, []);

  // Handle calculator input changes
  const handleCalculatorChange = useCallback((field, value) => {
    setCalculatorState(prev => ({
      ...prev,
      [field]: field === 'age' || field === 'tenure' ? parseInt(value) || 0 : value
    }));
  }, []);

  useEffect(() => {
    const policies = getPolicies();
    const foundPolicy = policies.find(p => p.id === parseInt(policyId));
    if (foundPolicy) {
      setPolicy(foundPolicy);
    }
    setLoading(false);
  }, [policyId, getPolicies]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading calculator...</p>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Policy Not Found</h2>
          <p className="text-slate-600 mb-6">The policy you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/policies')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Policies
          </button>
        </div>
      </div>
    );
  }

  const yearlyPremium = calculatePremium(policy, calculatorState);
  const monthlyPremium = Math.round(yearlyPremium / 12);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-slate-800">Premium Calculator</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Policy Info */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl bg-slate-50 w-12 h-12 flex items-center justify-center rounded-lg border border-slate-100">
              {policy.category === 'Health' ? '🏥' :
               policy.category === 'Life' ? '💼' :
               policy.category === 'Auto' ? '🚗' :
               policy.category === 'Home' ? '🏠' : '📋'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800">{policy.name}</h2>
              <p className="text-slate-600">{policy.provider} • {policy.category} Insurance</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  Coverage: ₹{getCoverageAmount(policy.coverage).toLocaleString()}
                </span>
                <span className="text-sm bg-green-50 text-green-700 px-2 py-1 rounded">
                  Rating: {policy.rating}/5
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calculator Controls */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Customize Your Premium</h3>

            <div className="space-y-6">
              {/* Age */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  👤 Age: {calculatorState.age} years
                </label>
                <input
                  type="range"
                  min="18"
                  max="70"
                  step="1"
                  value={calculatorState.age}
                  onChange={(e) => handleCalculatorChange('age', e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>18</span>
                  <span>70</span>
                </div>
              </div>

              {/* Risk Profile */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  ⚡ Risk Profile
                </label>
                <select
                  value={calculatorState.riskProfile}
                  onChange={(e) => handleCalculatorChange('riskProfile', e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="low">Low Risk (-15%)</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk (+25%)</option>
                </select>
              </div>

              {/* Tenure */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  📅 Policy Tenure: {calculatorState.tenure} year{calculatorState.tenure > 1 ? 's' : ''}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={calculatorState.tenure}
                  onChange={(e) => handleCalculatorChange('tenure', e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1 year</span>
                  <span>10 years</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Display */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Calculated Premium</h3>

            <div className="space-y-4">
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  ₹{monthlyPremium.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">per month</div>
              </div>

              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-xl font-semibold text-slate-800">
                  ₹{yearlyPremium.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">per year</div>
              </div>

              <div className="text-xs text-slate-500 text-center">
                * Premium calculation is based on the parameters above and may vary based on actual underwriting
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate(`/policies/${policy.id}`)}
                className="w-full bg-slate-600 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
              >
                View Policy Details
              </button>
              <button
                onClick={() => navigate('/policies')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Browse More Policies
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
