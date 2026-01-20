import React, { useState } from "react";
import "../styles/policies.css";
import { useNavigate } from "react-router-dom";

const Policies = () => {
  const navigate = useNavigate();

  const policies = [
  {
    name: "Health Secure Plus",
    coverage: "₹5,00,000",
    premium: "₹7,800 / year",
    details: "Ideal for individuals. Covers hospitalization, day-care procedures and emergency treatment.",
    risk: "Low",
    category: "Health",
  },
  {
    name: "Life Shield Plan",
    coverage: "₹10,00,000",
    premium: "₹9,500 / year",
    details: "Long-term protection with life coverage and accidental benefits.",
    risk: "Medium",
    category: "Life",
  },
  {
    name: "Family Health Pro",
    coverage: "₹8,00,000",
    premium: "₹11,200 / year",
    details: "Complete family coverage including maternity and child care.",
    risk: "Low",
    category: "Health",
  },
  {
    name: "Budget Care",
    coverage: "₹4,00,000",
    premium: "₹12,500 / year",
    details: "Affordable plan for basic medical needs with limited coverage.",
    risk: "High",
    category: "Health",
  },
  {
    name: "Smart Health Cover",
    coverage: "₹6,00,000",
    premium: "₹6,500 / year",
    details: "Smart premium savings with cashless hospital access.",
    risk: "Low",
    category: "Health",
  },
  {
    name: "Premium Protect Plus",
    coverage: "₹12,00,000",
    premium: "₹14,800 / year",
    details: "Premium plan with international coverage and wellness benefits.",
    risk: "Medium",
    category: "Auto",
  },
  {
    name: "Senior Secure Plan",
    coverage: "₹7,00,000",
    premium: "₹10,900 / year",
    details: "Designed for senior citizens with chronic illness coverage.",
    risk: "High",
    category: "Health",
  },
  {
    name: "Young Shield Policy",
    coverage: "₹3,00,000",
    premium: "₹4,200 / year",
    details: "Entry-level plan for young professionals and students.",
    risk: "Low",
    category: "Life",
  },
];

  /* ===== STATES ===== */
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
const [selectedCategory, setSelectedCategory] = useState("All");
const filteredPolicies = policies.filter((policy) => {
  const matchesSearch = policy.name
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesCategory =
    selectedCategory === "All" ||
    policy.category === selectedCategory;

  return matchesSearch && matchesCategory;
});


  return (
    <div className="policies-page">
      {/* ===== BACK BUTTON ===== */}
      <button
  onClick={() => navigate("/dashboard")}
  style={{
    position: "absolute",
    top: "20px",
    left: "20px",
    padding: "6px 12px",          // ⭐ smaller padding
    fontSize: "13px",
    borderRadius: "18px",
    border: "none",
    background: "#34d399",
    color: "#fff",
    cursor: "pointer",
    width: "auto",                // ⭐ prevents stretching
    maxWidth: "fit-content",      // ⭐ key line
    display: "inline-flex",       // ⭐ not full-width
    alignItems: "center",
    gap: "6px",
    whiteSpace: "nowrap",         // ⭐ no wrapping
  }}
>
  ← Back
</button>
      {/* ===== BANNER IMAGE ===== */}
      <div className="policies-image">
        <img
          src="https://i.pinimg.com/736x/ab/3f/0c/ab3f0c9ea527f4af577c22d1bc3b006f.jpg"
          alt="Insurance Banner"
        />
      </div>

      {/* ===== TITLE ===== */}
      <h2 className="policies-title">Available Insurance Policies</h2>
<div className="policy-categories">
  {["All", "Health", "Life", "Auto", "Vehicle"].map((cat) => (
    <button
      key={cat}
      className={`category-btn ${
        selectedCategory === cat ? "active" : ""
      }`}
      onClick={() => setSelectedCategory(cat)}
    >
      {cat}
    </button>
  ))}
</div>

      {/* ===== SEARCH BAR ===== */}
      <div className="policy-search">
        <input
          type="text"
          placeholder="Search insurance policy..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ===== POLICY CARDS ===== */}
      <div className="policies-container">
        {filteredPolicies.map((policy, index) => (
          <div className="policy-card" key={index}>
            <h3 className="policy-name">{policy.name}</h3>

            <p>
              <strong>Coverage:</strong> {policy.coverage}
            </p>
            <p>
              <strong>Premium:</strong> {policy.premium}
            </p>

            <button
              className="policy-btn"
              onClick={() => setSelectedPolicy(policy)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* ===== DETAILS MODAL ===== */}
      {selectedPolicy && (
        <div className="policy-modal">
          <div className="modal-content">
            <h3>{selectedPolicy.name}</h3>
            <p><strong>Coverage:</strong> {selectedPolicy.coverage}</p>
            <p><strong>Premium:</strong> {selectedPolicy.premium}</p>
            <p><strong>Risk Profile:</strong> {selectedPolicy.risk}</p>
            <p>{selectedPolicy.details}</p>

            <button
              className="close-btn"
              onClick={() => setSelectedPolicy(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;

