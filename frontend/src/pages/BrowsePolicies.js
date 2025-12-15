import React, { useEffect, useState } from "react";

export default function BrowsePolicies() {
  const [policies, setPolicies] = useState([]);
  const [providers, setProviders] = useState([]);

  const [filterProvider, setFilterProvider] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortType, setSortType] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/providers")
      .then((res) => res.json())
      .then((data) => setProviders(data));
      
    fetch("http://127.0.0.1:8000/policies")
      .then((res) => res.json())
      .then((data) => setPolicies(data));
  }, []);

  const filtered = policies
    .filter((p) => (filterProvider ? p.provider_id === filterProvider : true))
    .filter((p) => (filterCategory ? p.category === filterCategory : true))
    .sort((a, b) => {
      if (sortType === "low") return a.premium - b.premium;
      if (sortType === "high") return b.premium - a.premium;
      return 0;
    });

  return (
    <div style={{ padding: "20px" }}>
      <h2 className="page-title">Browse Insurance Policies</h2>

      {/* Filters */}
      <div className="filters-box">
        <select value={filterProvider} onChange={(e) => setFilterProvider(e.target.value)}>
          <option value="">Filter by Provider</option>
          {providers.map((prov) => (
            <option key={prov.id} value={prov.id}>
              {prov.name}
            </option>
          ))}
        </select>

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">Filter by Category</option>
          <option value="Health">Health</option>
          <option value="Life">Life</option>
          <option value="Auto">Auto</option>
        </select>

        <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
          <option value="">Sort by Premium</option>
          <option value="low">Low → High</option>
          <option value="high">High → Low</option>
        </select>
      </div>

      {/* Policy Cards */}
      <div className="policies-grid">
        {filtered.map((p) => (
          <div key={p.id} className="policy-card">
            <h3>{p.name}</h3>
            <p><strong>Provider:</strong> {providers.find(x=>x.id===p.provider_id)?.name}</p>
            <p><strong>Category:</strong> {p.category}</p>
            <p><strong>Coverage:</strong> ₹{p.coverage}</p>
            <p><strong>Premium:</strong> ₹{p.premium}/year</p>
            <p><strong>Age Limit:</strong> {p.age_limit} years</p>
            <button className="btn-view">View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}
