import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./policies.css";

export default function Policies() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [policySettings, setPolicySettings] = useState({});
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setPolicies([
      // Life Insurance Policies
      {
        id: 1,
        name: "Jeevan Anand",
        provider: "LIC",
        category: "Life",
        premium: 25000,
        coverage: 1000000,
      },
      {
        id: 2,
        name: "Smart Wealth Plan",
        provider: "Max Life",
        category: "Life",
        premium: 32000,
        coverage: 15000000,
      },
      {
        id: 3,
        name: "Whole Life Plan",
        provider: "SBI Life",
        category: "Life",
        premium: 30000,
        coverage: 12000000,
      },
      {
        id: 4,
        name: "Mera Term Plan",
        provider: "PNB MetLife",
        category: "Life",
        premium: 22000,
        coverage: 8000000,
      },

      // Health Insurance Policies
      {
        id: 5,
        name: "Health Shield",
        provider: "HDFC",
        category: "Health",
        premium: 15000,
        coverage: 1000000,
      },
      {
        id: 6,
        name: "Family Health Optima",
        provider: "Star Health",
        category: "Health",
        premium: 20000,
        coverage: 2000000,
      },
      {
        id: 7,
        name: "Health Guard",
        provider: "Bajaj Allianz",
        category: "Health",
        premium: 18000,
        coverage: 1500000,
      },
      {
        id: 8,
        name: "Complete Health Solution",
        provider: "Apollo Munich",
        category: "Health",
        premium: 25000,
        coverage: 2500000,
      },

      // Auto Insurance Policies
      {
        id: 9,
        name: "Motor Secure",
        provider: "ICICI",
        category: "Auto",
        premium: 12000,
        coverage: 500000,
      },
      {
        id: 10,
        name: "Car Protect Plus",
        provider: "Tata AIG",
        category: "Auto",
        premium: 18000,
        coverage: 1000000,
      },
      {
        id: 11,
        name: "Vehicle Secure",
        provider: "Reliance General",
        category: "Auto",
        premium: 15000,
        coverage: 900000,
      },

      // Travel Insurance Policies
      {
        id: 12,
        name: "World Explorer",
        provider: "ICICI Lombard",
        category: "Travel",
        premium: 8000,
        coverage: 500000,
      },
      {
        id: 13,
        name: "Global Journey",
        provider: "Bajaj Allianz",
        category: "Travel",
        premium: 12000,
        coverage: 1000000,
      },
      {
        id: 14,
        name: "Trip Care Plus",
        provider: "Star Health",
        category: "Travel",
        premium: 6000,
        coverage: 300000,
      },
      {
        id: 15,
        name: "International Shield",
        provider: "HDFC ERGO",
        category: "Travel",
        premium: 15000,
        coverage: 1500000,
      },
    ]);
  }, []);

  // Filter policies based on search term and selected category
  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || policy.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="policies-page">
      {/* HEADER - RIGHT TOP POSITION */}
      <div className="header-section">
        <div className="header-content">
          <div className="header-text">
            <h1 className="main-title">Insurance Policies</h1>
            <p className="subtitle">Find the perfect policy for your needs</p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="top-actions">
            <button onClick={() => window.history.back()} className="action-btn back-btn">
              <span className="btn-icon">←</span>
              Back
            </button>
            <button onClick={() => navigate("/dashboard")} className="action-btn dashboard-btn">
              <span className="btn-icon">🏠</span>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters">
        <input
          placeholder="Search policies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option>All Categories</option>
          <option>Life</option>
          <option>Health</option>
          <option>Auto</option>
          <option>Travel</option>
        </select>
      </div>

      {/* 🔥 GRID STARTS HERE 🔥 */}
      <div className="policies-grid">
        {filteredPolicies.map((policy) => (
          <div className="policy-card" key={policy.id}>
            <h3>{policy.name}</h3>
            <p className="provider">{policy.provider}</p>

            <label>Coverage Amount</label>
            <input
              type="number"
              min="100000"
              max="50000000"
              step="100000"
              value={policySettings[policy.id]?.coverage || policy.coverage}
              onChange={(e) => setPolicySettings(prev => ({
                ...prev,
                [policy.id]: { ...prev[policy.id], coverage: Number(e.target.value) }
              }))}
              placeholder="Enter coverage amount"
            />

            <label>Age</label>
            <input
              type="number"
              min="18"
              max="70"
              step="1"
              value={policySettings[policy.id]?.age || 30}
              onChange={(e) => setPolicySettings(prev => ({
                ...prev,
                [policy.id]: { ...prev[policy.id], age: Number(e.target.value) }
              }))}
              placeholder="Enter age"
            />

            <div className="premium-box">
              ₹{policy.premium.toLocaleString()}
              <span> / year</span>
            </div>

            <button className="primary-btn" onClick={() => {
              setSelectedPolicy(policy);
              setShowModal(true);
            }}>View Details</button>
          </div>
        ))}
      </div>

      {/* MODAL FOR POLICY DETAILS */}
      {showModal && selectedPolicy && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedPolicy.name}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="policy-info">
                <p><strong>Provider:</strong> {selectedPolicy.provider}</p>
                <p><strong>Category:</strong> {selectedPolicy.category}</p>
                <p><strong>Coverage:</strong> ₹{selectedPolicy.coverage.toLocaleString()}</p>
                <p><strong>Premium:</strong> ₹{selectedPolicy.premium.toLocaleString()} / year</p>
              </div>
              <div className="modal-actions">
                <button className="modal-btn primary" onClick={() => navigate(`/calculator/${selectedPolicy.id}`)}>
                  Calculate Premium
                </button>
                <button className="modal-btn secondary" onClick={() => navigate("/compare")}>
                  Compare Policies
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
