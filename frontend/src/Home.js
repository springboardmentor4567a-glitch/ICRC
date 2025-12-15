import React from "react";

function Home({ loggedUser, setPage }) {
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setPage("login");
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2>Customer Dashboard</h2>
        <p style={styles.userText}>{loggedUser} — Logged in</p>
      </div>

      {/* Title */}
      <h1 style={styles.title}>Your Insurance Policies in one place</h1>

      <p style={styles.subtitle}>
        View your active coverage, manage your policies, and quickly file claims 
        from your personal insurance dashboard.
      </p>

      {/* Dashboard Grid */}
      <div style={styles.grid}>
        
        <div style={styles.card}>
          <h3>View Insurance Policies</h3>
          <p>See all life, health, home, and motor policies linked to your account.</p>
          <button style={styles.button}>View Policies</button>
        </div>

        <div style={styles.card}>
          <h3>Current Policy</h3>
          <p>Quickly review your active policy number, premium, and next due date.</p>
          <button style={styles.button}>View Current</button>
        </div>

        <div style={styles.card}>
          <h3>File a Claim</h3>
          <p>Start a new claim request for accidents, medical events, or damages.</p>
          <button style={styles.button}>File Claim</button>
        </div>

        <div style={styles.card}>
          <h3>Help & Support</h3>
          <p>Get support, FAQs, and help about your insurance policies.</p>
          <button style={styles.button}>Get Support</button>
        </div>

      </div>

      {/* Logout */}
      <button style={styles.logoutButton} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Home;

const styles = {
  container: {
    padding: "40px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  userText: {
    fontSize: "16px",
    color: "gray",
  },
  title: {
    marginTop: "10px",
    fontSize: "28px",
    fontWeight: "bold",
  },
  subtitle: {
    color: "#444",
    marginBottom: "30px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },
  card: {
    padding: "20px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
  },
  button: {
    marginTop: "10px",
    padding: "10px 20px",
    background: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  logoutButton: {
    marginTop: "30px",
    padding: "10px 25px",
    background: "red",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
