import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  ClipboardCheck,
  FileText,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      icon: FileText,
      title: "Insurance Plans",
      desc: "Browse policies and compare coverage, premium, and benefits.",
      action: "View Plans",
      route: "/plans",
    },
    {
      icon: Sparkles,
      title: "Recommendations",
      desc: "Get policy suggestions based on your saved preference profile.",
      action: "Get Recommendations",
      route: "/preferences",
    },
    {
      icon: Calculator,
      title: "Premium Calculator",
      desc: "Estimate yearly or monthly premiums using risk factors.",
      action: "Calculate",
      route: "/calculator",
    },
    {
      icon: ClipboardCheck,
      title: "Claims",
      desc: "Submit a claim and upload supporting documents securely.",
      action: "File Claim",
      route: "/claims",
    },
    {
      icon: UserRound,
      title: "Profile",
      desc: "Review personal information, coverage needs, and preferences.",
      action: "Open Profile",
      route: "/profile",
    },
  ];

  return (
    <div className="dashboard-container">
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-eyebrow">Customer Dashboard</span>
          <h1>Welcome to Insurance Control Center</h1>
          <p>Manage policies, recommendations, calculators, and claims in one place.</p>
        </div>
        <div className="dashboard-hero-icon">
          <ShieldCheck size={34} />
        </div>
      </section>

      <section className="dashboard-stats" aria-label="Quick statistics">
        <div className="dashboard-stat-card">
          <span>Available Plans</span>
          <strong>25+</strong>
          <p>Across health and life categories</p>
        </div>
        <div className="dashboard-stat-card">
          <span>Claim Tracking</span>
          <strong>24/7</strong>
          <p>Status visibility after submission</p>
        </div>
        <div className="dashboard-stat-card">
          <span>Recommendation</span>
          <strong>Profile Based</strong>
          <p>Uses preferences and risk factors</p>
        </div>
      </section>

      <section className="dashboard-section-head">
        <div>
          <h2>Services</h2>
          <p>Select an action to continue.</p>
        </div>
        <HeartHandshake size={28} />
      </section>

      <section className="dashboard-grid">
        {cards.map(({ icon: Icon, title, desc, action, route }) => (
          <div className="dashboard-card" key={title} onClick={() => navigate(route)}>
            <div className="card-icon">
              <Icon size={24} />
            </div>
            <h3 className="card-title">{title}</h3>
            <p className="card-desc">{desc}</p>
            <button className="card-btn">{action}</button>
          </div>
        ))}
      </section>
    </div>
  );
}