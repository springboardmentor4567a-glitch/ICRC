import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './Authentication/AuthPage';
import Home from './Homepage/Home';
import ToastContainer from './Authentication/toast';
import './App.css';
import UserProfile from './Profile/UserProfile.jsx';
import FileClaim from './Claims/FileClaim.jsx';



// Lazy loaded components
const RiskProfile = React.lazy(() => import('../components/RiskProfile'));
const RecommendationList = React.lazy(() => import('./Recommendations/RecommendationList'));
const Policies = React.lazy(() => import('./Policies/policies')); 
const PremiumCalculator = React.lazy(() => import('./Policies/PremiumCalculator'));

const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  return !!token;
};

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const LoginPage = () => {
  return isAuthenticated() ? <Navigate to="/" replace /> : <AuthPage />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-hero">
          <h1 onClick={() => window.location.href='/'} style={{cursor: 'pointer', fontSize: '28px'}}>
            <strong>Insurance Comparison Recommendation & Claim Assistant</strong>
          </h1>
        </header>
        
        <main className="app-main">
          <Suspense fallback={<div style={{padding: '20px', textAlign: 'center'}}>Loading...</div>}>
            
            {/* ✅ ALL ROUTES MUST BE INSIDE THIS BLOCK */}
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route 
                path="/" 
                element={<PrivateRoute><Home /></PrivateRoute>} 
              />
              
              <Route 
                path="/policies" 
                element={<PrivateRoute><Policies /></PrivateRoute>} 
              />
              
              <Route 
                path="/calculator" 
                element={<PrivateRoute><PremiumCalculator /></PrivateRoute>} 
              />

              {/* ✅ MOVED THESE UP inside <Routes> */}
              {/* Also changed path="./RiskProfile" to "/risk-profile" */}
              <Route 
                path="/risk-profile" 
                element={<PrivateRoute><RiskProfile /></PrivateRoute>} 
              />
              
              <Route 
                path="/recommendations" 
                element={<PrivateRoute><RecommendationList /></PrivateRoute>} 
              />
             <Route path="/claims/new" element={<FileClaim />} />

            <Route path="/profile" element={<UserProfile />} />
              {/* Catch-all route must be last */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
          </Suspense>
        </main>
        
        <ToastContainer />
        {/* ❌ The orphan routes were here previously. They are gone now. */}
      </div>
    </Router>
  );
}

export default App;