import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import BackToDashboardButton from '../components/BackToDashboardButton';

export default function ComparePolicies() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [selectedPolicyA, setSelectedPolicyA] = useState(null);
  const [selectedPolicyB, setSelectedPolicyB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://127.0.0.1:8000/policies', {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      setPolicies(response.data);
    } catch (err) {
      setError('Failed to load policies. Please try again.');
      console.error('Error fetching policies:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDuration = (months) => {
    if (!months) return 'Not specified';
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${months} month${months > 1 ? 's' : ''}`;
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  };

  const getComparisonValue = (policy, field) => {
    if (!policy) return null;
    
    switch (field) {
      case 'name': return policy.name;
      case 'type': return policy.type;
      case 'provider': return policy.provider;
      case 'coverage': return formatCurrency(policy.coverage_amount);
      case 'premium': return formatCurrency(policy.premium);
      case 'duration': return formatDuration(policy.duration_months);
      case 'eligibility': return '18-65 years'; // Default range
      case 'benefits': return 'Comprehensive coverage with cashless claims';
      case 'exclusions': return 'Refer to policy document';
      default: return 'Not specified';
    }
  };

  const isHigherCoverage = (policyA, policyB) => {
    if (!policyA || !policyB) return null;
    return policyA.coverage_amount > policyB.coverage_amount;
  };

  const isLowerCost = (policyA, policyB) => {
    if (!policyA || !policyB) return null;
    return policyA.premium < policyB.premium;
  };

  const comparisonRows = [
    { label: 'Policy Name', field: 'name' },
    { label: 'Type', field: 'type' },
    { label: 'Provider', field: 'provider' },
    { label: 'Coverage Amount', field: 'coverage', highlight: 'coverage' },
    { label: 'Yearly Amount', field: 'premium', highlight: 'cost' },
    { label: 'Policy Term', field: 'duration' },
    { label: 'Eligibility Age', field: 'eligibility' },
    { label: 'Key Benefits', field: 'benefits' },
    { label: 'Exclusions', field: 'exclusions' }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl border border-primary/10 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mr-3"></div>
              <span className="text-primary text-lg">Loading policies...</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="w-full flex items-center justify-start mb-4">
            <BackToDashboardButton />
          </div>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Compare Policies</h1>
            <p className="text-lg text-primary/70">
              Select two policies to compare their coverage, cost, and key features side by side
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          {/* Main Comparison Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Policy Selection Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Policy A
                </label>
                <select
                  value={selectedPolicyA?.id || ''}
                  onChange={(e) => {
                    const policy = policies.find(p => p.id === parseInt(e.target.value));
                    setSelectedPolicyA(policy || null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent appearance-none bg-white"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="">Choose a policy...</option>
                  {policies.map(policy => (
                    <option key={policy.id} value={policy.id}>
                      {policy.name} – {policy.type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Policy B
                </label>
                <select
                  value={selectedPolicyB?.id || ''}
                  onChange={(e) => {
                    const policy = policies.find(p => p.id === parseInt(e.target.value));
                    setSelectedPolicyB(policy || null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent appearance-none bg-white"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="">Choose a policy...</option>
                  {policies.map(policy => (
                    <option key={policy.id} value={policy.id}>
                      {policy.name} – {policy.type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Same Policy Warning */}
            {selectedPolicyA && selectedPolicyB && selectedPolicyA.id === selectedPolicyB.id && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6 text-center">
                You are comparing the same policy on both sides.
              </div>
            )}

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-4 font-semibold text-gray-700 border-b">Feature</th>
                    <th className="text-center p-4 font-semibold text-gray-700 border-b">
                      Policy A
                      {selectedPolicyA && (
                        <div className="text-sm font-normal text-gray-500 mt-1">
                          {selectedPolicyA.name}
                        </div>
                      )}
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-700 border-b">
                      Policy B
                      {selectedPolicyB && (
                        <div className="text-sm font-normal text-gray-500 mt-1">
                          {selectedPolicyB.name}
                        </div>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, index) => {
                    const valueA = getComparisonValue(selectedPolicyA, row.field);
                    const valueB = getComparisonValue(selectedPolicyB, row.field);
                    
                    let highlightA = false;
                    let highlightB = false;
                    
                    if (row.highlight === 'coverage' && selectedPolicyA && selectedPolicyB) {
                      highlightA = isHigherCoverage(selectedPolicyA, selectedPolicyB);
                      highlightB = isHigherCoverage(selectedPolicyB, selectedPolicyA);
                    } else if (row.highlight === 'cost' && selectedPolicyA && selectedPolicyB) {
                      highlightA = isLowerCost(selectedPolicyA, selectedPolicyB);
                      highlightB = isLowerCost(selectedPolicyB, selectedPolicyA);
                    }

                    return (
                      <tr key={row.field} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-4 font-medium text-gray-700 border-b">
                          {row.label}
                        </td>
                        <td className="p-4 text-center border-b">
                          {selectedPolicyA ? (
                            <div className="relative">
                              <span className={highlightA ? 'font-semibold text-green-600' : 'text-gray-600'}>
                                {valueA}
                              </span>
                              {highlightA && row.highlight === 'coverage' && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                                  Higher coverage
                                </span>
                              )}
                              {highlightA && row.highlight === 'cost' && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                                  Lower cost
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">
                              Select a policy from the dropdown above to view details
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center border-b">
                          {selectedPolicyB ? (
                            <div className="relative">
                              <span className={highlightB ? 'font-semibold text-green-600' : 'text-gray-600'}>
                                {valueB}
                              </span>
                              {highlightB && row.highlight === 'coverage' && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                                  Higher coverage
                                </span>
                              )}
                              {highlightB && row.highlight === 'cost' && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                                  Lower cost
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">
                              Select a policy from the dropdown above to view details
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> This comparison is for illustration only. 
                Refer to the policy documents for full terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}