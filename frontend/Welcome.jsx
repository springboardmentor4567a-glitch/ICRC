import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './App';

export default function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <h1>Welcome to ICRCA</h1>
        <p>Insurance Comparison Recommendation and Claim Assistance</p>
        <p>Hello, {user?.name}!</p>
        <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        <button onClick={() => navigate('/catalog')}>Go to Catalog</button>
      </div>
    </div>
  );
}
