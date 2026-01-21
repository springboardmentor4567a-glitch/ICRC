import React, { useState, useMemo } from "react";
import { useAuth } from "./authContext";
import { useNavigate, useParams } from "react-router-dom";

export default function PolicyDetails() {
  const { logout, isAdmin, user, getPolicies } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [coverage, setCoverage] = useState(1000000);
  const [age, setAge] = useState(30);
  const [showTerms, setShowTerms] = useState(false);

  const policy = getPolicies().find(p => p.id == id);

  const premium = useMemo(() => {
    if (!policy) return 0;
    const ageMultiplier = age > 60 ? 2.0 : age > 50 ? 1.8 : age > 40 ? 1.4 : 1.0;
    const coverageMultiplier = coverage / 1000000;
    return Math.round(policy.priceBase * ageMultiplier * coverageMultiplier);
  }, [coverage, age, policy]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!policy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-bold text-slate-800">Policy Not Found</h1>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-gray-500/30 transition-all duration-300 hover:-translate-y-1"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => navigate("/policies")}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1"
                >
                  Browse Policies
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:-translate-y-1"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Policy Not Found</h3>
            <p className="text-slate-600">The requested policy could not be found. Please check the URL or browse available policies.</p>
          </div>
        </div>
      </div>
    );
  }

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star"}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold text-slate-800">Policy Details</h1>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.history.back()}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-gray-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                Back
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Details Card */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white text-center">
            <div className="text-6xl mb-4">
              {policy.category === 'Health' ? '🏥' :
               policy.category === 'Auto' ? '🚗' :
               policy.category === 'Life' ? '💼' :
               policy.category === 'Property' ? '🏠' :
               policy.category === 'Travel' ? '✈️' : '📋'}
            </div>
            <h1 className="text-4xl font-light mb-2">
              {policy.name}
            </h1>
            <div className="text-xl opacity-90 mb-4">
              {policy.provider} • {policy.category}
            </div>
            <div className="text-2xl flex items-center justify-center gap-2">
              <div className="flex">
                {renderStars(policy.rating)}
              </div>
              <span className="ml-2">{policy.rating}/5.0</span>
            </div>
          </div>

          {/* Policy Details Table */}
          <div className="p-8">
            <div className="bg-slate-50 rounded-xl overflow-hidden shadow-sm border border-slate-200 mb-8">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-700 border-b-2 border-slate-200">Property</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-700 border-b-2 border-slate-200">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-6 py-4 border-b border-slate-200 font-semibold">Coverage Amount</td>
                    <td className="px-6 py-4 border-b border-slate-200 text-green-600 font-bold">
                      ₹{(policy.coverage || 0).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="px-6 py-4 border-b border-slate-200 font-semibold">Base Premium</td>
                    <td className="px-6 py-4 border-b border-slate-200 text-red-600 font-bold">
                      ₹{policy.priceBase.toLocaleString()}/year
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4 border-b border-slate-200 font-semibold">Category</td>
                    <td className="px-6 py-4 border-b border-slate-200">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {policy.category}
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="px-6 py-4 border-b border-slate-200 font-semibold">Rating</td>
                    <td className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                      <div className="flex">
                        {renderStars(policy.rating)}
                      </div>
                      <span>{policy.rating}/5.0</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Features Table */}
            <div className="mb-8">
              <h3 className="text-slate-800 text-xl font-bold border-b-2 border-blue-500 pb-2 mb-5">
                Key Features
              </h3>
              <div className="bg-slate-50 rounded-xl overflow-hidden shadow-sm border border-slate-200">
                <div className="divide-y divide-slate-200">
                  {policy.features.map((feature, index) => (
                    <div key={index} className={`px-6 py-3 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-blue-500 text-lg">✓</span>
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Premium Calculator */}
            <div className="mb-8">
              <h3 className="text-slate-800 text-xl font-bold border-b-2 border-green-500 pb-2 mb-5">
                Premium Calculator
              </h3>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-wrap gap-6 items-center">
                <div className="flex-1 min-w-[200px]">
                  <label className="block mb-3 font-semibold text-slate-700">
                    Coverage: ₹{coverage.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="500000"
                    max="5000000"
                    step="100000"
                    value={coverage}
                    onChange={e => setCoverage(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block mb-3 font-semibold text-slate-700">
                    Age: {age} years
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="70"
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div className="bg-green-500 text-white p-5 rounded-xl text-center min-w-[150px]">
                  <div className="text-2xl font-bold">₹{premium.toLocaleString()}</div>
                  <div className="text-sm opacity-90">Annual Premium</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate(`/calculator/${policy.id}`)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
              >
                Calculate Premium
              </button>
              <button
                onClick={() => navigate("/compare")}
                className="bg-white text-slate-600 border-2 border-slate-600 px-8 py-3 rounded-2xl font-bold text-lg hover:bg-slate-600 hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                Compare Policies
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
