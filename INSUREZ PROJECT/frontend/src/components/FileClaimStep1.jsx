import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function FileClaimStep1({ onNext, formData, setFormData }) {
  const [policies, setPolicies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get('http://127.0.0.1:8000/policies', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      
      setPolicies(response.data);
    } catch (err) {
      let errorMessage = 'Failed to load policies. Please try again.';
      if (err.response?.status === 401) {
        errorMessage = 'Authentication required';
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
        return;
      } else if (err.response?.data?.detail) {
        errorMessage = `Failed to fetch policies: ${err.response.data.detail}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const searchLower = searchTerm.toLowerCase();
    return (
      policy.name.toLowerCase().includes(searchLower) ||
      policy.type.toLowerCase().includes(searchLower) ||
      policy.provider.toLowerCase().includes(searchLower)
    );
  });

  const selectedPolicy = policies.find(p => p.id === parseInt(formData.policy_id));

  const handlePolicySelect = (policyId) => {
    setFormData(prev => ({ ...prev, policy_id: policyId }));
  };

  const handleContinue = () => {
    if (formData.policy_id) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="bg-background/95 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-all group"
            >
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Dashboard</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-primary/60">Step 1 of 3</p>
                <p className="font-semibold text-primary">Select Policy</p>
              </div>
              <div className="w-32 h-2 bg-primary/10 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-gradient-to-r from-accent to-accent/80 rounded-full transition-all duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-background rounded-3xl shadow-2xl border border-primary/5 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/90 px-8 py-12 text-center">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-4xl font-bold text-background mb-4">
                File Your Insurance Claim
              </h1>
              <p className="text-background/80 text-lg leading-relaxed">
                Select the insurance policy related to your claim from your existing policies.
              </p>
              <div className="mt-6 inline-flex items-center space-x-2 bg-background/10 backdrop-blur-sm rounded-full px-4 py-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-background/90 text-sm font-medium">Using Your Real Policies</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Select Your Policy</h2>
              <p className="text-primary/60 mb-6">
                Choose from your existing insurance policies (same as Browse Policies).
              </p>

              {policies.length > 3 && (
                <div className="relative mb-6">
                  <input
                    type="text"
                    placeholder="Search your policies by name, type, or provider..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-primary/20 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              )}

              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                  <p className="text-primary/60">Loading your policies...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {!loading && !error && (
                <>
                  <div className="relative mb-6">
                    <select
                      value={formData.policy_id || ''}
                      onChange={(e) => handlePolicySelect(e.target.value)}
                      className={`w-full px-4 py-4 rounded-xl border-2 bg-background focus:ring-2 focus:ring-accent transition-all text-lg ${
                        formData.policy_id ? 'border-green-500' : 'border-primary/20'
                      }`}
                    >
                      <option value="">Select your insurance policy</option>
                      {filteredPolicies.map((policy) => (
                        <option key={policy.id} value={policy.id}>
                          {policy.name} - {policy.provider} ({policy.type})
                        </option>
                      ))}
                    </select>
                    
                    {formData.policy_id && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {selectedPolicy && (
                    <div className="bg-accent/5 border border-accent/20 rounded-xl p-6">
                      <h3 className="font-semibold text-primary mb-4">Selected Policy Details</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-primary/60">Policy Name:</span>
                          <p className="font-medium text-primary">{selectedPolicy.name}</p>
                        </div>
                        <div>
                          <span className="text-primary/60">Provider:</span>
                          <p className="font-medium text-primary">{selectedPolicy.provider}</p>
                        </div>
                        <div>
                          <span className="text-primary/60">Type:</span>
                          <p className="font-medium text-primary">{selectedPolicy.type}</p>
                        </div>
                        <div>
                          <span className="text-primary/60">Premium:</span>
                          <p className="font-medium text-accent">₹{selectedPolicy.premium?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {filteredPolicies.length === 0 && policies.length > 0 && (
                    <div className="text-center py-8">
                      <p className="text-primary/60">No policies match your search. Try different keywords.</p>
                    </div>
                  )}

                  {policies.length === 0 && (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-primary/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-primary mb-2">No Policies Found</h3>
                      <p className="text-primary/60">Visit Browse Policies to explore available options.</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-primary/10">
              <button
                onClick={() => {
                  if (formData.policy_id) {
                    const draftData = { ...formData, step: 1, timestamp: new Date().toISOString() };
                    localStorage.setItem('claimDraft', JSON.stringify(draftData));
                    
                    const toast = document.createElement('div');
                    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                    toast.textContent = 'Draft saved successfully!';
                    document.body.appendChild(toast);
                    setTimeout(() => {
                      if (document.body.contains(toast)) {
                        document.body.removeChild(toast);
                      }
                    }, 3000);
                  }
                }}
                disabled={!formData.policy_id}
                className="flex items-center space-x-2 px-6 py-3 border-2 border-primary/20 text-primary rounded-xl hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Save Draft</span>
              </button>

              <button
                onClick={handleContinue}
                disabled={!formData.policy_id}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-accent to-accent/90 text-primary font-bold rounded-xl hover:shadow-lg hover:shadow-accent/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
              >
                <span>Continue to Step 2</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}