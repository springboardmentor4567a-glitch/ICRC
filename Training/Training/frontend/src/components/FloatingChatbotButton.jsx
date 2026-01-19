import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function FloatingChatbotButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on chatbot page itself to avoid duplicate entry
  const isChatbotPage = location.pathname === "/chatbot";
  if (isChatbotPage) return null;

  return (
    <button
      onClick={() => navigate("/chatbot")}
      title="Chat with AI assistant"
      style={styles.button}
    >
      🤖
    </button>
  );
}

const styles = {
  button: {
    position: "fixed",
    bottom: "22px",
    right: "22px",
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, #005a9e, #00897B)",
    color: "#fff",
    fontSize: "26px",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
    zIndex: 999,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
};

styles.button["&:hover"] = {
  transform: "translateY(-2px)",
  boxShadow: "0 14px 30px rgba(0,0,0,0.28)",
};
