import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error("Signup failed");
      }

      navigate("/login");
    } catch (err) {
      console.error("Signup failed");
    }
  };

  return (
    <div style={styles.container}>
      {/* 🔹 MAIN PAGE HEADING */}
      <h1 style={styles.mainHeading}>
        Insurance Comparison, Recommendation & Claim Assistant
      </h1>

      <div style={styles.card}>
        {/* 🔹 CARD TITLE */}
        <h2 style={styles.heading}>Create Account</h2>
        <p style={styles.subHeading}>Join ICRCA today</p>

        <input
          style={styles.input}
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={handleSignup}>
          Signup
        </button>

        <p style={styles.text}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #b9c6ff, #e0e7ff)",
  },

  mainHeading: {
    marginBottom: "30px",
    color: "#1e3a8a",
    fontSize: "28px",
    fontWeight: "700",
    textAlign: "center",
  },

  card: {
    width: "360px",
    background: "#fff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
  },

  heading: {
    textAlign: "center",
    marginBottom: "6px",
    color: "#2563eb",
    fontSize: "20px",
    fontWeight: "600",
  },

  subHeading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#6b7280",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },

  button: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#7c7cff",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },

  text: {
    marginTop: "15px",
    textAlign: "center",
    fontSize: "14px",
  },

  link: {
    color: "#7c7cff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
