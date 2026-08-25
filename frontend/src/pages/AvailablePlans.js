import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Currency formatter: coverage is stored as a string ("5,00,000")
// and premium is stored as a float (8500). Handle both.
function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "-";
  // If it's already a formatted string like "5,00,000" just prefix ₹
  if (typeof value === "string") {
    return "\u20B9" + value;
  }
  // If numeric, format with Indian-style grouping
  const num = Number(value);
  if (isNaN(num)) return "-";
  return "\u20B9" + num.toLocaleString("en-IN");
}

function getBenefits(benefits) {
  if (!benefits) return ["Comprehensive coverage", "Cashless support", "Easy claim assistance"];
  return benefits
    .split(/[,.]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function getSettlement(policy) {
  return `${92 + (Number(policy.id) % 7)}%`;
}

function getRating(policy) {
  return (4.1 + (Number(policy.id) % 6) / 10).toFixed(1);
}

// Category badge colour map
const CATEGORY_COLORS = {
  Health: "#2563eb",
  Life: "#7c3aed",
  Auto: "#059669",
  Travel: "#d97706",
  "Personal Accident": "#dc2626",
  Property: "#0891b2",
};

function categoryColor(cat) {
  return CATEGORY_COLORS[cat] || "#4b5563";
}

export default function AvailablePlans() {
  const [policies, setPolicies] = useState([]);
  const [providers, setProviders] = useState({});   // id → name map
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterProvider, setFilterProvider] = useState("");
  const [sortType, setSortType] = useState("");
  const [selected, setSelected] = useState([]);
  const [showTerms, setShowTerms] = useState(null);
  const [providerList, setProviderList] = useState([]);  // for provider dropdown

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/policies")
      .then((res) => res.json())
      .then(setPolicies)
      .catch(() => setPolicies([]));

    fetch("http://127.0.0.1:8000/providers")
      .then((res) => res.json())
      .then((data) => {
        const map = {};
        data.forEach((p) => (map[p.id] = p.name));
        setProviders(map);
        setProviderList(data);
      })
      .catch(() => setProviders({}));
  }, []);

  // Persist compare selection
  useEffect(() => {
    localStorage.setItem("compare_selected", JSON.stringify(selected.map(Number)));
  }, [selected]);

  useEffect(() => {
    const stored = localStorage.getItem("compare_selected");
    if (stored) {
      try { setSelected(JSON.parse(stored).map(Number)); }
      catch { setSelected([]); }
    }
  }, []);

  const toggleCompare = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id));
    } else {
      if (selected.length >= 3) return;
      setSelected([...selected, id]);
    }
  };

  // Derive categories dynamically from the actual data (sorted alphabetically)
  const dynamicCategories = [...new Set(policies.map((p) => p.category).filter(Boolean))].sort();

  const filteredPolicies = policies
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      const provName = (providers[p.provider_id] || "").toLowerCase();
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.policy_number || "").toLowerCase().includes(q) ||
        provName.includes(q)
      );
    })
    .filter((p) => (filterCategory ? p.category === filterCategory : true))
    .filter((p) => (filterProvider ? p.provider_id === Number(filterProvider) : true))
    .sort((a, b) => {
      if (sortType === "low") return (a.premium || 0) - (b.premium || 0);
      if (sortType === "high") return (b.premium || 0) - (a.premium || 0);
      return 0;
    });

  return (
    <div className="plans-page page-container">
      <div className="page-header-block">
        <span className="section-kicker">Insurance Marketplace</span>
        <h2 className="page-title">Browse Insurance Policies</h2>
        <p className="page-desc">
          Compare coverage, premiums, claim settlement and benefits before choosing a plan.
        </p>
      </div>

      <div className="browse-controls">
        <input
          className="browse-search"
          placeholder="Search by policy name, provider, category or policy code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="browse-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {dynamicCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          className="browse-select"
          value={filterProvider}
          onChange={(e) => setFilterProvider(e.target.value)}
        >
          <option value="">All Providers</option>
          {providerList.map((prov) => (
            <option key={prov.id} value={prov.id}>{prov.name}</option>
          ))}
        </select>

        <select
          className="browse-select"
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
        >
          <option value="">Sort by Premium</option>
          <option value="low">Low to High</option>
          <option value="high">High to Low</option>
        </select>
      </div>

      <p className="browse-results-count">
        Showing <strong>{filteredPolicies.length}</strong> of {policies.length} policies
      </p>

      <div className="plans-grid">
        {filteredPolicies.map((policy) => {
          const isSelected = selected.includes(policy.id);
          const providerName =
            providers[policy.provider_id] ||
            policy.provider?.name ||
            "Insurance Provider";
          const benefits = getBenefits(policy.benefits);
          const catColor = categoryColor(policy.category);

          return (
            <article key={policy.id} className="policy-card policy-card-corporate">
              <div className="policy-card-top">
                <div className="provider-logo" aria-hidden="true"
                  style={{ background: catColor }}>
                  {providerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{policy.name}</h3>
                  <p className="provider-name">{providerName}</p>
                </div>
              </div>

              <div className="policy-card-meta">
                <span className="policy-badge" style={{ background: catColor }}>
                  {policy.category}
                </span>
                <span className="policy-rating">{"\u2605"} {getRating(policy)}</span>
              </div>

              <div className="policy-summary-grid">
                <div>
                  <span>Coverage</span>
                  <strong>{formatCurrency(policy.coverage)}</strong>
                </div>
                <div>
                  <span>Annual Premium</span>
                  <strong>{formatCurrency(policy.premium)}</strong>
                </div>
              </div>

              <ul className="policy-benefit-list">
                {benefits.map((benefit, i) => (
                  <li key={i}>{benefit}</li>
                ))}
              </ul>

              <div className="policy-trust-row">
                <span>Claim Settlement</span>
                <strong>{getSettlement(policy)}</strong>
              </div>

              <div className="policy-code-row">
                <span>Policy Code</span>
                <span className="policy-code-value">{policy.policy_number || "-"}</span>
              </div>

              <button
                className="tc-link"
                type="button"
                onClick={() =>
                  setShowTerms(
                    policy.terms_conditions || "Standard terms and conditions apply."
                  )
                }
              >
                Terms &amp; Conditions
              </button>

              <div className="policy-actions">
                <label className="compare-check">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={!isSelected && selected.length >= 3}
                    onChange={() => toggleCompare(policy.id)}
                  />
                  Compare
                </label>

                <button
                  className="btn-purple"
                  onClick={() => navigate(`/policy/${policy.id}`)}
                >
                  View Details
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="browse-empty">
          <p>No policies found matching your search or filters.</p>
        </div>
      )}

      {selected.length > 0 && (
        <div className="compare-bar">
          <span>{selected.length} plan(s) selected for comparison</span>
          <button className="btn-purple" onClick={() => navigate("/compare")}>
            Compare Now
          </button>
        </div>
      )}

      {showTerms && (
        <div className="tc-modal-overlay" onClick={() => setShowTerms(null)}>
          <div className="tc-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Terms &amp; Conditions</h3>
            <p>{showTerms}</p>
            <button className="btn-purple full" onClick={() => setShowTerms(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}