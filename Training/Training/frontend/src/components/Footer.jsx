import React from "react";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>
        © 2025 Omendra Developer. All rights reserved.
      </p>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#1a1a2e",
    color: "#ffffff",
    textAlign: "center",
    padding: "15px 20px",
    marginTop: "auto",
    borderTop: "1px solid #667eea",
    fontSize: "14px",
  },
  text: {
    margin: 0,
    opacity: 0.8,
  },
};
