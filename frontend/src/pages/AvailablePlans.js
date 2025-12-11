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
    } catch { return []; }
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/policies")
      .then((r) => r.json())
      .then((data) => setPolicies(data))
      .catch(() => setPolicies([]));

    fetch("http://127.0.0.1:8000/providers")
      .then((r) => r.json())
      .then((arr) => {
        const map = {};
        arr.forEach(p => (map[p.id] = p));
        setProviders(map);
      })
      .catch(() => setProviders({}));
  }, []);

  useEffect(() => {
    localStorage.setItem("compare_selected", JSON.stringify(selected));
  }, [selected]);

  function toggleSelect(id) {
    if (selected.includes(id)) {
      setSelected(selected.filter(x => x !== id));
      return;
    }
    if (selected.length >= 3) {
      // keep simple UX: don't allow more than 3
      alert("You can compare up to 3 policies only");
      return;
    }
    setSelected([...selected, id]);
  }

  return (
    <div style={{ padding: "28px", maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: 18, color: "#6C63FF" }}>
        Available Insurance Plans
      </h2>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 12 }}>
        <button
          onClick={() => {
            const s = JSON.parse(localStorage.getItem("compare_selected") || "[]");
            if (s.length < 2) return alert("Select at least 2 policies to compare");
            navigate("/compare");
          }}
          className="btn-purple"
          style={{ padding: "10px 16px" }}
        >
          Compare ({selected.length})
        </button>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 16
      }}>
        {policies.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#888" }}>
            No policies found
          </div>
        )}

        {policies.map(policy => (
          <div key={policy.id} className="policy-card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <div>
                <h3 style={{ margin: 0 }}>{policy.name}</h3>
                <small style={{ color: "#666" }}>{providers[policy.provider_id]?.name || "Unknown provider"}</small>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "700", fontSize: 18 }}>{currency(policy.premium)}</div>
                <div style={{ fontSize: 12, color: "#999" }}>yearly</div>
              </div>
            </div>

            <p style={{ marginTop: 10, marginBottom: 10, color: "#444", minHeight: 44 }}>
              {policy.benefits ? policy.benefits : "No description available."}
            </p>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => toggleSelect(policy.id)}
                className={selected.includes(policy.id) ? "btn-selected" : "btn-outline"}
                style={{ flex: 1 }}
              >
                {selected.includes(policy.id) ? "Selected" : "Select to compare"}
              </button>

              <button
                onClick={() => navigate(`/policy/${policy.id}`)}
                className="btn-purple"
                style={{ flex: 1 }}
              >
                View details
              </button>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, color: "#777" }}>
              Coverage: {String(policy.coverage)} • Category: {policy.category || "-"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
