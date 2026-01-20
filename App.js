import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Policies from "./pages/Policies";
import Compare from "./pages/Compare";
import Calculator from "./pages/Calculator";
import Recommendations from "./pages/Recommendations";
import FileClaim from "./pages/FileClaim";
import MyClaims from "./pages/MyClaims";
import AdminClaims from "./pages/AdminClaims";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* USER ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="user">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/policies"
          element={
            <ProtectedRoute role="user">
              <Policies />
            </ProtectedRoute>
          }
        />

        <Route
          path="/compare"
          element={
            <ProtectedRoute role="user">
              <Compare />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calculator"
          element={
            <ProtectedRoute role="user">
              <Calculator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recommendations"
          element={
            <ProtectedRoute role="user">
              <Recommendations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/file-claim"
          element={
            <ProtectedRoute role="user">
              <FileClaim />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-claims"
          element={
            <ProtectedRoute role="user">
              <MyClaims />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/claims"
          element={
            <ProtectedRoute role="admin">
              <AdminClaims />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
