import React, { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../adminApi';
import AdminHeader from './AdminHeader';
import './admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const d = await getAdminDashboard();
      setStats(d);
    };
    load();
  }, []);

  if (!stats) return <div className="admin-container"><div className="spinner"></div> Loading...</div>;

  return (
    <div className="admin-container">
      <AdminHeader />

      {/* HERO STATS */}
      <div className="admin-hero">
          <h1 className="hero-title">Command Center</h1>
          <p className="hero-subtitle">System Active. You have <strong>{stats.pending_claims} items</strong> requiring attention.</p>
          
          <div className="stat-grid">
              <div className="stat-card">
                  <span className="stat-value">{stats.users}</span>
                  <span className="stat-label">Total Users</span>
              </div>
              <div className="stat-card">
                  <span className="stat-value">{stats.policies}</span>
                  <span className="stat-label">Active Policies</span>
              </div>
              <div className="stat-card" style={{border:'1px solid #fbbf24', background:'rgba(251, 191, 36, 0.1)'}}>
                  <span className="stat-value" style={{color:'#fbbf24'}}>{stats.pending_claims}</span>
                  <span className="stat-label" style={{color:'#fbbf24'}}>Pending Review</span>
              </div>
              <div className="stat-card" style={{border:'1px solid #f43f5e', background:'rgba(244, 63, 94, 0.1)'}}>
                  <span className="stat-value" style={{color:'#f43f5e'}}>{stats.fraud_flags}</span>
                  <span className="stat-label" style={{color:'#f43f5e'}}>Risk Flags</span>
              </div>
          </div>
      </div>

      {/* SPLIT LAYOUT (Quick Actions & Health) */}
      <div className="dashboard-layout">
          {/* LEFT: Quick Actions */}
          <div className="dashboard-section">
              <h3 className="section-title">⚡ Quick Actions</h3>
              <div className="action-grid">
                  <a href="/admin/policies" className="action-card">
                      <span className="action-icon">🚀</span>
                      <div className="action-info">
                          <strong>Launch Product</strong>
                          <span>Create & publish plans</span>
                      </div>
                  </a>
                  <a href="/admin/users" className="action-card">
                      <span className="action-icon">👮</span>
                      <div className="action-info">
                          <strong>User Registry</strong>
                          <span>Manage bans & permissions</span>
                      </div>
                  </a>
                  <a href="/admin/claims" className="action-card">
                      <span className="action-icon">🔍</span>
                      <div className="action-info">
                          <strong>Investigate</strong>
                          <span>Review flagged cases</span>
                      </div>
                  </a>
              </div>
          </div>

          {/* RIGHT: System Health */}
          <div className="dashboard-section">
              <h3 className="section-title">📊 System Health</h3>
              <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                  <div className="health-row">
                      <span>Database Connection</span>
                      <span className="status-dot">Operational</span>
                  </div>
                  <div className="health-row">
                      <span>Fraud Engine AI</span>
                      <span className="status-dot">Active</span>
                  </div>
                  <div className="health-row">
                      <span>Payment Gateway</span>
                      <span className="status-dot">Secure</span>
                  </div>
                  <div className="health-row" style={{borderBottom:'none'}}>
                      <span>Server Latency</span>
                      <span style={{color:'#64748b', fontSize:'0.9rem', fontWeight:'600'}}>24ms</span>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;