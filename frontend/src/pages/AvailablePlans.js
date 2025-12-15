import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function currency(x) {
  if (x === null || x === undefined) return "-";
  return "₹" + Number(x).toLocaleString();
}

export default function AvailablePlans() {
  const [policies, setPolicies] = useState([]);
  const [providers, setProviders] = useState({});
  const [selected, setSelected] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("compare_selected") || "[]");
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/policies")
      .then((r) => r.json())
      .then(setPolicies)
      .catch(() => setPolicies([]));

    fetch("http://127.0.0.1:8000/providers")
      .then((r) => r.json())
      .then((arr) => {
        const map = {};
        arr.forEach((p) => (map[p.id] = p));
        setProviders(map);
      })
      .catch(() => setProviders({}));
  }, []);

  useEffect(() => {
    localStorage.setItem("compare_selected", JSON.stringify(selected));
  }, [selected]);

  function toggleSelect(id) {
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id));
      return;
    }
    if (selected.length >= 3) return;
    setSelected([...selected, id]);
  }

  const cheapestPremium =
    policies.length > 0
      ? Math.min(...policies.map((p) => p.premium))
      : null;

  return (
    <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
      <h2 className="page-title">Available Insurance Plans</h2>

      {selected.length === 3 && (
        <div className="compare-warning">
          You can compare up to 3 policies only
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
        }}
      >
        {policies.map((policy) => {
          const isSelected = selected.includes(policy.id);
          const isCheapest = policy.premium === cheapestPremium;

          return (
            <div
              key={policy.id}
              className={`policy-card ${isSelected ? "selected" : ""}`}
            >
              {isCheapest && (
                <div className="cheapest-badge">Cheapest</div>
              )}

              <h3>{policy.name}</h3>

              <div className="provider-name">
                {providers[policy.provider_id]?.name || "Unknown provider"}
              </div>

              <div className="policy-info">
                <p><b>Category:</b> {policy.category}</p>
                <p><b>Coverage:</b> ₹{policy.coverage}</p>

                <div className="policy-price">
                  {currency(policy.premium)} <span>/ year</span>
                </div>

                <div className="policy-benefits">
                  {policy.benefits || "No benefits available"}
                </div>
              </div>

              <div className="policy-actions">
                <label className="compare-check">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={!isSelected && selected.length >= 3}
                    onChange={() => toggleSelect(policy.id)}
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

      {/* Sticky Compare Bar */}
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
  );
}
