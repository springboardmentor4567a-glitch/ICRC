import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import BackToDashboardButton from '../components/BackToDashboardButton';

export default function SmartRecommendations() {
  const navigate = useNavigate();
  const [allPolicies, setAllPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const [profile, setProfile] = useState({
    age: '',
    employmentLevel: '',
    familyStatus: '',
    dependents: 0,
    primaryGoal: '',
    riskTolerance: '',
    smokingStatus: ''
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPolicyForDetails, setSelectedPolicyForDetails] = useState(null);

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
      setAllPolicies(response.data);
    } catch (err) {
      setError('Failed to load policies. Some features may be limited.');
      console.error('Error fetching policies:', err);
    } finally {
      setLoading(false);
    }
  };

  // Rule-based recommendation engine with smoking awareness
  const getRecommendedPolicies = (userProfile, policies) => {
    const scoredPolicies = policies.map(policy => {
      let score = 0;
      let reasons = [];
      let smokerAnalysis = '';

      // Smoking status considerations for Life and Health policies
      if (policy.type === 'Life' || policy.type === 'Health') {
        if (userProfile.smokingStatus === 'smoker') {
          if (policy.coverage_amount > 1000000) {
            score += 15;
          }
          smokerAnalysis = 'Better suited for smokers: focuses on protection with higher coverage, though expected cost is higher compared to non-smoker plans.';
        } else if (userProfile.smokingStatus === 'non-smoker') {
          if (policy.premium < 20000) {
            score += 10;
          }
          smokerAnalysis = 'Optimized for non-smokers: offers a lower expected cost for your risk profile.';
        }
      } else {
        smokerAnalysis = 'Smoking status has minimal impact on this type of policy; focus is on asset or travel protection.';
      }

      // Age-based scoring
      if (userProfile.age >= 18 && userProfile.age <= 30) {
        if (policy.type === 'Life') {
          score += 25;
          reasons.push('Ideal age to start life insurance');
        }
        if (policy.type === 'Health') {
          score += 20;
          reasons.push('Early health protection is cost-effective');
        }
      } else if (userProfile.age >= 31 && userProfile.age <= 50) {
        if (policy.type === 'Life' && userProfile.dependents > 0) {
          score += 30;
          reasons.push('Essential for family financial security');
        }
        if (policy.type === 'Health') {
          score += 25;
          reasons.push('Critical age for comprehensive health coverage');
        }
      } else if (userProfile.age > 50) {
        if (policy.type === 'Health') {
          score += 35;
          reasons.push('Priority health protection for senior years');
        }
      }

      // Goal-based scoring
      switch (userProfile.primaryGoal) {
        case 'Protect income':
          if (policy.type === 'Life') {
            score += 40;
            reasons.push('Matches your goal of protecting income');
          }
          break;
        case 'Health protection':
          if (policy.type === 'Health') {
            score += 40;
            reasons.push('Perfect match for health protection needs');
          }
          break;
        case 'Wealth creation':
          if (policy.type === 'Life') {
            score += 30;
            reasons.push('Life insurance supports wealth building');
          }
          break;
        case 'Protect assets/vehicle':
          if (policy.type === 'Motor' || policy.type === 'Home') {
            score += 40;
            reasons.push('Essential for asset protection');
          }
          break;
        case 'Travel safety':
          if (policy.type === 'Travel') {
            score += 40;
            reasons.push('Comprehensive travel protection');
          }
          break;
      }

      // Family status and dependents
      if (userProfile.dependents > 0) {
        if (policy.type === 'Life') {
          score += 25;
          reasons.push('Suitable for families with dependents');
        }
        if (policy.type === 'Health') {
          score += 20;
          reasons.push('Family health coverage is essential');
        }
      }

      if (userProfile.familyStatus === 'Married with Children') {
        if (policy.type === 'Life' || policy.type === 'Health') {
          score += 15;
          reasons.push('Important for growing families');
        }
      }

      // Risk tolerance adjustment
      if (userProfile.riskTolerance === 'Low') {
        if (policy.premium < 15000) {
          score += 10;
          reasons.push('Aligned with low risk tolerance');
        }
      } else if (userProfile.riskTolerance === 'High') {
        if (policy.coverage_amount > 1000000) {
          score += 15;
          reasons.push('Higher coverage for risk-tolerant profile');
        }
      }

      // Employment level considerations
      if (userProfile.employmentLevel === 'Student' || userProfile.employmentLevel === 'Early Career') {
        if (policy.premium < 10000) {
          score += 15;
          reasons.push('Budget-friendly for your career stage');
        }
      } else if (userProfile.employmentLevel === 'Senior') {
        if (policy.coverage_amount > 500000) {
          score += 20;
          reasons.push('Comprehensive coverage for senior professionals');
        }
      }

      return {
        ...policy,
        score: Math.min(score, 100),
        reasons: reasons.slice(0, 2),
        smokerAnalysis
      };
    });

    return scoredPolicies
      .filter(policy => policy.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  const validateProfile = () => {
    const errors = {};
    
    if (!profile.age || profile.age < 18 || profile.age > 80) {
      errors.age = 'Age must be between 18 and 80';
    }
    if (!profile.employmentLevel) errors.employmentLevel = 'Employment level is required';
    if (!profile.familyStatus) errors.familyStatus = 'Family status is required';
    if (!profile.primaryGoal) errors.primaryGoal = 'Primary goal is required';
    if (!profile.riskTolerance) errors.riskTolerance = 'Risk tolerance is required';
    if (!profile.smokingStatus) errors.smokingStatus = 'Smoking status is required';
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (profileErrors[field]) {
      setProfileErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleViewDetails = (policy) => {
    setSelectedPolicyForDetails(policy);
    setIsDetailsOpen(true);
  };

  const formatDuration = (months) => {
    if (!months) return 'Not specified';
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${months} month${months > 1 ? 's' : ''}`;
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  };

  const handleGetRecommendations = () => {
    if (!validateProfile()) return;
    
    const recommended = getRecommendedPolicies(profile, allPolicies);
    setRecommendations(recommended);
    setShowRecommendations(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl border border-primary/10 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mr-3"></div>
              <span className="text-primary text-lg">Loading recommendations...</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="w-full flex items-center justify-start mb-4">
            <BackToDashboardButton />
          </div>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Smart Recommendations</h1>
            <p className="text-lg text-primary/70">
              Get personalized insurance recommendations based on your profile and needs
            </p>
          </div>

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          {/* User Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-primary mb-6">Your Profile</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  min="18"
                  max="80"
                  placeholder="Enter your age"
                  value={profile.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                {profileErrors.age && <p className="text-red-500 text-sm mt-1">{profileErrors.age}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment / Income Level *
                </label>
                <select
                  value={profile.employmentLevel}
                  onChange={(e) => handleInputChange('employmentLevel', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Select Level</option>
                  <option value="Student">Student</option>
                  <option value="Early Career">Early Career</option>
                  <option value="Mid Career">Mid Career</option>
                  <option value="Senior">Senior</option>
                  <option value="Retired">Retired</option>
                </select>
                {profileErrors.employmentLevel && <p className="text-red-500 text-sm mt-1">{profileErrors.employmentLevel}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Family Status *
                </label>
                <select
                  value={profile.familyStatus}
                  onChange={(e) => handleInputChange('familyStatus', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Married with Children">Married with Children</option>
                </select>
                {profileErrors.familyStatus && <p className="text-red-500 text-sm mt-1">{profileErrors.familyStatus}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Dependents
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={profile.dependents}
                  onChange={(e) => handleInputChange('dependents', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Goal *
                </label>
                <select
                  value={profile.primaryGoal}
                  onChange={(e) => handleInputChange('primaryGoal', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Select Goal</option>
                  <option value="Protect income">Protect Income</option>
                  <option value="Health protection">Health Protection</option>
                  <option value="Wealth creation">Wealth Creation</option>
                  <option value="Protect assets/vehicle">Protect Assets/Vehicle</option>
                  <option value="Travel safety">Travel Safety</option>
                </select>
                {profileErrors.primaryGoal && <p className="text-red-500 text-sm mt-1">{profileErrors.primaryGoal}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Tolerance *
                </label>
                <select
                  value={profile.riskTolerance}
                  onChange={(e) => handleInputChange('riskTolerance', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Select Tolerance</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                {profileErrors.riskTolerance && <p className="text-red-500 text-sm mt-1">{profileErrors.riskTolerance}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Smoking Status *
                </label>
                <select
                  value={profile.smokingStatus}
                  onChange={(e) => handleInputChange('smokingStatus', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  <option value="non-smoker">Non-Smoker</option>
                  <option value="smoker">Smoker</option>
                </select>
                {profileErrors.smokingStatus && <p className="text-red-500 text-sm mt-1">{profileErrors.smokingStatus}</p>}
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleGetRecommendations}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
              >
                Get Smart Recommendations
              </button>
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-primary mb-6">Recommended Policies for You</h2>
            
            {!showRecommendations ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-gray-500 text-lg">
                  Fill in your details and click 'Get Smart Recommendations' to see personalized suggestions.
                </p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No suitable recommendations found. Please try adjusting your profile details.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((policy) => (
                  <div key={policy.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{policy.name}</h3>
                        <p className="text-sm text-gray-600">{policy.type} • {policy.provider}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        Match: {policy.score}%
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Coverage: {formatCurrency(policy.coverage_amount)}</p>
                      <p className="text-sm text-gray-600">Yearly: {formatCurrency(policy.premium)}</p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Why recommended:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {policy.reasons.map((reason, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-accent mr-2">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700">
                          <strong>Smoker Analysis:</strong> {policy.smokerAnalysis}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleViewDetails(policy)}
                      className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Policy Details Modal */}
        {isDetailsOpen && selectedPolicyForDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-primary">Policy Details</h3>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800">{selectedPolicyForDetails.name}</h4>
                  <p className="text-gray-600">{selectedPolicyForDetails.type} Insurance</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Provider</p>
                    <p className="font-medium">{selectedPolicyForDetails.provider}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Coverage Amount</p>
                    <p className="font-medium">{formatCurrency(selectedPolicyForDetails.coverage_amount)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Yearly Amount</p>
                    <p className="font-medium">{formatCurrency(selectedPolicyForDetails.premium)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Amount</p>
                    <p className="font-medium">{formatCurrency(Math.round(selectedPolicyForDetails.premium / 12))}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Policy Term</p>
                  <p className="font-medium">{formatDuration(selectedPolicyForDetails.duration_months)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Key Benefits</p>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Comprehensive coverage with cashless claims</li>
                      <li>• 24/7 customer support</li>
                      <li>• Quick claim settlement process</li>
                      <li>• Network of trusted service providers</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Limitations & Exclusions</p>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      Refer to policy document for complete terms, conditions, and exclusions.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}