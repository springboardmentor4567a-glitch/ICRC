import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./authContext";
import "./Admin.css";

export default function Admin() {
  const { refreshPolicies, addPolicy, updatePolicy, deletePolicy } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [activeTab, setActiveTab] = useState('policies');
  const [fraudFlags, setFraudFlags] = useState([]);
  const [claims, setClaims] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [form, setForm] = useState({ provider: "", name: "", coverage: 0, priceBase: 0, termYears: 1, rating: 0, features: "", category: "Health" });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const list = await refreshPolicies();
      setPolicies(list);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFraudFlags = async () => {
    try {
      const response = await fetch('/api/fraud-flags', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const flags = await response.json();
        setFraudFlags(flags);
      }
    } catch (error) {
      console.error('Failed to fetch fraud flags:', error);
    }
  };

  const fetchClaims = async () => {
    try {
      const response = await fetch('/api/claims', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const claimsData = await response.json();
        setClaims(claimsData);
      }
    } catch (error) {
      console.error('Failed to fetch claims:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/claims', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const analyticsData = await response.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const resolveFraudFlag = async (flagId) => {
    try {
      const response = await fetch(`/api/fraud-flags/${flagId}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        await fetchFraudFlags(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to resolve fraud flag:', error);
    }
  };

  const updateClaimStatus = async (claimId, status) => {
    try {
      const response = await fetch(`/api/claims/${claimId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        await fetchClaims(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to update claim status:', error);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, coverage: Number(form.coverage), priceBase: Number(form.priceBase), termYears: Number(form.termYears), rating: Number(form.rating), features: form.features.split(",").map(s => s.trim()).filter(Boolean) };
    try {
      if (editingId) {
        await updatePolicy(editingId, payload);
        setEditingId(null);
      } else {
        await addPolicy(payload);
      }
      setPolicies(await refreshPolicies());
    } catch (err) {
      alert(err?.message || "Failed to update policies (admin required)");
    }
    setForm({ provider: "", name: "", coverage: 0, priceBase: 0, termYears: 1, rating: 0, features: "", category: "Health" });
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({ provider: p.provider, name: p.name, coverage: p.coverage, priceBase: p.priceBase, termYears: p.termYears, rating: p.rating, features: p.features.join(", "), category: p.category });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this policy?")) return;
    try {
      await deletePolicy(id);
      setPolicies(await refreshPolicies());
    } catch (err) {
      alert(err?.message || "Failed to delete policy (admin required)");
    }
  };

  return (
    <div className="page-wrap">
      <header className="page-header">
        <h2>Admin Dashboard</h2>
        <div>
          <button onClick={() => window.history.back()}>Back</button>
          <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        </div>
      </header>

      <div className="admin-tabs">
        <button className={activeTab === 'policies' ? 'active' : ''} onClick={() => setActiveTab('policies')}>Policies</button>
        <button className={activeTab === 'claims' ? 'active' : ''} onClick={() => { setActiveTab('claims'); fetchClaims(); }}>Claims</button>
        <button className={activeTab === 'fraud' ? 'active' : ''} onClick={() => { setActiveTab('fraud'); fetchFraudFlags(); }}>Fraud Detection</button>
        <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => { setActiveTab('analytics'); fetchAnalytics(); }}>Analytics</button>
      </div>

      {activeTab === 'policies' && (
        <>
          <section style={{ marginTop: 12 }}>
            <form onSubmit={submit} className="admin-form">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input required placeholder="Provider" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
                <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input type="number" required placeholder="Coverage" value={form.coverage} onChange={(e) => setForm({ ...form, coverage: e.target.value })} />
                <input type="number" required placeholder="Base Price" value={form.priceBase} onChange={(e) => setForm({ ...form, priceBase: e.target.value })} />
                <input type="number" placeholder="Term Years" value={form.termYears} onChange={(e) => setForm({ ...form, termYears: e.target.value })} />
                <input type="number" placeholder="Rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
                <input placeholder="Features (comma separated)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="Health">Health</option><option value="Auto">Auto</option></select>
              </div>
              <div style={{ marginTop: 8 }}>
                <button type="submit">{editingId ? "Update Policy" : "Add Policy"}</button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ provider: "", name: "", coverage: 0, priceBase: 0, termYears: 1, rating: 0, features: "", category: "Health" }); }}>Cancel</button>}
              </div>
            </form>
          </section>

          <section style={{ marginTop: 18 }}>
            <h3>Existing Policies</h3>
            <div className="policies-grid">
              {policies.map((p) => (
                <div key={p.id} className="policy-card">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>{p.name}</strong>
                    <div>
                      <button onClick={() => startEdit(p)}>Edit</button>
                      <button onClick={() => handleDelete(p.id)}>Delete</button>
                    </div>
                  </div>
                  <div>Provider: {p.provider}</div>
                  <div>Coverage: {p.coverage}</div>
                  <div>Base Price: ₹{p.priceBase}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {activeTab === 'claims' && (
        <section style={{ marginTop: 18 }}>
          <h3>Claims Management</h3>
          <div className="claims-list">
            {claims.map((claim) => (
              <div key={claim.id} className="claim-card">
                <div><strong>Claim #{claim.claim_number}</strong></div>
                <div>Type: {claim.claim_type}</div>
                <div>Amount: ₹{claim.amount_claimed}</div>
                <div>Status: {claim.status}</div>
                <div>User: {claim.user_name || 'N/A'}</div>
                <div>
                  <select value={claim.status} onChange={(e) => updateClaimStatus(claim.id, e.target.value)}>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'fraud' && (
        <section style={{ marginTop: 18 }}>
          <h3>Fraud Detection Flags</h3>
          <div className="fraud-flags-list">
            {fraudFlags.map((flag) => (
              <div key={flag.id} className={`fraud-flag-card ${flag.severity}`}>
                <div><strong>Claim #{flag.claim_number}</strong></div>
                <div>Type: {flag.flag_type}</div>
                <div>Severity: {flag.severity}</div>
                <div>Description: {flag.description}</div>
                <div>User: {flag.user_name} ({flag.user_email})</div>
                <div>Flagged: {new Date(flag.flagged_at).toLocaleDateString()}</div>
                {!flag.resolved && (
                  <button onClick={() => resolveFraudFlag(flag.id)}>Resolve</button>
                )}
                {flag.resolved && <div>Resolved: {new Date(flag.resolved_at).toLocaleDateString()}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'analytics' && (
        <section style={{ marginTop: 18 }}>
          <h3>Claims Analytics</h3>
          <div className="analytics-grid">
            <div className="analytics-card">
              <h4>Status Distribution</h4>
              {Object.entries(analytics.status_counts || {}).map(([status, count]) => (
                <div key={status}>{status}: {count}</div>
              ))}
            </div>
            <div className="analytics-card">
              <h4>Monthly Claims</h4>
              {analytics.monthly_claims?.map((item) => (
                <div key={item.month}>{item.month}: {item.count} claims</div>
              ))}
            </div>
            <div className="analytics-card">
              <h4>Fraud Flags</h4>
              {analytics.fraud_flags?.map((flag) => (
                <div key={`${flag.type}-${flag.severity}`}>{flag.type} ({flag.severity}): {flag.count}</div>
              ))}
            </div>
            <div className="analytics-card">
              <h4>Average Amounts by Type</h4>
              {analytics.average_amounts?.map((avg) => (
                <div key={avg.type}>{avg.type}: ₹{avg.avg_amount?.toFixed(2)} ({avg.count} claims)</div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
