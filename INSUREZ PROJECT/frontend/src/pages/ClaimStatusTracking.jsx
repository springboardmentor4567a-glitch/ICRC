import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { claimsAPI } from '../api/client';
import DashboardLayout from '../components/DashboardLayout';
import BackToDashboardButton from '../components/BackToDashboardButton';
import { authAPI } from '../api/client';
import toast, { Toaster } from 'react-hot-toast';

const statusColors = {
  pending: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', dot: 'bg-orange-500' },
  approved: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-500' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', dot: 'bg-red-500' },
  paid: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

const getTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return new Date(dateString).toLocaleDateString('en-IN');
};

const ShimmerCard = () => (
  <div className="bg-background rounded-xl border border-primary/10 p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="h-6 bg-primary/10 rounded w-32"></div>
        <div className="h-6 bg-primary/10 rounded-full w-20"></div>
      </div>
      <div className="h-8 bg-primary/10 rounded w-24"></div>
    </div>
    <div className="grid grid-cols-4 gap-4">
      <div className="h-4 bg-primary/10 rounded w-full"></div>
      <div className="h-4 bg-primary/10 rounded w-full"></div>
      <div className="h-4 bg-primary/10 rounded w-full"></div>
      <div className="h-4 bg-primary/10 rounded w-full"></div>
    </div>
  </div>
);

export default function ClaimStatusTracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [allClaims, setAllClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [retryCount, setRetryCount] = useState(0);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const navigate = useNavigate();

  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const [userResponse, claimsResponse] = await Promise.all([
        authAPI.getProfile(),
        claimsAPI.getUserClaims()
      ]);
      
      setUser(userResponse.data);
      const claimsData = claimsResponse.data || [];
      setAllClaims(claimsData);
      setError('');
      setRetryCount(0);
      
      // Log success for debugging
      console.log(`✓ Claims loaded: ${claimsData.length}`);
    } catch (err) {
      console.error('Claims API Error:', err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        navigate('/login');
        return;
      }
      
      let errorMessage = 'Failed to load claims data';
      let errorDetails = '';
      
      if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Unable to connect to server';
        errorDetails = 'Please ensure the backend is running on http://localhost:8000';
      } else if (err.response?.status === 404) {
        errorMessage = 'Claims endpoint not found';
        errorDetails = 'API endpoint: GET /claims/';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error occurred';
        errorDetails = 'Please check backend logs';
      } else if (err.message) {
        errorDetails = err.message;
      }
      
      setError({ message: errorMessage, details: errorDetails });
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Real-time status polling every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !error) {
        fetchData();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [loading, error]);

  useEffect(() => {
    fetchData();
  }, [navigate]);

  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam && ['pending', 'approved', 'rejected', 'paid'].includes(statusParam)) {
      setActiveFilter(statusParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredClaims(allClaims);
    } else {
      setFilteredClaims(allClaims.filter(claim => claim.status === activeFilter));
    }
  }, [activeFilter, allClaims]);

  const handleRefresh = () => {
    fetchData(true);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', filter);
    }
    setSearchParams(searchParams);
  };

  const handleViewDetails = async (claim) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch policy details for the claim
      const response = await fetch(`http://127.0.0.1:8000/policies/${claim.policy_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const policyData = await response.json();
        setSelectedClaim({ ...claim, policy: policyData });
      } else {
        // If policy fetch fails, still show claim details without policy info
        setSelectedClaim({ ...claim, policy: null });
      }
    } catch (error) {
      console.error('Failed to load claim details:', error);
      // Still show claim details even if policy fetch fails
      setSelectedClaim({ ...claim, policy: null });
    }
  };

  const downloadClaimDetails = (claimData) => {
    const downloadData = {
      claim_id: claimData.claim_id,
      status: claimData.status,
      claim_type: claimData.claim_type,
      amount_requested: claimData.amount_requested,
      incident_date: claimData.incident_date,
      location: claimData.location,
      description: claimData.description,
      created_at: claimData.created_at,
      policy: claimData.policy || null,
      downloaded_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(downloadData, null, 2)], { 
      type: 'application/json' 
    });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `Claim_${claimData.claim_id}_Details.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const updateClaimStatus = async (claimId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/claims/${claimId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Claim #${claimId} → ${newStatus} ✅`, {
          duration: 3000,
          style: {
            background: '#0F172A',
            color: '#D4AF37',
            border: '1px solid #D4AF37',
            borderRadius: '8px'
          }
        });
        fetchData(); // Refresh claims list
        setSelectedClaim(null); // Close modal
      } else {
        const errorData = await response.json();
        toast.error(`Failed: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Update failed. Try again.');
    }
  };

  // Handle ESC key and background click
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && selectedClaim) {
        setSelectedClaim(null);
      }
    };

    if (selectedClaim) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [selectedClaim]);

  const getFilterCounts = () => {
    return {
      all: allClaims.length,
      pending: allClaims.filter(c => c.status === 'pending').length,
      approved: allClaims.filter(c => c.status === 'approved').length,
      paid: allClaims.filter(c => c.status === 'paid').length
    };
  };

  const counts = getFilterCounts();

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-background rounded-2xl shadow-xl border border-primary/10 p-8 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-primary mb-2">Claim Status Tracking</h1>
                <p className="text-primary/70">Monitor your insurance claims in real-time</p>
              </div>
              <div className="h-12 bg-primary/10 rounded-lg w-32 animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-background rounded-xl shadow-lg border border-primary/10 p-6 animate-pulse">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-primary/10 rounded w-20 mb-2"></div>
                    <div className="h-5 bg-primary/10 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-background rounded-xl shadow-lg border border-primary/10 p-4 mb-6">
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-primary/10 rounded-full w-20 animate-pulse"></div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-primary/60 text-lg">Fetching your claims...</p>
            </div>
            {[1, 2, 3, 4].map((i) => (
              <ShimmerCard key={i} />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full flex items-center justify-start mb-4">
          <BackToDashboardButton />
        </div>
        
        <div className="bg-background rounded-2xl shadow-xl border border-primary/10 p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Claim Status Tracking</h1>
              <p className="text-primary/70">Monitor your insurance claims in real-time</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-accent text-primary px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-lg"
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl mb-6 overflow-hidden shadow-lg">
            <div className="bg-red-100 px-6 py-4 border-b border-red-200">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 rounded-full p-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-red-800 font-semibold text-lg">{typeof error === 'string' ? error : error.message}</h4>
                  {typeof error === 'object' && error.details && (
                    <p className="text-red-600 text-sm mt-1">{error.details}</p>
                  )}
                </div>
                <button
                  onClick={handleRefresh}
                  className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry
                </button>
              </div>
            </div>
            <div className="bg-white px-6 py-4">
              <div className="flex items-start gap-3 text-sm">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-primary/70">
                  <p className="font-medium mb-1">Troubleshooting steps:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Verify backend is running: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">http://localhost:8000</code></li>
                    <li>Check browser console (F12) for detailed errors</li>
                    <li>Ensure you're logged in with valid credentials</li>
                    <li>Try refreshing the page or logging out and back in</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Object.entries({
            total: { label: 'Total Claims', count: counts.all, color: 'bg-primary' },
            pending: { label: 'Pending', count: counts.pending, color: 'bg-orange-500' },
            approved: { label: 'Approved', count: counts.approved, color: 'bg-green-500' },
            paid: { label: 'Paid', count: counts.paid, color: 'bg-blue-500' }
          }).map(([key, { label, count, color }]) => (
            <div key={key} className="bg-background rounded-xl shadow-lg border border-primary/10 p-6 transition-all duration-200 hover:shadow-xl hover:scale-105">
              <div className="flex items-center">
                <div className={`${color} rounded-lg p-3 mr-4`}>
                  <span className="text-white text-xl font-bold">{count}</span>
                </div>
                <div>
                  <p className="text-primary/60 text-sm">{label}</p>
                  <p className="text-primary font-semibold">{count} {count === 1 ? 'claim' : 'claims'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-background rounded-xl shadow-lg border border-primary/10 p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                activeFilter === 'all'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-background border-2 border-primary/20 text-primary hover:border-primary/40'
              }`}
            >
              All {counts.all > 0 && `(${counts.all})`}
            </button>
            <button
              onClick={() => handleFilterChange('pending')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
                activeFilter === 'pending'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-background border-2 border-orange-500/30 text-orange-700 hover:border-orange-500/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              Pending {counts.pending > 0 && `(${counts.pending})`}
            </button>
            <button
              onClick={() => handleFilterChange('approved')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
                activeFilter === 'approved'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-background border-2 border-green-500/30 text-green-700 hover:border-green-500/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              Approved {counts.approved > 0 && `(${counts.approved})`}
            </button>
            <button
              onClick={() => handleFilterChange('paid')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
                activeFilter === 'paid'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-background border-2 border-blue-500/30 text-blue-700 hover:border-blue-500/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              Paid {counts.paid > 0 && `(${counts.paid})`}
            </button>
          </div>
        </div>

        {!error && filteredClaims.length === 0 ? (
          <div className="bg-background rounded-2xl shadow-xl border border-primary/10 p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">No Claims Found</h3>
            <p className="text-primary/60 mb-6">
              {activeFilter === 'all' 
                ? "You haven't filed any insurance claims yet." 
                : `No ${activeFilter} claims found.`
              }
            </p>
            <button
              onClick={() => navigate('/claims')}
              className="bg-accent text-primary px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors shadow-lg"
            >
              File Your First Claim
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClaims.map((claim, index) => {
              const statusStyle = statusColors[claim.status] || statusColors.pending;
              return (
                <div 
                  key={claim.claim_id} 
                  className="bg-background rounded-xl shadow-lg border border-primary/10 p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-[1.01]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-xl font-bold text-primary">CLAIM-{claim.claim_id}</h3>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} border-2 flex items-center gap-2 shadow-sm`}>
                          <span className={`w-2.5 h-2.5 rounded-full ${statusStyle.dot} animate-pulse`}></span>
                          {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                        </span>
                        <span className="text-primary/60 text-sm font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {getTimeAgo(claim.created_at)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 rounded-lg p-2">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-primary/60 text-xs mb-1">Type</p>
                            <p className="text-primary font-bold">{claim.claim_type}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="bg-accent/20 rounded-lg p-2">
                            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-primary/60 text-xs mb-1">Amount</p>
                            <p className="text-primary font-bold text-lg">{formatCurrency(claim.amount_requested)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 rounded-lg p-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-primary/60 text-xs mb-1">Location</p>
                            <p className="text-primary font-semibold truncate">{claim.location}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className={`${statusStyle.bg} rounded-lg p-2`}>
                            <svg className={`w-5 h-5 ${statusStyle.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-primary/60 text-xs mb-1">Status</p>
                            <p className={`font-bold ${statusStyle.text}`}>{claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleViewDetails(claim)}
                      className="bg-primary text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all duration-200 hover:shadow-lg ml-6 flex items-center gap-2 group"
                    >
                      View Details
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0F172A',
            color: '#D4AF37',
            border: '1px solid #D4AF37',
            borderRadius: '8px'
          }
        }}
      />

      {/* Claim Details Modal */}
      {selectedClaim && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={(e) => e.target === e.currentTarget && setSelectedClaim(null)}
        >
          <div className="bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-primary/10 shadow-2xl transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/90 p-6 text-background">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Claim #{selectedClaim.claim_id}
                  </h2>
                  <div className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold border ${
                    selectedClaim.status === 'approved' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                    selectedClaim.status === 'paid' ? 'bg-accent/20 text-accent border-accent/30' :
                    selectedClaim.status === 'rejected' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    'bg-orange-500/20 text-orange-300 border-orange-500/30'
                  }`}>
                    {selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1)}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedClaim(null)}
                  className="p-2 hover:bg-background/10 rounded-xl transition-all group"
                  title="Close (ESC)"
                >
                  <svg className="w-6 h-6 text-background/80 group-hover:text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Claim and Policy Info Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Policy Info */}
                {selectedClaim.policy && (
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
                      <svg className="w-6 h-6 text-accent mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Policy Details
                    </h3>
                    <div className="bg-primary/5 rounded-xl p-6 border border-primary/10 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-primary/60">Policy Name:</span>
                        <span className="font-semibold text-primary">{selectedClaim.policy.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-primary/60">Premium:</span>
                        <span className="text-2xl font-bold text-accent">
                          {formatCurrency(selectedClaim.policy.premium)}/year
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-primary/60">Coverage:</span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(selectedClaim.policy.coverage_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-primary/60">Type:</span>
                        <span className="text-primary">{selectedClaim.policy.type}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-primary/60">Provider:</span>
                        <span className="text-primary">{selectedClaim.policy.provider}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Claim Info */}
                <div>
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
                    <svg className="w-6 h-6 text-accent mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Claim Information
                  </h3>
                  <div className="bg-primary/5 rounded-xl p-6 border border-primary/10 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-primary/60">Claim Type:</span>
                      <span className="font-semibold text-primary">{selectedClaim.claim_type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary/60">Amount Requested:</span>
                      <span className="text-2xl font-bold text-accent">
                        {formatCurrency(selectedClaim.amount_requested)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary/60">Incident Date:</span>
                      <span className="text-primary">
                        {new Date(selectedClaim.incident_date).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary/60">Location:</span>
                      <span className="text-primary">{selectedClaim.location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary/60">Submitted:</span>
                      <span className="text-primary">
                        {new Date(selectedClaim.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary/60">Status:</span>
                      <span className={`font-semibold ${
                        selectedClaim.status === 'approved' ? 'text-green-600' :
                        selectedClaim.status === 'paid' ? 'text-accent' :
                        selectedClaim.status === 'rejected' ? 'text-red-600' :
                        'text-orange-600'
                      }`}>
                        {selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              {selectedClaim.description && (
                <div>
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
                    <svg className="w-6 h-6 text-accent mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Claim Description
                  </h3>
                  <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                    <p className="text-primary leading-relaxed">{selectedClaim.description}</p>
                  </div>
                </div>
              )}
              
              {/* Admin Controls */}
              {selectedClaim.status !== 'paid' && (
                <div>
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
                    <svg className="w-6 h-6 text-accent mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin Actions
                  </h3>
                  <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                    <p className="text-primary/70 mb-4 text-sm">Update claim status:</p>
                    <div className="flex flex-wrap gap-3">
                      {selectedClaim.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateClaimStatus(selectedClaim.claim_id, 'approved')}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-600 rounded-lg hover:bg-emerald-500/30 transition-all duration-200"
                          >
                            → Approve
                          </button>
                          <button
                            onClick={() => updateClaimStatus(selectedClaim.claim_id, 'rejected')}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-600 rounded-lg hover:bg-red-500/30 transition-all duration-200"
                          >
                            → Reject
                          </button>
                        </>
                      )}
                      {selectedClaim.status === 'approved' && (
                        <button
                          onClick={() => updateClaimStatus(selectedClaim.claim_id, 'paid')}
                          className="flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-all duration-200"
                        >
                          → Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-primary/10">
                <button
                  onClick={() => downloadClaimDetails(selectedClaim)}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-accent to-amber-500 hover:from-amber-500 hover:to-accent text-primary font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border-0 focus:outline-none focus:ring-4 focus:ring-accent/30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Details
                </button>
                <button 
                  onClick={() => setSelectedClaim(null)}
                  className="px-6 py-4 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-xl hover:shadow-lg transition-all duration-200 border border-primary/20 hover:border-primary/40"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}