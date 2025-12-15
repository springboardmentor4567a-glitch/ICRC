import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InsurancePlans() {
  const [policies, setPolicies] = useState([]);
  const [selected, setSelected] = useState(() => {
    return JSON.parse(localStorage.getItem("compare_selected") || "[]");
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/policies")
      .then(res => res.json())
      .then(data => setPolicies(data));
  }, []);

  useEffect(() => {
    localStorage.setItem("compare_selected", JSON.stringify(selected));
  }, [selected]);

  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(x => x !== id));
    } else {
      if (selected.length >= 3) {
        alert("You can compare up to 3 policies only");
        return;
      }
      setSelected([...selected, id]);
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "auto" }}>
      <h2 style={{ textAlign: "center", color: "#8b5cf6" }}>
        Insurance Plans
      </h2>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button
          onClick={() => {
            if (selected.length < 2) {
              alert("Select at least 2 policies to compare");
              return;
            }
            navigate("/compare");
          }}
          className="btn-purple"
        >
          Compare ({selected.length})
        </button>
      </div>

      {policies.map(p => (
        <div key={p.id} className="policy-card" style={{ marginBottom: 16 }}>
          <h3 style={{ color: "#a78bfa" }}>{p.name}</h3>
          <p><b>Policy Number:</b> {p.policy_number}</p>
          <p><b>Category:</b> {p.category}</p>
          <p><b>Coverage:</b> ₹{p.coverage}</p>
          <p><b>Premium:</b> ₹{p.premium} / year</p>
          <p><b>Benefits:</b> {p.benefits}</p>

          <button
            onClick={() => toggleSelect(p.id)}
            className={selected.includes(p.id) ? "btn-selected" : "btn-outline"}
          >
            {selected.includes(p.id) ? "Selected" : "Select to Compare"}
          </button>
        </div>
      ))}
    </div>
  );
}
