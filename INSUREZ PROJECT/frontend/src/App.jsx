import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/policies" element={<BrowsePolicies />} />
        <Route path="/calculator" element={<PremiumCalculator />} />
        <Route path="/compare" element={<ComparePolicies />} />
        <Route path="/recommendations" element={<SmartRecommendations />} />
        <Route path="/savings" element={<SaveMoney />} />
        <Route path="/claims" element={<CompleteFileClaimsWizard />} />
        <Route path="/claim-status" element={<ClaimStatusTracking />} />
      </Routes>
    </Router>
  );
}

export default App;
