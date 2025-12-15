import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function Login() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!name || !password) {
      alert("All fields required");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/login", {
        name,
        password,
      });

      // Save tokens
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("userName", res.data.name);

      alert("Login successful!");

      // Go to welcome page
      navigate("/welcome");

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page-bg">
      <div className="form-card">
        <h2>Login</h2>

        <input
          className="input-box"
          placeholder="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="input-box"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn-main" onClick={handleLogin}>
          Login
        </button>

        <div className="bottom-text">
          Don't have an account?{" "}
          <span onClick={() => navigate("/")}>
            Register
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
