/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Welcome() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data:", e);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#00897B",
        }}
      >
        <div style={{ color: "#fff", fontSize: "18px" }}>Loading...</div>
      </div>
    );
  }

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
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "18px" }}>Welcome, {user.name}!</h2>
        
        <p style={{ color: "#666", marginBottom: "25px", fontSize: "15px" }}>
          Access our comprehensive insurance platform with policy comparison, 
          premium calculators, personalized recommendations, and claim management.
        </p>

        <button
          style={{
            ...styles.btn,
            backgroundColor: "#00897B",
            marginBottom: "12px"
          }}
          onClick={goToDashboard}
        >
          Go to Dashboard
        </button>

        <button
          style={{
            ...styles.btn,
            backgroundColor: "#f44336"
          }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  btn: {
    width: "100%",
    marginTop: "10px",
    padding: "14px",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.3s"
  }
};
