import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import Calculators from './Calculators';
import FindInsurance from './FindInsurance';
import MyPolicies from './MyPolicies';
import RiskProfile from './RiskProfile';
import Profile from './Profile'; // <--- NEW IMPORT

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  // --- STATE TO TRACK AUTO-OPEN POLICY ---
  const [autoOpenPolicyId, setAutoOpenPolicyId] = useState(null);

  // --- CHECK FOR SAVED SESSION ON LOAD ---
  useEffect(() => {
    const savedUser = localStorage.getItem('user_data');
    const token = localStorage.getItem('access_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setCurrentView('dashboard');
  };

  // --- NAVIGATION HANDLER ---
  const handleNavigate = (view, policyId = null) => {
    setCurrentView(view);
    if (policyId) {
      setAutoOpenPolicyId(policyId);
    }
  };

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  // --- RENDER LOGIC ---
  return (
    <div className="w-full h-screen">
      {!user ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          {currentView === 'dashboard' && (
            <Dashboard
              user={user}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
            />
          )}
          {currentView === 'calculators' && (
            <Calculators
              onBack={() => setCurrentView('dashboard')}
            />
          )}
          {currentView === 'find-insurance' && (
            <FindInsurance
              onBack={() => setCurrentView('dashboard')}
              autoOpenPolicyId={autoOpenPolicyId}
              onModalClosed={() => setAutoOpenPolicyId(null)}
            />
          )}
          {currentView === 'my-policies' && (
            <MyPolicies
              onBack={() => setCurrentView('dashboard')}
            />
          )}
          {currentView === 'risk-profile' && (
            <RiskProfile
              onBack={() => setCurrentView('dashboard')}
              onComplete={() => setCurrentView('dashboard')}
            />
          )}
          {/* NEW PROFILE ROUTE */}
          {currentView === 'profile' && (
            <Profile
              user={user}
              onBack={() => setCurrentView('dashboard')}
              onLogout={handleLogout}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;