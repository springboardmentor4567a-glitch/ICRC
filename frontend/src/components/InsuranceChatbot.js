import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import "./InsuranceChatbot.css";

const SUGGESTED_QUESTIONS = [
  "Find a suitable policy",
  "Compare insurance plans",
  "How do I file a claim?",
  "What documents are required for a claim?",
  "How does premium calculation work?",
  "How do recommendations work?",
];

export default function InsuranceChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();
  const role = localStorage.getItem("role");
  const messagesEndRef = useRef(null);

  // ── Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // ── Initialize chat with welcome message if empty
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hello! I'm the ICRC Insurance Assistant. I can help you understand policies, claims, recommendations, premium calculations and other insurance-related questions.",
          isWelcome: true
        }
      ]);
    }
  }, [isOpen, messages]);

  // ── Check if rendering is forbidden (admin contexts)
  const isAdminPath = location.pathname.startsWith("/admin");
  if (role === "admin" || isAdminPath) {
    return null;
  }

  const handleSend = async (textToSend) => {
    const text = textToSend || input.strip ? textToSend : input.trim();
    if (!text) return;

    // Add user message
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      } else {
        throw new Error("Failed response");
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm unable to connect to the ICRC Assistant right now. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSend();
    }
  };

  // Helper function to render text with clickable links
  const renderMessageContent = (content) => {
    // Look for markdown-like links [Link Text](/path)
    const parts = content.split(/(\[[^\]]+\]\([^\)]+\))/g);
    return parts.map((part, index) => {
      const match = part.match(/\[([^\]]+)\]\(([^\)]+)\)/);
      if (match) {
        const [, linkText, path] = match;
        return (
          <Link key={index} to={path} className="chat-inline-link" onClick={() => setIsOpen(false)}>
            {linkText}
          </Link>
        );
      }
      // Handle bold formatting **bold**
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, bIndex) => {
        const bMatch = bPart.match(/\*\*([^*]+)\*\*/);
        if (bMatch) {
          return <strong key={`${index}-${bIndex}`}>{bMatch[1]}</strong>;
        }
        return bPart;
      });
    });
  };

  return (
    <>
      {/* ── FLOATING ICON (Default State) ── */}
      {!isOpen && (
        <button 
          className="chat-floating-icon" 
          onClick={() => setIsOpen(true)}
          aria-label="Open ICRC Insurance Assistant"
          title="Open ICRC Insurance Assistant"
        >
          💬
        </button>
      )}

      {/* ── CHAT PANEL ── */}
      {isOpen && (
        <div className="chat-panel-container fade-in">
          
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <span className="chat-header-title">ICRC Insurance Assistant</span>
              <span className="chat-header-desc">Insurance support and policy guidance</span>
            </div>
            <button 
              className="chat-close-btn" 
              onClick={() => setIsOpen(false)}
              aria-label="Close Assistant"
            >
              &times;
            </button>
          </div>

          {/* Messages Body */}
          <div className="chat-body">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message-row ${msg.role}`}>
                {msg.role === "assistant" && <span className="chat-avatar-mini">💼</span>}
                <div className={`chat-bubble ${msg.role}`}>
                  <p>{renderMessageContent(msg.content)}</p>
                  
                  {/* Suggested questions (only on the welcome message) */}
                  {msg.isWelcome && messages.length === 1 && (
                    <div className="chat-suggestions">
                      {SUGGESTED_QUESTIONS.map((q, qidx) => (
                        <button 
                          key={qidx} 
                          className="chat-suggestion-btn"
                          onClick={() => handleSend(q)}
                          disabled={loading}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {loading && (
              <div className="chat-message-row assistant">
                <span className="chat-avatar-mini">💼</span>
                <div className="chat-bubble assistant typing">
                  <span className="chat-typing-text">ICRC Assistant is typing...</span>
                  <div className="chat-typing-dots">
                    <span/><span/><span/>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="chat-footer">
            <input 
              type="text" 
              className="chat-input-field"
              placeholder="Ask about insurance, policies or claims..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              aria-label="Chat input field"
            />
            <button 
              className="chat-send-btn" 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>

        </div>
      )}
    </>
  );
}
