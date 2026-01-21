import { useEffect, useState } from "react";
import "./compare.css";

const ComparePolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [policyA, setPolicyA] = useState(null);
  const [policyB, setPolicyB] = useState(null);

  useEffect(() => {
    setPolicies([
      // Life Insurance Policies
      {
        id: 1,
        name: "Jeevan Anand",
        type: "Life",
        provider: "LIC",
        coverage: "₹10,00,000",
        yearly: "₹25,000",
      },
      {
        id: 2,
        name: "Smart Wealth Plan",
        type: "Life",
        provider: "Max Life",
        coverage: "₹1,50,00,000",
        yearly: "₹32,000",
      },
      {
        id: 3,
        name: "Whole Life Plan",
        type: "Life",
        provider: "SBI Life",
        coverage: "₹1,20,00,000",
        yearly: "₹30,000",
      },
      {
        id: 4,
        name: "Mera Term Plan",
        type: "Life",
        provider: "PNB MetLife",
        coverage: "₹80,00,000",
        yearly: "₹22,000",
      },

      // Health Insurance Policies
      {
        id: 5,
        name: "Health Shield",
        type: "Health",
        provider: "HDFC",
        coverage: "₹10,00,000",
        yearly: "₹15,000",
      },
      {
        id: 6,
        name: "Family Health Optima",
        type: "Health",
        provider: "Star Health",
        coverage: "₹20,00,000",
        yearly: "₹20,000",
      },
      {
        id: 7,
        name: "Health Guard",
        type: "Health",
        provider: "Bajaj Allianz",
        coverage: "₹15,00,000",
        yearly: "₹18,000",
      },
      {
        id: 8,
        name: "Complete Health Solution",
        type: "Health",
        provider: "Apollo Munich",
        coverage: "₹25,00,000",
        yearly: "₹25,000",
      },

      // Auto Insurance Policies
      {
        id: 9,
        name: "Motor Secure",
        type: "Auto",
        provider: "ICICI",
        coverage: "₹5,00,000",
        yearly: "₹12,000",
      },
      {
        id: 10,
        name: "Car Protect Plus",
        type: "Auto",
        provider: "Tata AIG",
        coverage: "₹10,00,000",
        yearly: "₹18,000",
      },
      {
        id: 11,
        name: "Vehicle Secure",
        type: "Auto",
        provider: "Reliance General",
        coverage: "₹9,00,000",
        yearly: "₹15,000",
      },

      // Travel Insurance Policies
      {
        id: 12,
        name: "World Explorer",
        type: "Travel",
        provider: "ICICI Lombard",
        coverage: "₹5,00,000",
        yearly: "₹8,000",
      },
      {
        id: 13,
        name: "Global Journey",
        type: "Travel",
        provider: "Bajaj Allianz",
        coverage: "₹10,00,000",
        yearly: "₹12,000",
      },
      {
        id: 14,
        name: "Trip Care Plus",
        type: "Travel",
        provider: "Star Health",
        coverage: "₹3,00,000",
        yearly: "₹6,000",
      },
      {
        id: 15,
        name: "International Shield",
        type: "Travel",
        provider: "HDFC ERGO",
        coverage: "₹15,00,000",
        yearly: "₹15,000",
      },
    ]);
  }, []);

  const getPolicy = (id) =>
    policies.find((p) => p.id === Number(id));

  return (
    <div className="compare-container">
      <header className="page-header">
        <h2>Compare Insurance Policies</h2>
        <div>
          <button onClick={() => window.history.back()}>Back</button>
        </div>
      </header>

      <div className="selectors">
        <select
          value={policyA?.id || ""}
          onChange={(e) => setPolicyA(getPolicy(e.target.value))}
        >
          <option value="">Select Policy A</option>
          {policies.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={policyB?.id || ""}
          onChange={(e) => setPolicyB(getPolicy(e.target.value))}
        >
          <option value="">Select Policy B</option>
          {policies.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {(policyA || policyB) && (
        <table className="compare-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>{policyA?.name || "Policy A"}</th>
              <th>{policyB?.name || "Policy B"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Type</td>
              <td>{policyA?.type || "-"}</td>
              <td>{policyB?.type || "-"}</td>
            </tr>
            <tr>
              <td>Provider</td>
              <td>{policyA?.provider || "-"}</td>
              <td>{policyB?.provider || "-"}</td>
            </tr>
            <tr>
              <td>Coverage Amount</td>
              <td>{policyA?.coverage || "-"}</td>
              <td>{policyB?.coverage || "-"}</td>
            </tr>
            <tr>
              <td>Yearly Premium</td>
              <td>{policyA?.yearly || "-"}</td>
              <td>{policyB?.yearly || "-"}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ComparePolicies;
