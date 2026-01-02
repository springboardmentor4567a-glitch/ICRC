import React, { useEffect, useState } from 'react';
import { getPolicies } from '../../api';
import { createPolicy, deletePolicy } from '../../adminApi';
import AdminHeader from './AdminHeader';
import './admin.css';

const AdminPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState({ provider_id: '', policy_type: 'health', title: '', premium: '', coverage_max: '' });

  useEffect(() => { load(); }, []);
  const load = async () => {
    const p = await getPolicies();
    setPolicies(Array.isArray(p) ? p : []);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = { ...form, coverage: { max: parseInt(form.coverage_max) } };
    const res = await createPolicy(payload);
    if (res && res.id) { load(); alert('✅ Policy Launched'); setForm({...form, title:'', premium:''}); }
    else alert('Failed');
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Confirm deletion?")) return;
      const res = await deletePolicy(id);
      if (res && res.message && res.message.includes('successfully')) load();
      else alert(res.message || "Cannot delete active policy");
  };

  return (
    <div className="admin-container">
      <AdminHeader />
      
      <div className="dashboard-section" style={{marginBottom:'40px'}}>
          <h3 className="section-title">🚀 Product Launcher</h3>
          
          <div className="tile-grid">
              {['health', 'life', 'auto'].map(type => (
                  <div key={type} className={`tile-option ${form.policy_type === type ? 'selected' : ''}`} onClick={() => setForm({...form, policy_type: type})}>
                      {type.toUpperCase()}
                  </div>
              ))}
          </div>

          <form onSubmit={handleCreate} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'20px'}}>
              <input className="verdict-textarea" style={{margin:0, height:'50px'}} placeholder="Provider (e.g. HDFC)" value={form.provider_id} onChange={e=>setForm({...form, provider_id:e.target.value})} required />
              <input className="verdict-textarea" style={{margin:0, height:'50px', gridColumn:'span 2'}} placeholder="Plan Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
              <input className="verdict-textarea" style={{margin:0, height:'50px'}} placeholder="Premium (₹)" type="number" value={form.premium} onChange={e=>setForm({...form, premium:e.target.value})} required />
              <input className="verdict-textarea" style={{margin:0, height:'50px'}} placeholder="Coverage (₹)" type="number" value={form.coverage_max} onChange={e=>setForm({...form, coverage_max:e.target.value})} />
              <button type="submit" className="btn primary" style={{gridColumn:'span 2', justifyContent:'center'}}>Publish Product</button>
          </form>
      </div>

      <h3 className="section-title">Active Catalog</h3>
      <div className="policy-grid">
          {policies.map(p => (
              <div key={p.id} className="policy-admin-card">
                  <div className="card-top">
                      <span className={`type-badge ${p.type || p.policy_type}`}>{p.type || p.policy_type}</span>
                      {p.purchased_count > 0 && <span style={{color:'#10b981', fontWeight:700, fontSize:'0.8rem'}}>● Active</span>}
                  </div>
                  <h4 style={{fontSize:'1.2rem', margin:'10px 0 0 10px'}}>{p.title}</h4>
                  <div className="price-tag">₹{p.premium.toLocaleString()}<span>/yr</span></div>
                  <div style={{paddingLeft:'10px', color:'#64748b', fontSize:'0.9rem', marginBottom:'20px'}}>{p.provider}</div>
                  
                  <div style={{borderTop:'1px solid #f1f5f9', paddingTop:'20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <span style={{fontSize:'0.85rem', fontWeight:600, color:'#334155'}}>👤 {p.purchased_count || 0} Enrolled</span>
                      {p.purchased_count > 0 ? (
                          <div style={{background:'#f1f5f9', color:'#94a3b8', padding:'6px 12px', borderRadius:'8px', fontSize:'0.8rem', fontWeight:600}}>🔒 Locked</div>
                      ) : (
                          <button className="btn-delete" onClick={()=>handleDelete(p.id)}>Delete</button>
                      )}
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default AdminPolicies;