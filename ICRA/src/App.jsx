import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import Calculators from './Calculators';
import FindInsurance from './FindInsurance';
import MyPolicies from './MyPolicies';
import RiskProfile from './RiskProfile';
import Profile from './Profile';
import CheckoutPage from './CheckoutPage';
import ActivityLog from './ActivityLog';
import AdminDashboard from './AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  // Navigation States
  const [autoOpenPolicyId, setAutoOpenPolicyId] = useState(null);
  const [checkoutPolicy, setCheckoutPolicy] = useState(null); // <--- Holds policy data for checkout

  // Welcome Animation State
  const [welcomeShown, setWelcomeShown] = useState(false);

  // History API for Back Button
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
      } else {
        if (user) setCurrentView('dashboard');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setWelcomeShown(false);
    
    // Check ROLE from backend response
    if (userData.role === 'admin') {
         setCurrentView('admin');
         window.history.pushState({ view: 'admin' }, '');
    } else {
         setCurrentView('dashboard');
         window.history.pushState({ view: 'dashboard' }, '');
    }
  };

  const handleLogout = async () => {
    // --- NEW: Tell backend to mark us offline ---
    try {
        const token = localStorage.getItem('access_token');
        if (token) {
            await fetch('http://127.0.0.1:8000/auth/logout', { 
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
    } catch (e) { console.error("Logout error", e); }
    // ---------------------------------------------

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setCurrentView('dashboard');
    setWelcomeShown(false);
  };

  // Unified Navigation Handler
  // data can be: policyId (for FindInsurance) OR policyObject (for Checkout)
  const handleNavigate = (view, data = null) => {
    setCurrentView(view);

    if (view === 'find-insurance' && data) {
      setAutoOpenPolicyId(data); // data is ID
    }

    if (view === 'checkout' && data) {
      setCheckoutPolicy(data); // data is Policy Object
    }

    window.history.pushState({ view }, '');
  };

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
              welcomeShown={welcomeShown}
              setWelcomeShown={setWelcomeShown}
            />
          )}
          {currentView === 'calculators' && (
            <Calculators
              onBack={() => handleNavigate('dashboard')}
            />
          )}
          {currentView === 'find-insurance' && (
            <FindInsurance
              onBack={() => handleNavigate('dashboard')}
              autoOpenPolicyId={autoOpenPolicyId}
              onModalClosed={() => setAutoOpenPolicyId(null)}
              onCheckout={(policy) => handleNavigate('checkout', policy)} // <--- Pass Checkout Handler
            />
          )}
          {currentView === 'checkout' && checkoutPolicy && (
            <CheckoutPage
              policy={checkoutPolicy}
              onBack={() => handleNavigate('find-insurance')}
              onPurchaseComplete={() => handleNavigate('my-policies')}
            />
          )}
          {currentView === 'my-policies' && (
            <MyPolicies
              onBack={() => handleNavigate('dashboard')}
            />
          )}
          {currentView === 'risk-profile' && (
            <RiskProfile
              onBack={() => handleNavigate('dashboard')}
              onComplete={() => handleNavigate('dashboard')}
            />
          )}
          {currentView === 'profile' && (
            <Profile
              user={user}
              onBack={() => handleNavigate('dashboard')}
              onLogout={handleLogout}
            />
          )}
          {currentView === 'activity-log' && (
            <ActivityLog onBack={() => handleNavigate('dashboard')} />
          )}
          {currentView === 'admin' && (
            <AdminDashboard onLogout={handleLogout} />
          )}
        </>
      )}
    </div>
  );
}

export default App;