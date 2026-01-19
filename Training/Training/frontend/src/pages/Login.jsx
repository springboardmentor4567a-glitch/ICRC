/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BACKEND = ""; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (loading) return; // prevent double submit
    const trimmedEmail = (email || "").trim().toLowerCase();
    if (!trimmedEmail || !pw) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const url = `${BACKEND}/api/login`;
      console.log("Sending login request to:", url);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail, password: pw }),
      });

      console.log("Login response status:", res.status, res.statusText);
      const ct = res.headers.get("content-type") || "";

      let data = null;
      if (ct.includes("application/json")) {
        try {
          data = await res.json();
        } catch (parseErr) {
          console.error("Failed to parse JSON:", parseErr);
          const raw = await res.text().catch(() => "");
          console.error("Raw response text:", raw);
          toast.error("Invalid JSON from backend (see console)");
          setLoading(false);
          return;
        }
      } else if (res.status === 204) {
        data = { success: true, message: "Login OK (no content)" };
      } else {
        const raw = await res.text().catch(() => "");
        console.error("Non-JSON response from backend:", raw);
        toast.error("Backend returned non-JSON response (check console)");
        setLoading(false);
        return;
      }

      if (res.ok && (data?.success === true || data?.token || data?.access_token)) {
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        if (data.token) localStorage.setItem("token", data.token);
        if (data.access_token) localStorage.setItem("token", data.access_token);
        if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
        if (data.expires_in) localStorage.setItem("token_expires_at", Date.now() + (data.expires_in * 1000));

        navigate("/welcome");
        setLoading(false);
        return;
      }

      console.error("Login failed:", res.status, data);
      toast.error(data?.message || "Invalid login credentials");
    } catch (err) {
      console.error("Network or JS error during login:", err);
      toast.error("Backend connection error. Check server or network.");
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

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          padding: "28px",
          borderRadius: "12px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "18px" }}>Login</h2>

        <label>Email</label>
        <input
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          type="email"
        />

        <label style={{ marginTop: "12px" }}>Password</label>
        <div style={{ position: "relative" }}>
          <input
            style={styles.input}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Enter password"
            type={showPassword ? "text" : "password"}
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
          style={{
            ...styles.btn,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center", marginTop: "12px" }}>
          Don't have an account? <Link to="/register">Signup</Link>
        </p>
      </div>
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
    paddingRight: "45px",
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
    fontSize: "16px",
  },
};
