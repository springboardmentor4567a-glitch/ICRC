import React, { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../utils/api";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I’m your insurance assistant. Ask me about claims, policies, or premiums." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed) return;
    setLoading(true);

    const userMsg = { sender: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      // Try LLM endpoint first
      let res = await fetch(`${API_BASE_URL}/api/chatbot/llm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed })
      });

      // If LLM not configured/fails, fallback to rule-based
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/api/chatbot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed })
        });
      }

      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      
      if (!data.reply) {
        throw new Error("No reply from chatbot");
      }
      
      const botMsg = { sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botMsg]);

      if (data.suggestions?.length) {
        const suggestionMsg = {
          sender: "bot",
          text: "Try one of these questions:",
          suggestions: data.suggestions.slice(0, 3)
        };
        setMessages((prev) => [...prev, suggestionMsg]);
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      const errorMsg = { 
        sender: "bot", 
        text: `Sorry, I encountered an error. Please try again. (${err.message})` 
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>🤖 AI Chatbot Assistant</h2>
          <p style={{ margin: "6px 0 0", opacity: 0.8 }}>Ask about claims, policies, premiums, or status.</p>
        </div>

        <div style={styles.chatBox}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ ...styles.messageRow, justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  ...styles.message,
                  backgroundColor: msg.sender === "user" ? "#00796B" : "#f1f5f9",
                  color: msg.sender === "user" ? "#fff" : "#0f172a"
                }}
              >
                <div style={styles.sender}>{msg.sender === "user" ? "You" : "Assistant"}</div>
                <div>{msg.text}</div>
                {msg.suggestions && (
                  <div style={styles.suggestions}>
                    {msg.suggestions.map((s, i) => (
                      <button key={i} style={styles.suggestionBtn} onClick={() => sendMessage(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form style={styles.inputRow} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
          <button type="submit" style={styles.sendBtn} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #00897B 0%, #015C53 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px",
  },
  card: {
    width: "100%",
    maxWidth: "820px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 12px 40px rgba(0,0,0,0.16)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    padding: "18px 20px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  chatBox: {
    padding: "16px",
    height: "520px",
    overflowY: "auto",
    background: "#f1f5f9",
  },
  messageRow: {
    display: "flex",
    marginBottom: "10px",
  },
  message: {
    maxWidth: "80%",
    padding: "10px 12px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
    fontSize: "14px",
    lineHeight: 1.4,
  },
  sender: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    opacity: 0.7,
    marginBottom: "6px",
  },
  suggestions: {
    marginTop: "8px",
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  suggestionBtn: {
    background: "#fff",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "12px",
  },
  inputRow: {
    display: "flex",
    gap: "10px",
    padding: "14px 16px",
    borderTop: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
  },
  sendBtn: {
    background: "#00796B",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0 18px",
    cursor: "pointer",
    fontWeight: 600,
  },
};
