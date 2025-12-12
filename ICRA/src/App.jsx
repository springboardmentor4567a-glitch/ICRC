import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import Calculators from './Calculators'; // Import the new page

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); // State for navigation

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
    setCurrentView('dashboard'); // Reset view on login
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setCurrentView('dashboard'); // Reset view on logout
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
              onNavigate={(view) => setCurrentView(view)}
            />
          )}
          {currentView === 'calculators' && (
            <Calculators
              onBack={() => setCurrentView('dashboard')}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;