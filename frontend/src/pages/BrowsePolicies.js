import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "string" && value.trim() !== "") return "₹" + value;
  const num = Number(value);
  if (isNaN(num)) return "-";
  return "₹" + num.toLocaleString("en-IN");
}

export default function BrowsePolicies() {
  const [policies, setPolicies] = useState([]);
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState("");
  const [filterProvider, setFilterProvider] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortType, setSortType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/providers")
      .then((res) => res.json())
      .then((data) => setProviders(data))
      .catch(() => setProviders([]));
    fetch("http://127.0.0.1:8000/policies")
      .then((res) => res.json())
      .then((data) => setPolicies(data))
      .catch(() => setPolicies([]));
  }, []);

  const providerMap = {};
  providers.forEach((prov) => { providerMap[prov.id] = prov.name; });

  // Categories derived from actual data
  const categories = [...new Set(policies.map((p) => p.category).filter(Boolean))].sort();

  const filtered = policies
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.policy_number || "").toLowerCase().includes(q) ||
        (providerMap[p.provider_id] || "").toLowerCase().includes(q)
      );
    })
    .filter((p) => (filterProvider ? p.provider_id === Number(filterProvider) : true))
    .filter((p) => (filterCategory ? p.category === filterCategory : true))
    .sort((a, b) => {
      if (sortType === "low") return (a.premium || 0) - (b.premium || 0);
      if (sortType === "high") return (b.premium || 0) - (a.premium || 0);
      return 0;
    });

  return (
    <div style={{ padding: "20px" }}>
      <h2 className="page-title">Browse Insurance Policies</h2>

      <div className="browse-controls">
        <input
          className="browse-search"
          placeholder="Search by name, provider, category or policy code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select className="browse-select" value={filterProvider} onChange={(e) => setFilterProvider(e.target.value)}>
          <option value="">All Providers</option>
          {providers.map((prov) => (
            <option key={prov.id} value={prov.id}>{prov.name}</option>
          ))}
        </select>

        <select className="browse-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select className="browse-select" value={sortType} onChange={(e) => setSortType(e.target.value)}>
          <option value="">Sort by Premium</option>
          <option value="low">Low to High</option>
          <option value="high">High to Low</option>
        </select>
      </div>

      <p style={{ color: "#4b5563", marginBottom: "16px" }}>
        Showing <strong>{filtered.length}</strong> of {policies.length} policies
      </p>

      <div className="plans-grid">
        {filtered.map((p) => (
          <article key={p.id} className="policy-card policy-card-corporate">
            <div className="policy-card-top">
              <div className="provider-logo" aria-hidden="true">
                {(providerMap[p.provider_id] || "I").charAt(0).toUpperCase()}
              </div>
              <div>
                <h3>{p.name}</h3>
                <p className="provider-name">{providerMap[p.provider_id] || p.provider?.name || "Provider"}</p>
              </div>
            </div>

            <div className="policy-card-meta">
              <span className="policy-badge">{p.category}</span>
            </div>

            <div className="policy-summary-grid">
              <div><span>Coverage</span><strong>{formatCurrency(p.coverage)}</strong></div>
              <div><span>Annual Premium</span><strong>{formatCurrency(p.premium)}</strong></div>
            </div>

            <div className="policy-code-row">
              <span>Policy Code</span>
              <span className="policy-code-value">{p.policy_number || "-"}</span>
            </div>

            <div className="policy-actions">
              <button className="btn-purple" onClick={() => navigate(`/policy/${p.id}`)}>View Details</button>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "#6b7280", marginTop: "40px" }}>No policies found.</p>
      )}
    </div>
  );
}
