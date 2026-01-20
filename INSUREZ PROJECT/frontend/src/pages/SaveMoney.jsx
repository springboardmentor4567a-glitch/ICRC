import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import BackToDashboardButton from '../components/BackToDashboardButton';

// Tips data model
const TIPS = [
  {
    id: 'general-compare',
    category: 'General',
    title: 'Compare options before you buy',
    description: 'Shop around and compare at least 3-4 policies to find the best coverage at competitive rates.',
    appliesTo: ['health', 'life', 'motor', 'home', 'travel'],
    action: { text: 'Compare Policies', route: '/compare' }
  },
  {
    id: 'general-annual',
    category: 'General',
    title: 'Pay annually instead of monthly',
    description: 'Annual payments often come with 5-10% discounts compared to monthly installments.',
    appliesTo: ['health', 'life', 'motor', 'home', 'travel']
  },
  {
    id: 'general-coverage',
    category: 'General',
    title: 'Choose appropriate coverage amounts',
    description: 'Avoid over-insurance. Calculate your actual needs to prevent paying for unnecessary coverage.',
    appliesTo: ['health', 'life', 'motor', 'home'],
    action: { text: 'Use Calculator', route: '/calculator' }
  },
  {
    id: 'health-early',
    category: 'Health',
    title: 'Buy health insurance early',
    description: 'Premiums are lower when you\'re young and healthy. Lock in better rates for life.',
    appliesTo: ['health'],
    minAge: 18,
    maxAge: 35
  },
  {
    id: 'health-floater',
    category: 'Health',
    title: 'Consider family floater plans',
    description: 'Family floater plans are often more cost-effective than individual policies for families.',
    appliesTo: ['health'],
    needsDependents: true
  },
  {
    id: 'health-lifestyle',
    category: 'Health',
    title: 'Maintain healthy lifestyle',
    description: 'Non-smokers and those with healthy habits get better rates. Be honest about your lifestyle.',
    appliesTo: ['health']
  },
  {
    id: 'life-term',
    category: 'Life',
    title: 'Prefer term life for pure protection',
    description: 'Term life insurance offers maximum coverage at lowest cost for income protection needs.',
    appliesTo: ['life'],
    needsDependents: true
  },
  {
    id: 'life-riders',
    category: 'Life',
    title: 'Avoid unnecessary riders',
    description: 'Only add riders that match your specific goals. Each rider increases the premium.',
    appliesTo: ['life']
  },
  {
    id: 'motor-deductible',
    category: 'Motor',
    title: 'Increase voluntary deductible',
    description: 'Higher deductibles reduce premiums. Choose an amount you can comfortably pay for minor repairs.',
    appliesTo: ['motor']
  },
  {
    id: 'motor-ncb',
    category: 'Motor',
    title: 'Protect your No-Claim Bonus',
    description: 'Avoid small claims to maintain NCB discounts. Pay minor repairs out-of-pocket when possible.',
    appliesTo: ['motor']
  },
  {
    id: 'home-value',
    category: 'Home',
    title: 'Insure based on replacement value',
    description: 'Base coverage on rebuilding costs, not market value or sentimental worth.',
    appliesTo: ['home']
  },
  {
    id: 'home-security',
    category: 'Home',
    title: 'Install security systems',
    description: 'Security alarms, CCTV, and safety measures often qualify for premium discounts.',
    appliesTo: ['home']
  }
];

export default function SaveMoney() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [policiesSummary, setPoliciesSummary] = useState(null);
  const [error, setError] = useState('');
  
  const [snapshot, setSnapshot] = useState({
    age: '',
    familyStatus: '',
    dependents: 0,
    policyFocus: []
  });
  
  const [highlightedTips, setHighlightedTips] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    fetchPoliciesSummary();
    updateHighlightedTips();
  }, []);

  const fetchPoliciesSummary = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://127.0.0.1:8000/policies', {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      
      // Count policies by type
      const summary = response.data.reduce((acc, policy) => {
        const type = policy.type.toLowerCase();
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      setPoliciesSummary(summary);
    } catch (err) {
      setError('Could not load policy data. Tips will still work.');
      console.error('Error fetching policies:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHighlightedTips = (userSnapshot, allTips) => {
    return allTips.filter(tip => {
      let score = 0;
      
      // Policy focus match
      if (userSnapshot.policyFocus.some(focus => tip.appliesTo.includes(focus))) {
        score += 3;
      }
      
      // Age relevance
      if (tip.minAge && tip.maxAge) {
        const age = parseInt(userSnapshot.age);
        if (age >= tip.minAge && age <= tip.maxAge) {
          score += 2;
        }
      }
      
      // Dependents relevance
      if (tip.needsDependents && userSnapshot.dependents > 0) {
        score += 2;
      }
      
      // Family status relevance
      if (tip.needsDependents && (userSnapshot.familyStatus === 'Married' || userSnapshot.familyStatus === 'Married with Children')) {
        score += 1;
      }
      
      return score > 0;
    }).sort((a, b) => {
      // Sort by relevance score (simplified)
      const scoreA = userSnapshot.policyFocus.some(focus => a.appliesTo.includes(focus)) ? 1 : 0;
      const scoreB = userSnapshot.policyFocus.some(focus => b.appliesTo.includes(focus)) ? 1 : 0;
      return scoreB - scoreA;
    }).slice(0, 5);
  };

  const updateHighlightedTips = () => {
    const highlighted = getHighlightedTips(snapshot, TIPS);
    setHighlightedTips(highlighted);
  };

  const handleSnapshotChange = (field, value) => {
    setSnapshot(prev => ({ ...prev, [field]: value }));
  };

  const handlePolicyFocusChange = (policyType, checked) => {
    setSnapshot(prev => ({
      ...prev,
      policyFocus: checked 
        ? [...prev.policyFocus, policyType]
        : prev.policyFocus.filter(p => p !== policyType)
    }));
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const groupedTips = TIPS.reduce((acc, tip) => {
    if (!acc[tip.category]) acc[tip.category] = [];
    acc[tip.category].push(tip);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="w-full flex items-center justify-start mb-4">
            <BackToDashboardButton />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Save Money on Insurance</h1>
            <p className="text-lg text-primary/70">
              Practical tips and insights to help you reduce your overall insurance cost
            </p>
          </div>

          {/* Policies Summary */}
          {!loading && policiesSummary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                <strong>Available options:</strong> {' '}
                {Object.entries(policiesSummary).map(([type, count]) => 
                  `${count} ${type.charAt(0).toUpperCase() + type.slice(1)}`
                ).join(', ')}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* User Snapshot Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">Your Snapshot</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  min="18"
                  max="80"
                  placeholder="Enter your age"
                  value={snapshot.age}
                  onChange={(e) => handleSnapshotChange('age', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Family Status</label>
                <select
                  value={snapshot.familyStatus}
                  onChange={(e) => handleSnapshotChange('familyStatus', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Married with Children">Married with Children</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Dependents</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={snapshot.dependents}
                  onChange={(e) => handleSnapshotChange('dependents', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Policy Focus</label>
                <div className="grid grid-cols-2 gap-2">
                  {['health', 'life', 'motor', 'home', 'travel'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={snapshot.policyFocus.includes(type)}
                        onChange={(e) => handlePolicyFocusChange(type, e.target.checked)}
                        className="mr-2 text-accent focus:ring-accent rounded"
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={updateHighlightedTips}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Update Tips
            </button>
          </div>

          {/* Top Opportunities */}
          {highlightedTips.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Top Opportunities for You</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {highlightedTips.map(tip => (
                  <div key={tip.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{tip.title}</h3>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        High Impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{tip.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {tip.appliesTo.slice(0, 3).map(type => (
                          <span key={type} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                        ))}
                      </div>
                      {tip.action && (
                        <Link
                          to={tip.action.route}
                          className="text-accent hover:text-accent/80 text-sm font-medium"
                        >
                          {tip.action.text} →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Tips by Category */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">All Money-Saving Tips</h2>
            
            {Object.entries(groupedTips).map(([category, tips]) => (
              <div key={category} className="mb-4">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-800">{category} Insurance</h3>
                  <svg 
                    className={`w-5 h-5 transform transition-transform ${expandedCategories[category] ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedCategories[category] && (
                  <div className="mt-2 space-y-3">
                    {tips.map(tip => (
                      <div key={tip.id} className="border-l-4 border-accent pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 mb-1">{tip.title}</h4>
                            <p className="text-sm text-gray-600">{tip.description}</p>
                          </div>
                          {tip.action && (
                            <Link
                              to={tip.action.route}
                              className="ml-4 text-accent hover:text-accent/80 text-sm font-medium whitespace-nowrap"
                            >
                              {tip.action.text} →
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}