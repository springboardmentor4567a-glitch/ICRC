import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function currency(x) {
  if (x === null || x === undefined) return "-";
  return "₹" + Number(x).toLocaleString();
}

export default function AvailablePlans() {
  const [policies, setPolicies] = useState([]);
  const [providers, setProviders] = useState({});
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortType, setSortType] = useState("");
  const [selected, setSelected] = useState([]);
  const [showTerms, setShowTerms] = useState(null);

  const navigate = useNavigate();

  /* ================= FETCH DATA ================= */
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
      })
      .catch(() => setProviders({}));
  }, []);

  /* ================= SAVE COMPARE SELECTION ================= */
  useEffect(() => {
    localStorage.setItem(
      "compare_selected",
      JSON.stringify(selected.map(Number))
    );
  }, [selected]);

  /* ================= COMPARE ================= */
  const toggleCompare = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id));
    } else {
      if (selected.length >= 3) return;
      setSelected([...selected, id]);
    }
  };

  /* ================= FILTER & SORT ================= */
  const filteredPolicies = policies
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        (providers[p.provider_id] || "")
          .toLowerCase()
          .includes(search.toLowerCase())
    )
    .filter((p) =>
      filterCategory ? p.category === filterCategory : true
    )
    .sort((a, b) => {
      if (sortType === "low") return a.premium - b.premium;
      if (sortType === "high") return b.premium - a.premium;
      return 0;
    });

  return (
    <>
      <Header />

      <div
        style={{
          paddingTop: "90px",
          padding: "32px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <h2 className="page-title">Browse Insurance Policies</h2>

        {/* ================= SEARCH BAR ================= */}
        <div className="browse-controls">
          <input
            className="browse-search"
            placeholder="Search by policy, provider or category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="browse-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Life">Life</option>
            <option value="Health">Health</option>
          </select>

          <select
            className="browse-select"
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="">Premium</option>
            <option value="low">Low → High</option>
            <option value="high">High → Low</option>
          </select>
        </div>

        {/* ================= POLICY CARDS ================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {filteredPolicies.map((policy) => {
            const isSelected = selected.includes(policy.id);

            return (
              <div key={policy.id} className="policy-card">
                <h3>{policy.name}</h3>

                <div className="provider-name">
                  {providers[policy.provider_id]}
                </div>

                <div className="policy-info">
                  <p>
                    <b>Category:</b> {policy.category}
                  </p>
                  <p>
                    <b>Coverage:</b> ₹{policy.coverage}
                  </p>

                  <div className="policy-price">
                    {currency(policy.premium)} / year
                  </div>

                  {/* 🔗 TERMS & CONDITIONS LINK */}
                  <span
                    className="tc-link"
                    onClick={() =>
                      setShowTerms(
                        policy.terms_conditions ||
                          "Standard terms and conditions apply."
                      )
                    }
                  >
                    Terms & Conditions
                  </span>
                </div>

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
              </div>
            );
          })}
        </div>

        {/* ================= COMPARE BAR ================= */}
        {selected.length > 0 && (
          <div className="compare-bar">
            <span>{selected.length} plan(s) selected</span>
            <button
              className="btn-purple"
              onClick={() => navigate("/compare")}
            >
              Compare Now →
            </button>
          </div>
        )}
      </div>

      {/* ================= TERMS MODAL ================= */}
      {showTerms && (
        <div
          className="tc-modal-overlay"
          onClick={() => setShowTerms(null)}
        >
          <div
            className="tc-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Terms & Conditions</h3>
            <p>{showTerms}</p>
            <button
              className="btn-purple full"
              onClick={() => setShowTerms(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
