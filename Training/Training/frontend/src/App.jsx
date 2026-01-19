// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import Login from "./pages/Login";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import PolicyComparison from "./pages/PolicyComparison";
import PremiumCalculator from "./pages/PremiumCalculator";
import Recommendations from "./pages/Recommendations";
import FileClaim from "./pages/FileClaim";
import TrackClaims from "./pages/TrackClaims";
import Chatbot from "./pages/Chatbot";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Footer from "./components/Footer";
import FloatingChatbotButton from "./components/FloatingChatbotButton";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Toast container - global, place near top-level */}
        <ToastContainer
          position="top-center"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
        />

        {/* Your app routes */}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/policy-comparison" element={<PolicyComparison />} />
            <Route path="/premium-calculator" element={<PremiumCalculator />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/file-claim" element={<FileClaim />} />
            <Route path="/track-claims" element={<TrackClaims />} />
            <Route path="/chatbot" element={<Chatbot />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* optional: catch-all route */}
            <Route path="*" element={<Login />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
        {/* Floating AI Chatbot launcher */}
        <FloatingChatbotButton />
      </div>
    </BrowserRouter>
  );
}
