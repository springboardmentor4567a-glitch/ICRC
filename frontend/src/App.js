import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AvailablePlans from "./pages/AvailablePlans";
import ComparePolicies from "./pages/ComparePolicies";
import PolicyDetails from "./pages/PolicyDetails";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Recommendations from "./pages/Recommendations";
import FileClaim from "./pages/FileClaim";
import PremiumCalculator from "./pages/PremiumCalculator";
import UserPreferences from "./pages/UserPreferences";
import "./App.css";
import Layout from "./components/Layout";
import Profile from "./pages/Profile";
import MyClaims from "./pages/MyClaims";
import AdminDashboard from "./pages/AdminDashboard";
import AdminClaims from "./pages/AdminClaims";
import AdminFraud from "./pages/AdminFraud";
import AdminClaimDetails from "./pages/AdminClaimDetails";

// ── Role-based Route Protection
function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/home" element={<Home />} />
        
        {/* User-only Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRole="user">
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/plans" element={<Layout><AvailablePlans /></Layout>} />
        <Route path="/compare" element={<ComparePolicies />} />
        <Route path="/recommend" element={<Layout><Recommendations /></Layout>} />
        <Route path="/preferences" element={<Layout><UserPreferences /></Layout>} />
        <Route path="/claims" element={<Layout><FileClaim /></Layout>} />
        <Route path="/my-claims" element={<Layout><MyClaims /></Layout>} />
        <Route path="/calculator" element={<Layout><PremiumCalculator /></Layout>} />
        <Route path="/policy/:id" element={<Layout><PolicyDetails /></Layout>} />
        
        {/* Authenticated Shared Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } />
        
        {/* Admin-only Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRole="admin">
            <Layout><AdminDashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/claims" element={
          <ProtectedRoute allowedRole="admin">
            <Layout><AdminClaims /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/fraud" element={
          <ProtectedRoute allowedRole="admin">
            <Layout><AdminFraud /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/claims/:id" element={
          <ProtectedRoute allowedRole="admin">
            <Layout><AdminClaimDetails /></Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
