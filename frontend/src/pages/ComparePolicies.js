import React, { useEffect, useState } from "react";

export default function ComparePolicies() {
  const [policies, setPolicies] = useState([]);
  const [policy1, setPolicy1] = useState("");
  const [policy2, setPolicy2] = useState("");

  const [result1, setResult1] = useState(null);
  const [result2, setResult2] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/policies")
      .then((res) => res.json())
      .then((data) => setPolicies(data));
  }, []);

  const compare = () => {
    const p1 = policies.find((p) => p.id = policy1);
    const p2 = policies.find((p) => p.id = policy2);

    setResult1(p1);
    setResult2(p2);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 className="page-title">Compare Insurance Policies</h2>

      <div className="compare-select-box">
        <select value={policy1} onChange={(e) => setPolicy1(e.target.value)}>
          <option value="">Select Policy 1</option>
          {policies.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select value={policy2} onChange={(e) => setPolicy2(e.target.value)}>
          <option value="">Select Policy 2</option>
          {policies.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <button className="btn-purple" onClick={compare}>Compare</button>
      </div>

      {result1 && result2 && (
        <div className="compare-table">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>{result1.name}</th>
                <th>{result2.name}</th>
              </tr>
            </thead>

            <tbody>
              <tr><td>Provider</td><td>{result1.provider_name}</td><td>{result2.provider_name}</td></tr>
              <tr><td>Category</td><td>{result1.category}</td><td>{result2.category}</td></tr>
              <tr><td>Coverage</td><td>₹{result1.coverage}</td><td>₹{result2.coverage}</td></tr>
              <tr><td>Premium</td><td>₹{result1.premium}</td><td>₹{result2.premium}</td></tr>
              <tr><td>Age Limit</td><td>{result1.age_limit}</td><td>{result2.age_limit}</td></tr>
              <tr><td>Settlement Ratio</td><td>{result1.ratio}%</td><td>{result2.ratio}%</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
