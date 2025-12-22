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
import UserPreferences from "./pages/UserPreferences";
import "./App.css";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/plans" element={<Layout><AvailablePlans /></Layout>} />
        <Route path="/compare" element={<ComparePolicies />} />
        <Route path="/recommend" element={<Layout><Recommendations /></Layout>} />
        <Route path="/preferences" element={<Layout><UserPreferences /></Layout>} />
        <Route path="/claims" element={<Layout><FileClaim /></Layout>} />
        <Route path="/calculator" element={<Layout><PremiumCalculator /></Layout>} />
        <Route path="/policy/:id" element={<Layout><PolicyDetails /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
