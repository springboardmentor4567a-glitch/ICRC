import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Simple toast notification system
const toast = {
  success: (message) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 font-semibold';
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    setTimeout(() => document.body.removeChild(toastEl), 3000);
  },
  error: (message) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed top-4 right-4 bg-rose-500 text-white px-6 py-3 rounded-xl shadow-2xl z-50 font-semibold';
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    setTimeout(() => document.body.removeChild(toastEl), 3000);
  }
};

// Shimmer Loading Component
const ShimmerLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800/50 to-slate-900/80 p-12 flex items-center justify-center">
    <div className="text-center space-y-8">
      <div className="inline-block w-24 h-24 bg-gradient-to-r from-yellow-600/20 to-amber-500/20 rounded-3xl animate-pulse blur-sm"></div>
      <div className="space-y-3">
        <div className="h-8 w-64 bg-slate-700/50 rounded-xl animate-pulse mx-auto"></div>
        <div className="h-6 w-48 bg-slate-700/30 rounded-lg animate-pulse mx-auto"></div>
      </div>
      <div className="flex justify-center space-x-2">
        <div className="w-12 h-12 bg-slate-700/50 rounded-2xl animate-pulse"></div>
        <div className="w-12 h-12 bg-slate-700/50 rounded-2xl animate-pulse" style={{animationDelay: '0.1s'}}></div>
        <div className="w-12 h-12 bg-slate-700/50 rounded-2xl animate-pulse" style={{animationDelay: '0.2s'}}></div>
      </div>
      <p className="text-slate-400 text-sm">Loading admin dashboard...</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [stats, setStats] = useState({
    totalClaims: 0,
    pending: 0,
    approved: 0,
    revenue: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    try {
      setLoading(true);
      setError(null);
      
      // Test backend first
      const testRes = await fetch('http://localhost:8000/admin/test', { signal: controller.signal });
      console.log('✅ Backend alive:', testRes.ok);
      
      // Load claims
      const claimsRes = await fetch('http://localhost:8000/admin/claims', { signal: controller.signal });
      if (claimsRes.ok) {
        const claimsData = await claimsRes.json();
        console.log('📊 Claims loaded:', claimsData?.length || 0);
        setClaims(claimsData || []);
        
        // Calculate stats
        const totalClaims = claimsData?.length || 0;
        const pending = claimsData?.filter(c => c.status === 'Pending' || !c.status)?.length || 0;
        const approved = claimsData?.filter(c => c.status === 'Approved')?.length || 0;
        const revenue = claimsData?.reduce((sum, c) => sum + (c.amount_requested || 0), 0) || 0;
        
        setStats({ totalClaims, pending, approved, revenue });
      } else {
        throw new Error(`HTTP ${claimsRes.status}`);
      }
      
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Backend timeout - start uvicorn main:app --reload');
      } else {
        setError(`Load failed: ${err.message}`);
        console.error('Dashboard error:', err);
        // FAKE DATA as backup
        setClaims([
          {id: 1, policy_id: 101, status: 'Pending', amount_requested: 50000, incident_date: '2024-01-15', claim_type: 'Health'},
          {id: 2, policy_id: 102, status: 'Approved', amount_requested: 75000, incident_date: '2024-01-14', claim_type: 'Auto'},
          {id: 3, policy_id: 103, status: 'Pending', amount_requested: 120000, incident_date: '2024-01-13', claim_type: 'Health'}
        ]);
        setStats({ totalClaims: 3, pending: 2, approved: 1, revenue: 245000 });
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false); // ALWAYS STOP LOADING
    }
  };



  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleStatusUpdate = async (claimId, newStatus) => {
    console.log(`🔄 Updating claim ${claimId} to ${newStatus}`);
    setButtonLoading(true);
    
    try {
      const response = await fetch(`http://localhost:8000/admin/claims/${claimId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })  // Simple JSON
      });

      const responseData = await response.json();
      console.log('📡 Response:', response.status, responseData);
      
      if (response.ok) {
        toast.success(`Claim #${claimId} ${newStatus.toLowerCase()}d! ✅`);
        loadDashboardData(); // Refresh table
      } else {
        toast.error(`Error ${response.status}: ${responseData.detail || 'Update failed'}`);
      }
    } catch (error) {
      console.error('🌐 NETWORK ERROR:', error);
      toast.error('Backend error - check uvicorn is running');
    } finally {
      setButtonLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Claim ID', 'Policy ID', 'Status', 'Amount', 'Date', 'Type'],
      ...claims.map(claim => [
        claim.id,
        claim.policy_id,
        claim.status,
        claim.amount_requested,
        claim.incident_date,
        claim.claim_type
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'claims_export.csv';
    a.click();
  };

  const fraudAlerts = [
    { id: 1, claimId: 'CLM-001', risk: 'High', reason: 'Multiple claims same location', amount: '₹1.2L' },
    { id: 2, claimId: 'CLM-045', risk: 'Medium', reason: 'Unusual claim pattern', amount: '₹85K' },
    { id: 3, claimId: 'CLM-078', risk: 'High', reason: 'Duplicate documentation', amount: '₹2.1L' }
  ];

  // Show loading OR error OR data
  if (loading) {
    return <ShimmerLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800/50 to-slate-900/80 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connection Error</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-amber-500 text-slate-900 font-bold rounded-xl hover:scale-105 transition-all"
          >
            🔄 Retry Connection
          </button>
          <p className="text-slate-500 text-sm mt-4">Using demo data below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800/50 to-slate-900/80 backdrop-blur-xl">
      {/* Header */}
      <div className="bg-slate-900/95 backdrop-blur-xl border-b border-yellow-600/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-7 h-7 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.42 3.42l-.723 5.145A3.42 3.42 0 0116.28 16H3.72a3.42 3.42 0 01-3.058-2.116l-.723-5.145a3.42 3.42 0 013.42-3.42z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-white via-slate-200 to-yellow-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-slate-400 font-semibold mt-1">InsureZ - Claims & Fraud Analytics</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={exportToCSV}
                className="px-6 py-2.5 bg-gradient-to-r from-yellow-600 to-amber-500 text-slate-900 font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                📊 Export CSV
              </button>
              <button 
                onClick={loadDashboardData}
                className="px-6 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-semibold hover:bg-emerald-500/40 transition-all"
              >
                🔄 Refresh
              </button>
              <button 
                onClick={handleLogout}
                className="px-6 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-semibold hover:bg-red-500/40 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatsCard title="Total Claims" value={stats.totalClaims} trend="+12%" color="yellow" icon="📋" />
          <StatsCard title="Pending" value={stats.pending} trend="-3%" color="amber" icon="⏳" />
          <StatsCard title="Approved" value={stats.approved} trend="+18%" color="emerald" icon="✅" />
          <StatsCard title="Revenue" value={`₹${(stats.revenue/100000).toFixed(1)}L`} trend="+25%" color="blue" icon="💰" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Claims Table */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">📊</span>
                Recent Claims
                <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 text-sm rounded-full">
                  {claims.length} Total
                </span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left py-4 font-semibold text-slate-300">Claim ID</th>
                      <th className="text-left py-4 font-semibold text-slate-300">Policy</th>
                      <th className="text-left py-4 font-semibold text-slate-300">Status</th>
                      <th className="text-left py-4 font-semibold text-slate-300">Amount</th>
                      <th className="text-left py-4 font-semibold text-slate-300">Date</th>
                      <th className="text-left py-4 font-semibold text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((claim) => (
                      <ClaimRow key={claim.id} claim={claim} onStatusUpdate={handleStatusUpdate} buttonLoading={buttonLoading} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Fraud Detection */}
          <div>
            <div className="bg-gradient-to-b from-rose-500/10 to-rose-600/5 backdrop-blur-xl rounded-3xl border-2 border-rose-500/20 p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-rose-400 mb-6 flex items-center gap-2">
                🚨 Fraud Alerts
                <span className="px-3 py-1 bg-rose-500/20 text-rose-400 text-xs rounded-full">3 High Risk</span>
              </h2>
              <div className="space-y-4">
                {fraudAlerts.map((alert) => (
                  <FraudAlert key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, trend, color, icon }) => {
  const colorClasses = {
    yellow: 'from-yellow-600 to-amber-500',
    amber: 'from-amber-500 to-orange-500',
    emerald: 'from-emerald-500 to-green-500',
    blue: 'from-blue-500 to-indigo-500'
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 shadow-2xl hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 bg-gradient-to-r ${colorClasses[color]} rounded-2xl flex items-center justify-center shadow-xl text-2xl`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-white">{value}</p>
          <p className="text-slate-400 font-medium text-sm">{title}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend} vs last month
        </span>
      </div>
    </div>
  );
};

// Claim Row Component
const ClaimRow = ({ claim, onStatusUpdate, buttonLoading }) => {
  const isFinalized = ['Approved', 'Rejected', 'Paid'].includes(claim.status);

  return (
    <tr className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
      <td className="py-4 font-semibold text-white">#{claim.id}</td>
      <td className="py-4 text-slate-300">POL-{claim.policy_id}</td>
      <td className="py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          claim.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
          claim.status === 'Rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
          claim.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
          'bg-slate-500/20 text-slate-400 border border-slate-500/30'
        }`}>
          {claim.status || 'Pending'}
        </span>
      </td>
      <td className="py-4 font-semibold text-yellow-400">₹{claim.amount_requested?.toLocaleString() || '50,000'}</td>
      <td className="py-4 text-slate-300">{claim.incident_date || '2024-01-15'}</td>
      <td className="py-4 space-x-2">
        {isFinalized ? (
          <span className={`px-4 py-2 text-xs font-bold rounded-full border ${
            claim.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
            claim.status === 'Rejected' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
            'bg-blue-500/20 text-blue-400 border-blue-500/30'
          }`}>
            {claim.status}
          </span>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => onStatusUpdate(claim.id, 'Approved')}
              disabled={buttonLoading}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 
                         text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap
                         flex items-center gap-1"
            >
              {buttonLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                '✅'
              )}
              Approve
            </button>
            <button
              onClick={() => onStatusUpdate(claim.id, 'Rejected')}
              disabled={buttonLoading}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 
                         text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap
                         flex items-center gap-1"
            >
              {buttonLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                '❌'
              )}
              Reject
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

// Fraud Alert Component
const FraudAlert = ({ alert }) => {
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-2xl p-4 border border-rose-500/20">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-white text-sm">{alert.claimId}</span>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getRiskColor(alert.risk)}`}>
          {alert.risk} Risk
        </span>
      </div>
      <p className="text-slate-300 text-sm mb-2">{alert.reason}</p>
      <div className="flex items-center justify-between">
        <span className="text-yellow-400 font-semibold text-sm">{alert.amount}</span>
        <button className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold hover:bg-rose-500/40 transition-all">
          Investigate
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;