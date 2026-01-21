import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './authContext';

const Compare = () => {
  const navigate = useNavigate();
  const { getPolicies } = useAuth();
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const policies = getPolicies();

  // Filter policies based on search and category
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || policy.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const togglePolicySelection = (policy) => {
    setSelectedPolicies(prev => {
      const isSelected = prev.some(p => p.id === policy.id);
      if (isSelected) {
        return prev.filter(p => p.id !== policy.id);
      } else if (prev.length < 2) {
        return [...prev, policy];
      }
      return prev;
    });
  };

  const proceedToComparison = () => {
    if (selectedPolicies.length === 2) {
      navigate('/compare-policies', { state: { policies: selectedPolicies } });
    }
  };

  const clearSelection = () => {
    setSelectedPolicies([]);
  };

  const categories = ['all', ...new Set(policies.map(p => p.category))];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            >
              ←
            </button>
            <h1 className="text-xl font-bold text-slate-800">Compare Insurance Policies</h1>
          </div>
          {selectedPolicies.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">
                {selectedPolicies.length} of 2 selected
              </span>
              <button
                onClick={clearSelection}
                className="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Selection Summary */}
        {selectedPolicies.length > 0 && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {selectedPolicies.map((policy, index) => (
                  <div key={policy.id} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">
                      Policy {index + 1}:
                    </span>
                    <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {policy.name}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={proceedToComparison}
                disabled={selectedPolicies.length !== 2}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Compare Now
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search policies by name or provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Policy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPolicies.map((policy, index) => {
            const isSelected = selectedPolicies.some(p => p.id === policy.id);
            const canSelect = !isSelected && selectedPolicies.length < 2;

            return (
              <div
                key={policy.id}
                className={`relative bg-white rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 ring-4 ring-emerald-200'
                    : canSelect
                    ? 'border-slate-200 hover:border-blue-300 hover:scale-105'
                    : 'border-slate-200 opacity-60'
                }`}
                onClick={() => canSelect && togglePolicySelection(policy)}
              >
                {/* Selection Indicator */}
                <div className="absolute top-4 right-4 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      canSelect && togglePolicySelection(policy);
                    }}
                    className="w-6 h-6 text-emerald-600 bg-white border-2 border-slate-300 rounded-lg focus:ring-emerald-500 focus:ring-2 transition-all hover:border-emerald-400"
                  />
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 left-4 z-10">
                  {isSelected ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-lg">
                      ✓ Selected
                    </span>
                  ) : selectedPolicies.length >= 2 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-400 text-white shadow-lg">
                      Max Reached
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white shadow-lg">
                      Available
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6 pt-16">
                  {/* Icon and Category */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                      {policy.category === 'Health' ? '🏥' :
                       policy.category === 'Life' ? '💼' :
                       policy.category === 'Auto' ? '🚗' :
                       policy.category === 'Home' ? '🏠' :
                       policy.category === 'Travel' ? '✈️' :
                       policy.category === 'Business' ? '🏢' : '📋'}
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${
                      policy.category === 'Health' ? 'bg-emerald-100 text-emerald-800' :
                      policy.category === 'Life' ? 'bg-blue-100 text-blue-800' :
                      policy.category === 'Auto' ? 'bg-orange-100 text-orange-800' :
                      policy.category === 'Home' ? 'bg-purple-100 text-purple-800' :
                      policy.category === 'Travel' ? 'bg-cyan-100 text-cyan-800' :
                      policy.category === 'Business' ? 'bg-slate-100 text-slate-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {policy.category}
                    </span>
                  </div>

                  {/* Policy Name */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{policy.name}</h3>

                  {/* Provider */}
                  <p className="text-sm text-slate-600 mb-4">{policy.provider}</p>

                  {/* Coverage */}
                  <div className="mb-4">
                    <div className="text-xl font-bold text-slate-900">
                      ₹{typeof policy.coverage === 'object' && policy.coverage !== null
                        ? (policy.coverage.total || Object.values(policy.coverage)[0] || 'N/A')
                        : (policy.coverage?.toLocaleString() || 'N/A')
                      }
                    </div>
                    <div className="text-xs text-slate-500">Coverage Amount</div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
                              i < Math.floor(policy.rating)
                                ? 'text-yellow-500'
                                : 'text-slate-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{policy.rating}/5</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Accent */}
                <div className={`h-2 ${
                  policy.category === 'Health' ? 'bg-emerald-500' :
                  policy.category === 'Life' ? 'bg-blue-500' :
                  policy.category === 'Auto' ? 'bg-orange-500' :
                  policy.category === 'Home' ? 'bg-purple-500' :
                  policy.category === 'Travel' ? 'bg-cyan-500' :
                  policy.category === 'Business' ? 'bg-slate-500' :
                  'bg-slate-500'
                }`}></div>
              </div>
            );
          })}
        </div>

        {filteredPolicies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">No policies found matching your criteria.</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-bold text-blue-800 mb-2">How to Compare</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• Select up to 2 policies from the list above</li>
            <li>• Use the search bar to find specific policies</li>
            <li>• Filter by category to narrow down options</li>
            <li>• Click "Compare Now" to see detailed side-by-side comparison</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Compare;
