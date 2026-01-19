/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
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

  const features = [
    {
      title: "Policy Comparison",
      description: "Compare insurance policies side by side",
      icon: "📊",
      path: "/policy-comparison",
      color: "#4CAF50"
    },
    {
      title: "Premium Calculator",
      description: "Calculate personalized insurance premiums",
      icon: "🧮",
      path: "/premium-calculator",
      color: "#2196F3"
    },
    {
      title: "Get Recommendations",
      description: "AI-powered policy recommendations",
      icon: "⭐",
      path: "/recommendations",
      color: "#FF9800"
    },
    {
      title: "File a Claim",
      description: "Submit insurance claims with documents",
      icon: "📝",
      path: "/file-claim",
      color: "#9C27B0"
    },
    {
      title: "Track Claims",
      description: "Real-time claim status tracking",
      icon: "📍",
      path: "/track-claims",
      color: "#F44336"
    }
  ];

  if (!user) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Insurance Comparison, Recommendation & Claim Assistant</h1>
          <p style={styles.subtitle}>Welcome , {user.name}!</p>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Feature Cards Grid */}
      <div style={styles.grid}>
        {features.map((feature, index) => (
          <div
            key={index}
            style={{ ...styles.card, borderLeft: `4px solid ${feature.color}` }}
            onClick={() => navigate(feature.path)}
          >
            <div style={styles.cardIcon}>{feature.icon}</div>
            <h3 style={styles.cardTitle}>{feature.title}</h3>
            <p style={styles.cardDescription}>{feature.description}</p>
            <button style={{ ...styles.cardButton, backgroundColor: feature.color }}>
              Access →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px"
  },
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00897B"
  },
  loadingText: {
    color: "#fff",
    fontSize: "18px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "20px 30px",
    borderRadius: "12px",
    marginBottom: "30px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  title: {
    margin: "0 0 5px 0",
    fontSize: "28px",
    color: "#00897B"
  },
  subtitle: {
    margin: 0,
    fontSize: "16px",
    color: "#666"
  },
  logoutBtn: {
    padding: "10px 24px",
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background-color 0.3s"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  card: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "transform 0.3s, box-shadow 0.3s",
    textAlign: "center"
  },
  cardIcon: {
    fontSize: "48px",
    marginBottom: "15px"
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 10px 0",
    color: "#333"
  },
  cardDescription: {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 20px 0",
    lineHeight: "1.5"
  },
  cardButton: {
    padding: "10px 20px",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    transition: "opacity 0.3s"
  }
};
