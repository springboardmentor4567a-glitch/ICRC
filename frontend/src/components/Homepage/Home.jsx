import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; 

const Home = () => {
  const navigate = useNavigate();

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('userRiskProfile'); 
    window.location.href = '/login';
  };

  return (
    <div className="home-container">
      
      {/* HEADER */}
      <div className="home-header" style={{ position: 'relative' }}>
        
        {/* TOP RIGHT CONTROLS (Profile + Logout) */}
        <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
        }}>
            {/* 👤 PROFILE ICON BUTTON */}
            <button 
                onClick={() => navigate('/profile')}
                title="Go to Profile"
                style={{
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: '50%', // Circle shape
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
            >
                👤
            </button>

            {/* LOGOUT BUTTON */}
            <button 
              onClick={handleLogout} 
              style={{
                padding: '8px 16px',
                backgroundColor: '#e74c3c', // Red
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                height: '40px' // Match height with profile icon
              }}
            >
              Logout
            </button>
        </div>

        <h2>Dashboard</h2>
        <p>Manage your insurance and view recommendations</p>
      </div>

      <div className="dashboard-grid">
        
        {/* Card 1: Policies */}
        <div className="feature-card" onClick={() => navigate('/policies')}>
          <div className="card-icon">📄</div>
          <h3>Policies</h3>
          <p>View your active plans</p>
          <button className="card-btn">Show Policies</button>
        </div>

        {/* Card 2: Premium Calculator */}
        <div className="feature-card" onClick={() => navigate('/calculator')}>
           <div className="card-icon">🧮</div>
          <h3>Premium Calculator</h3>
          <p>Estimate your costs</p>
          <button className="card-btn">Calculate Premium</button>
        </div>

        {/* Card 3: Recommendations */}
        <div className="feature-card" onClick={() => navigate('/recommendations')}>
           <div className="card-icon">💡</div>
          <h3>Recommendations</h3>
          <p>Suggested plans for you</p>
          <button className="card-btn">Get recommendations</button>
        </div>

        {/* Card 4: Risk Profile */}
        <div className="feature-card" onClick={() => navigate('/risk-profile')}>
           <div className="card-icon">⚠️</div>
          <h3>Risk Profile</h3>
          <p>Check your risk status</p>
          <button className="card-btn">Risk Profile</button>
        </div>

        {/* Card 5: File a Claim */}
        <div className="feature-card" onClick={() => navigate('/claims/new')}>
          <div className="icon">📝</div>
          <h3>File a Claim</h3>
          <p>Submit documents and track the status of your existing claims.</p>
          <button className="card-btn">Track Status</button>
        </div>

      </div>
    </div>
  );
};

export default Home;