import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logoutUser } from '../../api';
import './admin.css';

const AdminHeader = () => {
  const location = useLocation();
  const active = location.pathname.split('/')[2] || 'dashboard';

  const handleLogout = () => {
      logoutUser();
      window.location.href = '/login';
  };

  return (
    <div className="admin-header">
      <div className="header-left">
        <div className="logo-area">
            <span style={{fontSize:'1.5rem'}}>🛡️</span> Admin Portal
        </div>
        <nav className="admin-nav">
            <Link to="/admin" className={active === 'dashboard' ? 'active' : ''}>Dashboard</Link>
            <Link to="/admin/claims" className={active === 'claims' ? 'active' : ''}>Claims Analysis</Link>
            <Link to="/admin/policies" className={active === 'policies' ? 'active' : ''}>Policy Manager</Link>
            <Link to="/admin/users" className={active === 'users' ? 'active' : ''}>User Registry</Link>
        </nav>
      </div>
      
      {/* Right Aligned Logout */}
      <button className="logout-btn" onClick={handleLogout}>
          <span>Log Out</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      </button>
    </div>
  );
};

export default AdminHeader;