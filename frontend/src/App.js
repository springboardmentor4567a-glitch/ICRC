import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* ✅ FIXED */}
        <Route path="/plans" element={<AvailablePlans />} />

        <Route path="/compare" element={<ComparePolicies />} />
        <Route path="/policy/:id" element={<PolicyDetails />} />
        <Route path="/recommend" element={<Recommendations />} />
        <Route path="/claims" element={<FileClaim />} />
        <Route path="/calculator" element={<PremiumCalculator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
