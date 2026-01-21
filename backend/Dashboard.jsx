import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./authContext";
import "./dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();

  // Action cards data
  const actionCards = [
    {
      id: 1,
      title: "Browse Policies",
      description: "Explore available insurance policies with detailed information.",
      buttonText: "Browse Now",
      route: "/policies",
      icon: "📋"
    },
    {
      id: 2,
      title: "Compare Policies",
      description: "Compare multiple insurance policies side by side.",
      buttonText: "Select Policies",
      route: "/compare",
      icon: "⚖️"
    },
    {
      id: 3,
      title: "Premium Calculator",
      description: "Calculate insurance premiums based on your needs.",
      buttonText: "Calculate Now",
      route: "/premium-calculator",
      icon: "🧮"
    },
    {
      id: 4,
      title: "Risk Profile",
      description: "Update your insurance risk profile for better plans.",
      buttonText: "Update Profile",
      route: "/risk-profile",
      icon: "📊"
    },
    {
      id: 6,
      title: "Claims",
      description: "File or manage your insurance claims.",
      buttonText: "File Claim",
      route: "/claims",
      icon: "📄"
    },
    {
      id: 7,
      title: "View Claims",
      description: "View your submitted insurance claims.",
      buttonText: "View Claims",
      route: "/view-claims",
      icon: "👁️"
    }
  ];



  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Welcome back user!</h1>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Action Cards Grid */}
      <div className="dashboard-content">
        <div className="action-cards-grid">
          {actionCards.map((card) => (
            <div key={card.id} className="action-card">
              <div className="card-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <button onClick={() => navigate(card.route)}>
                {card.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
