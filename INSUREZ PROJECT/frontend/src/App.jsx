import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import BrowsePolicies from './pages/BrowsePolicies';
import PremiumCalculator from './pages/PremiumCalculator';
import ComparePolicies from './pages/ComparePolicies';
import SmartRecommendations from './pages/SmartRecommendations';
import SaveMoney from './pages/SaveMoney';
import CompleteFileClaimsWizard from './pages/CompleteFileClaimsWizard';
import ClaimStatusTracking from './pages/ClaimStatusTracking';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="user">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/policies" element={
          <ProtectedRoute>
            <BrowsePolicies />
          </ProtectedRoute>
        } />
        <Route path="/calculator" element={
          <ProtectedRoute>
            <PremiumCalculator />
          </ProtectedRoute>
        } />
        <Route path="/compare" element={
          <ProtectedRoute>
            <ComparePolicies />
          </ProtectedRoute>
        } />
        <Route path="/recommendations" element={
          <ProtectedRoute>
            <SmartRecommendations />
          </ProtectedRoute>
        } />
        <Route path="/savings" element={
          <ProtectedRoute>
            <SaveMoney />
          </ProtectedRoute>
        } />
        <Route path="/claims" element={
          <ProtectedRoute>
            <CompleteFileClaimsWizard />
          </ProtectedRoute>
        } />
        <Route path="/claim-status" element={
          <ProtectedRoute>
            <ClaimStatusTracking />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
