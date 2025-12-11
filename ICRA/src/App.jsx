import React, { useState } from 'react';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';

function App() {
  // Logic: If 'user' exists, show Dashboard. If not, show Login.
  const [user, setUser] = useState(null);

  return (
    <div className="w-full h-screen">
      {!user ? (
        // When login succeeds, we save the user data
        <LoginPage onLoginSuccess={(userData) => setUser(userData)} />
      ) : (
        // When logout is clicked, we clear the user data
        <Dashboard user={user} onLogout={() => setUser(null)} />
      )}
    </div>
  );
}

export default App;