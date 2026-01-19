/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Keep empty when using Vite proxy
const BACKEND = ""; // /api/* → http://localhost:8000 (backend)

export default function Register() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (e) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim().toLowerCase());
  const validateMobile = (m) =>
    !m || /^\+?\d{7,15}$/.test(m.replace(/\s+/g, ""));

  const handleRegister = async (ev) => {
    ev.preventDefault();
    if (loading) return;

    // validations
    if (!name.trim() || !email.trim() || !pw) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Invalid email format");
      return;
    }
    if (!validateMobile(mobile)) {
      toast.error("Invalid mobile number (or leave blank)");
      return;
    }
    if (pw.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const userData = {
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim().toLowerCase(),
      username: email.trim().toLowerCase(),
      password: pw,
    };

    setLoading(true);

    try {
      const res = await fetch(`/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const text = await res.text();
      let data = {};

      // try parse JSON from backend
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Invalid JSON from backend:", text);
        toast.error("Server returned invalid response");
        setLoading(false);
        return;
      }

      if (res.ok) {
        // reset fields
        setName("");
        setMobile("");
        setEmail("");
        setPw("");

        navigate("/login");
      } else {
        toast.error(data.message || `Registration failed (${res.status})`);
      }
    } catch (err) {
      console.error("Network error:", err);
      toast.error("Cannot reach backend. Check server or proxy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "40px",
        backgroundColor: "#00897B",
      }}
    >
      <h1
        style={{
          color: "#ffffff",
          marginBottom: "30px",
          fontSize: "26px",
          fontWeight: "bold",
          textAlign: "center",
          maxWidth: "90%",
          lineHeight: "1.3",
        }}
      >
        Insurance Comparison, Recommendation & Claim Assistant
      </h1>

      <form
        onSubmit={handleRegister}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          padding: "28px",
          borderRadius: "12px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
        }}
        aria-label="Create account form"
      >
        <h2 style={{ marginBottom: "18px", textAlign: "center" }}>
          Create Account
        </h2>

        <label htmlFor="name">Full name</label>
        <input
          id="name"
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
        />

        <label style={{ marginTop: "12px" }} htmlFor="mobile">
          Mobile (optional)
        </label>
        <input
          id="mobile"
          style={styles.input}
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="+91 91234 56789"
          inputMode="tel"
        />

        <label style={{ marginTop: "12px" }} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          type="email"
          required
        />

        <label style={{ marginTop: "12px" }} htmlFor="password">
          Password
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="password"
            style={styles.input}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Create password"
            type={showPassword ? "text" : "password"}
            minLength={6}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              color: "#666",
              padding: "4px"
            }}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>

        <button
          type="submit"
          style={{
            ...styles.btn,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p style={{ textAlign: "center", marginTop: "12px" }}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginTop: "6px",
    boxSizing: "border-box",
  },
  btn: {
    marginTop: "18px",
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    background: "#006e66",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};
