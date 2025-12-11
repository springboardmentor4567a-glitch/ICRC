import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import InsurancePlans from "./pages/InsurancePlans";
import Recommendations from "./pages/Recommendations";
import FileClaim from "./pages/FileClaim";
import "./App.css";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/plans" element={<InsurancePlans />} />
        <Route path="/recommend" element={<Recommendations />} />
        <Route path="/claims" element={<FileClaim />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
