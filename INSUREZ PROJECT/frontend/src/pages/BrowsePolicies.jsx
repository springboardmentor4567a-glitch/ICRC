import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import PolicyCard from '../components/PolicyCard';
import PolicyDetailsModal from '../components/PolicyDetailsModal';
import QuoteModal from '../components/QuoteModal';
import BackToDashboardButton from '../components/BackToDashboardButton';

export default function BrowsePolicies() {
  const [allPolicies, setAllPolicies] = useState([]);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPolicyForQuote, setSelectedPolicyForQuote] = useState(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const filterPolicies = (policies, term) => {
    if (!term.trim()) {
      return policies;
    }
    
    const searchLower = term.toLowerCase();
    return policies.filter(policy => 
      policy.name.toLowerCase().includes(searchLower) ||
      policy.type.toLowerCase().includes(searchLower) ||
      policy.provider.toLowerCase().includes(searchLower)
    );
  };

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const url = 'http://127.0.0.1:8000/policies';
        
        const response = await axios.get(url, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        });
        
        setAllPolicies(response.data);
        setFilteredPolicies(response.data);
      } catch (err) {
        let errorMessage = 'Failed to fetch policies';
        if (err.response?.status === 404) {
          errorMessage = 'No policies found';
        } else if (err.response?.status === 401) {
          errorMessage = 'Authentication required';
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login');
          return;
        } else if (err.response?.data?.detail) {
          errorMessage = `Failed to fetch policies: ${err.response.data.detail}`;
        } else if (err.message) {
          errorMessage = `Failed to fetch policies: ${err.message}`;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, [navigate]);

  useEffect(() => {
    const filtered = filterPolicies(allPolicies, searchTerm);
    setFilteredPolicies(filtered);
  }, [searchTerm, allPolicies]);

  const handleViewDetails = (policy) => {
    setSelectedPolicy(policy);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPolicy(null);
  };

  const handleRequestQuote = (policy) => {
    setSelectedPolicyForQuote(policy);
    setIsQuoteModalOpen(true);
  };

  const handleCloseQuoteModal = () => {
    setIsQuoteModalOpen(false);
    setSelectedPolicyForQuote(null);
  };

  const handleQuoteSubmit = (policy, formData) => {
    setIsQuoteModalOpen(false);
    setSelectedPolicyForQuote(null);
    setSuccessMessage(`Quote request submitted for ${policy.name}`);
    setShowSuccessToast(true);
    
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  const getDisplayPolicies = () => {
    if (searchTerm.trim()) {
      return filteredPolicies;
    } else {
      const shuffled = shuffleArray(filteredPolicies);
      return shuffled.slice(0, 9);
    }
  };

  const displayPolicies = getDisplayPolicies();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="bg-background rounded-2xl shadow-xl border border-primary/10 p-8">
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
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full flex items-center justify-start mb-4">
          <BackToDashboardButton />
        </div>
        <div className="text-center mb-8">
          <div className="bg-background rounded-3xl shadow-xl border border-primary/10 p-8 mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Browse Insurance <span className="text-accent">Policies</span>
            </h1>
            <p className="text-xl text-primary/70 mb-6">
              Explore our comprehensive collection of insurance policies
            </p>
            
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-primary/20 rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300"
                  placeholder="Search by policy name or type (e.g., life, health, motor)..."
                />
              </div>
            </div>
          </div>
        </div>

        {showSuccessToast && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center mb-6">
            {error}
          </div>
        )}

        {displayPolicies.length === 0 && !loading && !error ? (
          <div className="text-center py-12">
            <div className="bg-background rounded-xl p-8 border border-primary/10">
              <h3 className="text-xl font-semibold text-primary mb-2">
                {searchTerm ? 'No matching policies found' : 'No Policies Available'}
              </h3>
              <p className="text-primary/60">
                {searchTerm ? 'Try adjusting your search terms.' : 'Check back later for new policy options.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {displayPolicies.map((policy) => (
              <PolicyCard 
                key={policy.id} 
                policy={policy} 
                onViewDetails={handleViewDetails}
                onRequestQuote={handleRequestQuote}
              />
            ))}
          </div>
        )}
      </div>

      <PolicyDetailsModal 
        policy={selectedPolicy}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <QuoteModal 
        policy={selectedPolicyForQuote}
        isOpen={isQuoteModalOpen}
        onClose={handleCloseQuoteModal}
        onSubmit={handleQuoteSubmit}
      />
    </DashboardLayout>
  );
}