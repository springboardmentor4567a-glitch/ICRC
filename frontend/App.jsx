import React, { useState, useEffect } from "react";
import "./index.css";

const API_URL = "http://127.0.0.1:8000";

/* ================= TOP BAR ================= */
function TopBar({ userName, onLogout }) {
  return (
    <header className="topbar">
      <div className="brand">Insurance Platform</div>
      <div className="welcome">
        Welcome back, <strong>{userName}</strong>!
      </div>
      <button className="logout" onClick={onLogout}>Logout</button>
    </header>
  );
}

/* ================= LOGIN ================= */
function Login({ onLogin, switchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Invalid credentials");
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("loggedInUser", data.user.name);
      localStorage.setItem("user_id", data.user.id); // ✅ REQUIRED

      onLogin();
    } catch {
      setError("Backend not reachable");
    }
  };

  return (
    <div className="login-wrap">
      <div className="project-heading">
        Insurance Comparison, Recommendation & Claim Assistant
      </div>

      <div className="login-card">
        <h2>LOGIN</h2>
        {error && <div className="error-text">{error}</div>}
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="login-btn" onClick={handleLogin}>LOGIN</button>
        <p className="switch">
          Not a member? <span onClick={switchToRegister}>Sign up now</span>
        </p>
      </div>
    </div>
  );
}

/* ================= REGISTER ================= */
function Register({ switchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleRegister = async () => {
    setMsg("");
    try {
      const res = await fetch(
        `${API_URL}/register?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        { method: "POST" }
      );

      if (!res.ok) {
        setMsg("Registration failed");
        return;
      }

      setMsg("Registered successfully ✔ Redirecting...");
      setTimeout(() => switchToLogin(), 1200);
    } catch {
      setMsg("Backend not reachable");
    }
  };

  return (
    <div className="login-wrap">
      <div className="project-heading">
        Insurance Comparison, Recommendation & Claim Assistant
      </div>

      <div className="login-card">
        <h2>REGISTER</h2>
        <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {msg && <div className="success-text">{msg}</div>}
        <button className="login-btn" onClick={handleRegister}>Create Account</button>
        <p className="switch">
          Already a member? <span onClick={switchToLogin}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

/* ================= POLICY COMPARISON (FINAL + DETAILED TABLE) ================= */
function PolicyComparison({ onBack }) {
  const [type, setType] = useState("Health");
  const [selected, setSelected] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  // 🔥 FRONTEND DEMO DATA
  const demoPolicies = {
    Health: [
      {
        id: 1,
        title: "Health Plus",
        provider: "HealthCare Inc",
        rating: 4.5,
        coverage: 500000,
        premium: 5000,
        deductible: 1000,
        desc: "Comprehensive health coverage with low deductible"
      },
      {
        id: 2,
        title: "Health Plus Plus",
        provider: "MediGuard",
        rating: 4.3,
        coverage: 700000,
        premium: 6500,
        deductible: 1500,
        desc: "Higher coverage suitable for families"
      },
      {
        id: 3,
        title: "Health Plus Max",
        provider: "CareSecure",
        rating: 4.7,
        coverage: 1000000,
        premium: 8000,
        deductible: 2000,
        desc: "Premium plan with maximum benefits"
      }
    ],

    Home: [
      {
        id: 4,
        title: "Home Secure",
        provider: "SafeHome",
        rating: 4.4,
        coverage: 1500000,
        premium: 4000,
        deductible: 5000,
        desc: "Basic home insurance for apartments"
      },
      {
        id: 5,
        title: "Home Secure Plus",
        provider: "PropertyShield",
        rating: 4.6,
        coverage: 2500000,
        premium: 6500,
        deductible: 8000,
        desc: "Extended protection for independent houses"
      },
      {
        id: 6,
        title: "Home Secure Max",
        provider: "HomeCare",
        rating: 4.8,
        coverage: 4000000,
        premium: 9000,
        deductible: 12000,
        desc: "Complete home & property coverage"
      }
    ],

    Auto: [
      {
        id: 7,
        title: "Auto Protect",
        provider: "DriveSafe",
        rating: 4.2,
        coverage: 300000,
        premium: 3500,
        deductible: 2000,
        desc: "Affordable car insurance for daily commuters"
      },
      {
        id: 8,
        title: "Auto Protect Plus",
        provider: "CarGuard",
        rating: 4.5,
        coverage: 600000,
        premium: 5500,
        deductible: 3000,
        desc: "Enhanced coverage for personal vehicles"
      }
    ],

    Life: [
      {
        id: 9,
        title: "Life Secure",
        provider: "LifeTrust",
        rating: 4.6,
        coverage: 2000000,
        premium: 8000,
        deductible: 0,
        desc: "Life insurance with long-term benefits"
      },
      {
        id: 10,
        title: "Life Secure Plus",
        provider: "FutureLife",
        rating: 4.8,
        coverage: 5000000,
        premium: 12000,
        deductible: 0,
        desc: "High-value life insurance for families"
      }
    ]
  };

  const policies = demoPolicies[type];

  const toggleSelect = (policy) => {
    if (selected.find(p => p.id === policy.id)) {
      setSelected(selected.filter(p => p.id !== policy.id));
      setShowCompare(false);
    } else {
      if (selected.length === 3) return;
      setSelected([...selected, policy]);
      setShowCompare(false);
    }
  };

  return (
    <div className="page-container">
      <button className="back-btn" onClick={onBack}>← Back</button>
      <h2 className="page-title">Policy Comparison</h2>

      {/* Tabs */}
      <div className="tab-row">
        {["Health", "Auto", "Home", "Life"].map(t => (
          <button
            key={t}
            className={type === t ? "tab active" : "tab"}
            onClick={() => {
              setType(t);
              setSelected([]);
              setShowCompare(false);
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Policy Cards */}
      <div className="policy-card-grid">
        {policies.map(p => {
          const isSelected = selected.find(s => s.id === p.id);
          return (
            <div key={p.id} className="policy-card-ui">
              <div className="policy-card-header">
                <h3>{p.title}</h3>
                <span className="rating">⭐ {p.rating}</span>
              </div>

              <p className="provider">{p.provider}</p>
              <p style={{ fontSize: "13px", marginBottom: "10px" }}>{p.desc}</p>

              <div className="policy-row">
                <span>Coverage</span>
                <b>₹{p.coverage.toLocaleString()}</b>
              </div>

              <div className="policy-row">
                <span>Monthly Premium</span>
                <b>₹{p.premium}</b>
              </div>

              <div className="policy-row">
                <span>Deductible</span>
                <b>₹{p.deductible}</b>
              </div>

              <button
                className="select-btn"
                onClick={() => toggleSelect(p)}
              >
                {isSelected ? "✓ Selected" : "Select"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Compare Button */}
      {selected.length >= 2 && (
        <div style={{ marginTop: "25px" }}>
          <button
            className="calc-btn"
            onClick={() => setShowCompare(true)}
          >
            Compare Selected Policies
          </button>
        </div>
      )}

      {/* 🔥 DETAILED COMPARISON TABLE */}
      {showCompare && selected.length >= 2 && (
        <div className="table-card" style={{ marginTop: "40px" }}>
          <h3>Detailed Comparison</h3>

          <table className="policy-table">
            <thead>
              <tr>
                <th>Feature</th>
                {selected.slice(0, 2).map(p => (
                  <th key={p.id}>{p.title}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Provider</td>
                {selected.slice(0, 2).map(p => <td key={p.id}>{p.provider}</td>)}
              </tr>

              <tr>
                <td>Coverage Amount</td>
                {selected.slice(0, 2).map(p => (
                  <td key={p.id}>₹{p.coverage.toLocaleString()}</td>
                ))}
              </tr>

              <tr>
                <td>Monthly Premium</td>
                {selected.slice(0, 2).map(p => <td key={p.id}>₹{p.premium}</td>)}
              </tr>

              <tr>
                <td>Yearly Premium</td>
                {selected.slice(0, 2).map(p => (
                  <td key={p.id}>₹{p.premium * 12}</td>
                ))}
              </tr>

              <tr>
                <td>Deductible</td>
                {selected.slice(0, 2).map(p => <td key={p.id}>₹{p.deductible}</td>)}
              </tr>

              <tr>
                <td>Rating</td>
                {selected.slice(0, 2).map(p => <td key={p.id}>⭐ {p.rating}</td>)}
              </tr>

              <tr>
                <td>Features</td>
                {selected.slice(0, 2).map(p => (
                  <td key={p.id}>
                    <ul style={{ textAlign: "left", paddingLeft: "18px" }}>
                      <li>{p.desc}</li>
                      <li>Cashless treatment</li>
                      <li>24/7 customer support</li>
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


/* ================= PREMIUM CALCULATOR ================= */
function PremiumCalculator({ onBack }) {
  const [type, setType] = useState("Health Insurance");
  const [age, setAge] = useState(30);
  const [coverage, setCoverage] = useState(500000);
  const [deductible, setDeductible] = useState(10000);
  const [location, setLocation] = useState("");
  const [risks, setRisks] = useState({
    smoker: false,
    preExisting: false,
    highBMI: false,
    familyHistory: false,
  });
  const [premium, setPremium] = useState(null);

  const calculate = () => {
    let base = type === "Health Insurance" ? 5000 : 8000;
    if (age > 45) base += 2000;
    else if (age > 30) base += 1000;
    base += coverage / 100000;
    base -= deductible / 20;
    if (location === "Metro") base += 1500;
    if (location === "Non-Metro") base += 800;
    Object.values(risks).forEach(r => r && (base += 1000));
    setPremium(Math.max(Math.round(base), 2000));
  };

  return (
    <div className="page-container">
      <button className="back-btn" onClick={onBack}>⬅ Back</button>
      <h2 className="page-title">Premium Calculator</h2>

      <div className="calculator-card">
        <h2>Calculate Your Premium</h2>

        <label>Insurance Type *</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option>Health Insurance</option>
          <option>Auto Insurance</option>
          <option>Home Insurance</option>
          <option>Life Insurance</option>
        </select>

        <label>Age *</label>
        <input type="number" value={age} onChange={e => setAge(+e.target.value)} />

        <label>Coverage Amount (₹) *</label>
        <input type="number" value={coverage} onChange={e => setCoverage(+e.target.value)} />

        <label>Deductible (₹) *</label>
        <input type="number" value={deductible} onChange={e => setDeductible(+e.target.value)} />

        <label>Location *</label>
        <select value={location} onChange={e => setLocation(e.target.value)}>
          <option value="">Select location</option>
          <option>Metro</option>
          <option>Non-Metro</option>
          <option>Rural</option>
        </select>

        <label>Risk Factors</label>
        <div><input type="checkbox" onChange={e => setRisks({ ...risks, smoker: e.target.checked })} /> Smoker</div>
        <div><input type="checkbox" onChange={e => setRisks({ ...risks, preExisting: e.target.checked })} /> Pre-existing Conditions</div>
        <div><input type="checkbox" onChange={e => setRisks({ ...risks, highBMI: e.target.checked })} /> High BMI</div>
        <div><input type="checkbox" onChange={e => setRisks({ ...risks, familyHistory: e.target.checked })} /> Family History</div>

        <button className="calc-btn" onClick={calculate}>Calculate Premium</button>
        {premium && <div className="result">Estimated Premium: ₹{premium}</div>}
      </div>
    </div>
  );
}

/* ================= PREFERENCES ================= */
function Preferences({ onBack, setPage }) {
  const [age, setAge] = useState(30);
  const [policyType, setPolicyType] = useState("Health");
  const [risk, setRisk] = useState("Low");
  const [location, setLocation] = useState("Metro");
  const [msg, setMsg] = useState("");

  const savePreferences = async () => {
    const userId = localStorage.getItem("user_id");

    const res = await fetch(`${API_URL}/preferences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "user-id": userId   // ✅ FIXED
      },
      body: JSON.stringify({
        age,
        policy_type: policyType,
        risk_level: risk,
        location
      })
    });

    if (res.ok) {
      setMsg("Preferences saved ✔");
      setTimeout(() => setPage("recommendations"), 1000);
    } else setMsg("Error saving preferences");
  };

  return (
    <div className="page-container">
      <button className="back-btn" onClick={onBack}>⬅ Back</button>
      <h2 className="page-title">Your Preferences</h2>

      <div className="calculator-card">
        <label>Age</label>
        <input type="number" value={age} onChange={e => setAge(+e.target.value)} />

        <label>Policy Type</label>
        <select value={policyType} onChange={e => setPolicyType(e.target.value)}>
          <option>Health</option>
          <option>Auto</option>
          <option>Home</option>
          <option>Life</option>
        </select>

        <label>Risk Level</label>
        <select value={risk} onChange={e => setRisk(e.target.value)}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <label>Location</label>
        <select value={location} onChange={e => setLocation(e.target.value)}>
          <option>Metro</option>
          <option>Non-Metro</option>
          <option>Rural</option>
        </select>

        <button className="calc-btn" onClick={savePreferences}>Save Preferences</button>
        {msg && <div className="success-text">{msg}</div>}
      </div>
    </div>
  );
}

/* ================= RECOMMENDATIONS ================= */
function Recommendations({ onBack }) {
  const [list, setList] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    fetch(`${API_URL}/recommendations`, {
      headers: { "user-id": userId }   // ✅ FIXED
    })
      .then(res => res.json())
      .then(data => setList(data));
  }, []);

  return (
    <div className="page-container">
      <button className="back-btn" onClick={onBack}>⬅ Back</button>
      <h2 className="page-title">Recommended for You</h2>

      {list.map((r, i) => (
        <div className="card-box" key={i}>
          <h3>{r.policy}</h3>
          <p><b>Score:</b> {r.score}</p>
          <p><b>Why:</b> {r.reason}</p>
        </div>
      ))}
    </div>
  );
}

/* ================= DASHBOARD ================= */
function Dashboard({ userName, onLogout, setPage }) {
  return (
    <div>
      <TopBar userName={userName} onLogout={onLogout} />
      <main className="grid">
        <Card icon="📊" title="Policy Comparison" onClick={() => setPage("policies")} />
        <Card icon="🧮" title="Premium Calculator" onClick={() => setPage("calculator")} />
        <Card icon="⭐" title="Recommendations" onClick={() => setPage("preferences")} />
        <Card icon="🧾" title="File a Claim" onClick={() => alert("Week 5")} />
        <Card icon="📍" title="Track Claims" onClick={() => alert("Week 6")} />
      </main>
    </div>
  );
}

function Card({ icon, title, onClick }) {
  return (
    <div className="card-box">
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      <button className="access-btn" onClick={onClick}>Access →</button>
    </div>
  );
}

/* ================= MAIN APP ================= */
export default function App() {
  const [page, setPage] = useState("login");
  const userName = localStorage.getItem("loggedInUser") || "User";

  const logout = () => {
    localStorage.clear();
    setPage("login");
  };

  if (page === "login") return <Login onLogin={() => setPage("dashboard")} switchToRegister={() => setPage("register")} />;
  if (page === "register") return <Register switchToLogin={() => setPage("login")} />;
  if (page === "policies") return <PolicyComparison onBack={() => setPage("dashboard")} />;
  if (page === "calculator") return <PremiumCalculator onBack={() => setPage("dashboard")} />;
  if (page === "preferences") return <Preferences onBack={() => setPage("dashboard")} setPage={setPage} />;
  if (page === "recommendations") return <Recommendations onBack={() => setPage("dashboard")} />;

  return <Dashboard userName={userName} onLogout={logout} setPage={setPage} />;
}
