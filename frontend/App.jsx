import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PolicyAPI } from "./auth";
import { log } from "./logger";
import { AuthContext, useAuth } from "./authContext";

import Login from "./pages/Login";
import AdminLogin from "./pages/Adminlogin";
import Register from "./Register";
import Policies from "./Policies";
import Recommendations from "./Recommendations";
import SmartRecommendations from "./SmartRecommendations";

import Admin from "./Admin";
import TokenInspector from "./TokenInspector";
import CalculatorPage from "./CalculatorPage";
import PolicyDetails from "./PolicyDetails";
import Dashboard from "./Dashboard";
import RiskProfile from "./RiskProfile";

import ComparePolicies from "./ComparePolicies"; // ✅ ONLY compare page used
import Claims from "./Claims";
import ViewClaims from "./ViewClaims";

import PremiumCalculator from "./PremiumCalculator";
import InsuranceThemeDemo from "./InsuranceThemeDemo";
import AdminDashboard from "./AdminDashboard";
import AdminManagement from "./pages/AdminManagement";
import AdminClaims from "./AdminClaims";

/* ---------------- PROTECTED ROUTE ---------------- */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

/* ---------------- ADMIN PROTECTED ROUTE ---------------- */
const AdminProtectedRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;
  return children;
};

function AppContent() {
  const {
    user,
    register,
    login,
    logout,
    isAdmin,
    loading,
    getPolicies,
    refreshPolicies,
  } = useAuth();

  /* ---------------- POLICY FUNCTIONS ---------------- */
  const addPolicy = async (policy) => {
    try {
      const at = localStorage.getItem("access_token");
      const newPolicy = await PolicyAPI.addPolicy(at, policy);
      await refreshPolicies();
      return newPolicy;
    } catch (err) {
      log("error", "addPolicy failed", err);
      throw err;
    }
  };

  const updatePolicy = async (id, updates) => {
    try {
      const at = localStorage.getItem("access_token");
      const updated = await PolicyAPI.updatePolicy(at, id, updates);
      await refreshPolicies();
      return updated;
    } catch (err) {
      log("error", "updatePolicy failed", err);
      throw err;
    }
  };

  const deletePolicy = async (id) => {
    try {
      const at = localStorage.getItem("access_token");
      const remaining = await PolicyAPI.deletePolicy(at, id);
      return remaining;
    } catch (err) {
      log("error", "deletePolicy failed", err);
      throw err;
    }
  };

  const contextValue = {
    user,
    register,
    login,
    logout,
    isAdmin,
    loading,
    getPolicies,
    refreshPolicies,
    addPolicy,
    updatePolicy,
    deletePolicy,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/policies" element={<ProtectedRoute><Policies /></ProtectedRoute>} />
          <Route path="/policies/:id" element={<ProtectedRoute><PolicyDetails /></ProtectedRoute>} />
          <Route path="/risk-profile" element={<ProtectedRoute><RiskProfile /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
          <Route path="/smart-recommendations" element={<ProtectedRoute><SmartRecommendations /></ProtectedRoute>} />
          <Route path="/calculator/:policyId" element={<ProtectedRoute><CalculatorPage /></ProtectedRoute>} />
          <Route path="/premium-calculator" element={<ProtectedRoute><PremiumCalculator /></ProtectedRoute>} />

          {/* ✅ FIXED COMPARE ROUTE */}
          <Route path="/compare" element={<ProtectedRoute><ComparePolicies /></ProtectedRoute>} />

          <Route path="/claims" element={<ProtectedRoute><Claims /></ProtectedRoute>} />
          <Route path="/view-claims" element={<ProtectedRoute><ViewClaims /></ProtectedRoute>} />

          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/claims" element={<AdminProtectedRoute><AdminClaims /></AdminProtectedRoute>} />
          <Route path="/admin/management" element={<AdminProtectedRoute><AdminManagement /></AdminProtectedRoute>} />

          <Route path="/tokens" element={<ProtectedRoute><TokenInspector /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default function App() {
  return <AppContent />;
}
