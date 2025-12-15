import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.detail || "Invalid email or password ❌");

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      navigate("/dashboard");
    } catch {
      setError("⚠ Server not reachable");
    }
  };

  return (
    <>
      {/* Heading */}
      <h1
        style={{
          textAlign: "center",
          marginTop: "40px",
          marginBottom: "20px",
          fontSize: "32px",
          fontWeight: "bold",
          color: "#6C63FF",
        }}
      >
        Insurance Comparison, Recommendation & Claim Assistant
      </h1>

      <div className="center-box">
        <form onSubmit={submit} className="form-card">
          <h2>Login</h2>

          {/* ✅ ERROR MESSAGE – FIXED POSITION */}
          {error && (
            <div className="msg-error" style={{ textAlign: "center" }}>
              {error}
            </div>
          )}

          <input
            className="input-box"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="input-box"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="form-actions">
            <button className="btn-purple">Login</button>
          </div>

          <p style={{ marginTop: "12px" }}>
            Don't have an account?{" "}
            <a href="/register" style={{ color: "#c77dff" }}>
              Register
            </a>
          </p>
        </form>
      </div>
    </>
  );
}
