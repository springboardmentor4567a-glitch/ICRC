import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./auth.css";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5001/api/admin/login", {
        email,
        password
      });

      // Store JWT token or a simple auth flag
      localStorage.setItem("adminAuth", res.data.token); // or true if you don’t use JWT yet
      localStorage.setItem("adminEmail", email); // store admin username/email for dashboard display

      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      alert(err.response?.data?.message || "Admin login failed");
    }
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Admin Panel</h2>
        <p>Insurance Management System</p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login to Admin Panel</button>
      </form>
    </div>
  );
}

export default AdminLogin;
