import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name || !password) {
      alert("All fields required");
      return;
    }

    try {
      await axios.post("http://localhost:5000/register", { name, password });

      alert("Registration successful!");

      // Go to login page
      navigate("/login");

    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="page-bg">
      <div className="form-card">
        <h2>Create Account</h2>

        <input
          className="input-box"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="input-box"
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn-main" onClick={handleRegister}>
          Create Account
        </button>

        <div className="bottom-text">
          Already registered?{" "}
          <span onClick={() => navigate("/login")}>
            Sign in
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;
