import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // STATIC ADMIN CREDENTIALS
    if (email === "admin@gmail.com" && password === "admin123") {
      localStorage.setItem("adminAuth", "true");
      navigate("/dashboard");
    } else {
      alert("Invalid Admin Credentials");
    }
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Admin Panel</h2>
        <p>Insurance Management System</p>

        <input placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

        <button>Login to Admin Panel</button>
      </form>
    </div>
  );
}

export default AdminLogin;
