import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "./apiClient";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetchWithAuth('/api/analytics/dashboard');
      if (response.ok) {
        const data = await response.json();
        setData(data);
      } else {
        console.error("Failed to fetch dashboard data");
        // Set fallback data for demo purposes
        setData({
          total_claims: 0,
          pending_claims: 0,
          approved_claims: 0,
          rejected_claims: 0,
          total_premiums: 0,
          monthly_revenue: 0,
          total_users: 0,
          active_policies: 0,
          fraud_flags: 0,
          claims_by_type: {},
          policies_by_category: {},
          recent_activity: []
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set fallback data for demo purposes
      setData({
        total_claims: 0,
        pending_claims: 0,
        approved_claims: 0,
        rejected_claims: 0,
        total_premiums: 0,
        monthly_revenue: 0,
        total_users: 0,
        active_policies: 0,
        fraud_flags: 0,
        claims_by_type: {},
        policies_by_category: {},
        recent_activity: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleClaimUpdate = () => fetchData();
    window.addEventListener('claimUpdated', handleClaimUpdate);

    // Listen for localStorage changes (cross-tab updates)
    const handleStorageChange = (e) => {
      if (e.key === 'claimUpdated') {
        fetchData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('claimUpdated', handleClaimUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Loading Dashboard...</div>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #dc2626', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="admin-dashboard">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '1.5rem', color: '#dc2626' }}>Failed to load dashboard data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-title">Admin Dashboard</h1>
          <nav className="admin-nav">
            <button className="admin-nav-btn" onClick={() => navigate('/admin/claims')}>
              Manage Claims
            </button>
            <button className="admin-nav-btn" onClick={() => navigate('/admin/reports')}>
              Reports
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        {/* Overview Section */}
        <section className="dashboard-overview">
          <h2 className="overview-title">Insurance Platform Overview</h2>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total-claims">📊</div>
              <div className="stat-value">{data.total_claims || 0}</div>
              <div className="stat-label">Total Claims</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon pending-claims">⏳</div>
              <div className="stat-value">{data.pending_claims || 0}</div>
              <div className="stat-label">Pending Claims</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon total-claims">👥</div>
              <div className="stat-value">{data.total_users || 0}</div>
              <div className="stat-label">Total Users</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon total-value">📋</div>
              <div className="stat-value">{data.active_policies || 0}</div>
              <div className="stat-label">Active Policies</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon pending-claims">🚨</div>
              <div className="stat-value">{data.fraud_flags || 0}</div>
              <div className="stat-label">Fraud Flags</div>
            </div>
          </div>
        </section>

        {/* Claims Breakdown */}
        <section className="dashboard-overview">
          <h2 className="overview-title">Claims Status Breakdown</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total-claims">✅</div>
              <div className="stat-value">{data.approved_claims || 0}</div>
              <div className="stat-label">Approved Claims</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon pending-claims">❌</div>
              <div className="stat-value">{data.rejected_claims || 0}</div>
              <div className="stat-label">Rejected Claims</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon total-value">📈</div>
              <div className="stat-value">{formatCurrency(data.monthly_revenue || 0)}</div>
              <div className="stat-label">Monthly Revenue</div>
            </div>
          </div>
        </section>

        {/* Claims by Type */}
        {data.claims_by_type && Object.keys(data.claims_by_type).length > 0 && (
          <section className="dashboard-overview">
            <h2 className="overview-title">Claims by Type</h2>
            <div className="stats-grid">
              {Object.entries(data.claims_by_type).map(([type, count]) => (
                <div key={type} className="stat-card">
                  <div className="stat-icon total-claims">📋</div>
                  <div className="stat-value">{count}</div>
                  <div className="stat-label">{type.charAt(0).toUpperCase() + type.slice(1)} Claims</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Policies by Category */}
        {data.policies_by_category && Object.keys(data.policies_by_category).length > 0 && (
          <section className="dashboard-overview">
            <h2 className="overview-title">Policies by Category</h2>
            <div className="stats-grid">
              {Object.entries(data.policies_by_category).map(([category, count]) => (
                <div key={category} className="stat-card">
                  <div className="stat-icon total-value">🏷️</div>
                  <div className="stat-value">{count}</div>
                  <div className="stat-label">{category} Policies</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Activity */}
        {data.recent_activity && data.recent_activity.length > 0 && (
          <section className="dashboard-overview">
            <h2 className="overview-title">Recent Activity</h2>
            <div className="quick-actions">
              <div style={{ display: 'grid', gap: '1rem' }}>
                {data.recent_activity.map((activity, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '0.5rem',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                      {activity.action}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {activity.user} • {formatDate(activity.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2 className="actions-title">Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => navigate('/admin/claims')}>
              Manage Claims
            </button>
            <button className="action-btn secondary" onClick={() => navigate('/admin/reports')}>
              Generate Reports
            </button>
            <button className="action-btn secondary" onClick={() => window.location.reload()}>
              Refresh Data
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}