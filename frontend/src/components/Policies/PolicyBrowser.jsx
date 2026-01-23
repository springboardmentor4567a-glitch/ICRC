import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPolicies, getMyPolicies, purchasePolicy } from '../../api'; 
import './PolicyList.css'; // Ensure this CSS file includes the .rec-card styles

// Simple Icon for the modal
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const PolicyList = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [purchasedIds, setPurchasedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  
  // ✅ TOAST STATE
  const [toast, setToast] = useState(null);

  // ✅ DETAILS MODAL STATE
  const [viewDetailsPolicy, setViewDetailsPolicy] = useState(null);

  // ✅ BUY MODAL STATE
  const [buyModal, setBuyModal] = useState({
    show: false, step: 'confirm', policy: null, customPrice: 0, customCoverage: 500000
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const catalogData = await getPolicies();
        const myData = await getMyPolicies();
        
        if (Array.isArray(myData)) {
            const owned = new Set(myData.map(p => p.policy_id));
            setPurchasedIds(owned);
        }

        if (Array.isArray(catalogData)) {
            setPolicies(catalogData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const showToast = (msg, type='info') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
  };

  const calculateDynamicPrice = (policy, coverage) => {
      let final = policy.premium;
      if (policy.type === 'life') final = 5000 + (coverage / 100000) * 200; 
      else final = 3000 + (coverage / 100000) * 1500;
      return Math.round(final);
  };

  const openBuyModal = (policy) => {
      const initialCover = policy.type === 'life' ? 5000000 : 500000;
      setBuyModal({ 
          show: true, step: 'confirm', policy: policy, 
          customCoverage: initialCover,
          customPrice: calculateDynamicPrice(policy, initialCover)
      });
  };

  const updateModalCoverage = (newCoverage) => {
      setBuyModal(prev => ({
          ...prev,
          customCoverage: newCoverage,
          customPrice: calculateDynamicPrice(prev.policy, newCoverage)
      }));
  };

  const closeBuyModal = () => {
    setBuyModal({ ...buyModal, show: false });
    if (buyModal.step === 'success') {
        setPurchasedIds(prev => new Set(prev).add(buyModal.policy.id));
    }
  };

  const confirmPurchase = async () => {
    if (!buyModal.policy) return;
    setBuyModal(prev => ({ ...prev, step: 'processing' }));
    try {
        const result = await purchasePolicy(buyModal.policy.id, buyModal.customCoverage);
        if (result?.policy_number) {
            setBuyModal(prev => ({ ...prev, step: 'success', resultData: result }));
        } else {
            showToast("Purchase Failed.", "error");
            setBuyModal(prev => ({ ...prev, step: 'confirm' }));
        }
    } catch { 
        showToast("Server Error", "error");
        setBuyModal(prev => ({ ...prev, step: 'confirm' })); 
    }
  };

  const getFeatures = (type) => {
      if (type === 'health') return { "Room Rent": "Single Private", "Waiting Period": "2 Years", "Ambulance": "Covered" };
      if (type === 'life') return { "Terminal Illness": "Covered", "Accidental": "Double Sum", "Tax Benefit": "80C" };
      return { "Zero Dep": "Included", "NCB": "Yes", "Roadside Asst": "24x7" };
  };

  if (loading) return <div className="loading-spinner">Loading plans...</div>;

  return (
    <div className="policy-page">
      {/* TOAST UI */}
      {toast && (
          <div style={{ position: 'fixed', top: '20px', right: '20px', padding: '12px 20px', borderRadius: '8px', background: toast.type === 'error' ? '#fee2e2' : '#f0f9ff', color: toast.type === 'error' ? '#b91c1c' : '#0369a1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 9999, fontWeight: '500', display:'flex', alignItems:'center', gap:'8px' }}>
              {toast.type === 'error' ? '⚠️' : 'ℹ️'} {toast.msg}
          </div>
      )}

      <div className="policy-header">
        <h1>Insurance Plans</h1>
        <p>Choose the best protection for you and your family.</p>
      </div>

      <div className="policy-grid">
        {policies.map((policy) => {
          const isOwned = purchasedIds.has(policy.id);
          const features = getFeatures(policy.type);

          // ✅ 1. CHANGED TO MODERN CARD STRUCTURE
          return (
            <div key={policy.id} className={`rec-card ${isOwned ? 'owned-card' : ''}`} style={{position:'relative', display:'flex', flexDirection:'column'}}>
              
              <div className="rec-card-header">
                <span className="star-icon">
                    {policy.type === 'health' ? '🏥' : policy.type === 'auto' ? '🚗' : '🛡️'}
                </span>
                <div>
                    <h3 style={{marginBottom:'5px'}}>{policy.title}</h3>
                    <span className="policy-provider">{policy.provider}</span>
                </div>
              </div>

              <div className="static-coverage">
                  Coverage: {policy.coverage?.max ? `Up to ₹${(policy.coverage.max/100000).toFixed(0)} Lakhs` : 'Flexible Limit'}
              </div>

              <div className="rec-price">
                  ₹{policy.premium.toLocaleString()} <small className="term">/year</small>
              </div>

              <ul className="rec-benefits">
                  {/* Dynamically show first 2 features */}
                  {Object.entries(features).slice(0, 2).map(([key, val]) => (
                      <li key={key}>✅ {key}: <strong>{val}</strong></li>
                  ))}
              </ul>

              <div className="card-actions">
                  {isOwned ? (
                    <button className="select-plan-btn btn-owned" disabled>✅ Active</button>
                  ) : (
                    <button className="select-plan-btn" onClick={() => openBuyModal(policy)}>Buy Now</button>
                  )}
                  <button className="details-btn" onClick={() => setViewDetailsPolicy(policy)}>Details</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ 2. BUY POPUP (Standardized) */}
      {buyModal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={closeBuyModal}>
            <div className="card animate-slide" style={{ width: '450px', maxWidth: '95%', padding: 0, overflow:'hidden', borderRadius:'12px', background:'white', boxShadow:'0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: '1.25rem', background: 'var(--primary)', color:'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin:0, fontWeight:'bold', fontSize:'1.2rem' }}>Customize Plan</h3>
                    <button onClick={closeBuyModal} style={{ background:'transparent', border:'none', color:'white', cursor:'pointer' }}><CloseIcon /></button>
                </div>
                <div style={{ padding: '2rem' }}>
                    {buyModal.step === 'confirm' && (
                        <>
                            <div style={{ marginBottom:'1.5rem', textAlign:'center' }}>
                                <p style={{ fontSize:'0.9rem', color:'var(--text-muted)', marginBottom:'0.5rem' }}>You are selecting</p>
                                <h2 style={{ fontSize:'1.5rem', fontWeight:'bold', color:'var(--text-main)', margin:0 }}>{buyModal.policy.title}</h2>
                            </div>
                            <div style={{ background:'#f8fafc', padding:'1.5rem', borderRadius:'0.75rem', border:'1px solid #e2e8f0', marginBottom:'2rem' }}>
                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem' }}>
                                    <span style={{ fontWeight:'600', color:'var(--text-muted)' }}>Coverage Amount</span>
                                    <span style={{ fontWeight:'bold', color:'var(--primary)', fontSize:'1.1rem' }}>₹{buyModal.customCoverage.toLocaleString()}</span>
                                </div>
                                <input type="range" min="500000" max="20000000" step="500000" value={buyModal.customCoverage} onChange={(e) => updateModalCoverage(parseInt(e.target.value))} style={{ width: '100%', cursor:'pointer' }} />
                                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'#94a3b8', marginTop:'0.5rem' }}><span>₹5L</span><span>₹2Cr</span></div>
                            </div>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', padding:'0 1rem' }}>
                                <span style={{ fontSize:'1rem', color:'var(--text-main)' }}>Total Premium</span>
                                <span style={{ fontSize:'1.5rem', fontWeight:'bold', color:'var(--text-main)' }}>₹{buyModal.customPrice.toLocaleString()}</span>
                            </div>
                            <button onClick={confirmPurchase} style={{ width:'100%', padding:'1rem', background:'var(--success)', color:'white', border:'none', borderRadius:'0.5rem', fontSize:'1rem', fontWeight:'bold', cursor:'pointer' }}>Proceed to Pay</button>
                        </>
                    )}
                    {buyModal.step === 'processing' && <div style={{ textAlign:'center', padding:'2rem 0' }}><div className="spinner" style={{ margin:'0 auto 1rem' }}></div><p style={{ color:'var(--text-muted)' }}>Securely processing your payment...</p></div>}
                    {buyModal.step === 'success' && <div style={{ textAlign:'center', padding:'1rem 0' }}><div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🎉</div><h3 style={{ marginBottom:'0.5rem', fontWeight:'bold' }}>Policy Issued Successfully!</h3><p style={{ color:'var(--text-muted)', marginBottom:'1.5rem' }}>Check your dashboard for details.</p><button onClick={closeBuyModal} style={{ padding:'0.75rem 2rem', background:'var(--primary)', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer' }}>Done</button></div>}
                </div>
            </div>
        </div>
      )}

      {/* ✅ 3. DETAILS MODAL (Standardized) */}
      {viewDetailsPolicy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setViewDetailsPolicy(null)}>
            <div className="card animate-slide" style={{ width: '600px', maxWidth: '95%', padding: 0, overflow:'hidden', borderRadius:'12px', background:'white', boxShadow:'0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} onClick={e => e.stopPropagation()}>
                 <div style={{ padding: '1.5rem', background: 'var(--primary)', color:'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize:'0.75rem', opacity:0.8, textTransform:'uppercase', letterSpacing:'1px', margin:0 }}>{viewDetailsPolicy.type || 'General'} Insurance</p>
                        <h3 style={{ fontWeight: 'bold', fontSize: '1.5rem', margin:0 }}>{viewDetailsPolicy.title}</h3>
                    </div>
                    <button onClick={() => setViewDetailsPolicy(null)} style={{ background:'transparent', border:'none', color:'white', cursor:'pointer', padding:'5px' }}><CloseIcon /></button>
                 </div>
                 <div style={{ padding: '2rem', maxHeight:'70vh', overflowY:'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                         <div><p style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', margin:'0 0 4px 0' }}>Provider</p><p style={{ fontWeight:'bold', fontSize:'1rem', margin:0 }}>{viewDetailsPolicy.provider}</p></div>
                         <div><p style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', margin:'0 0 4px 0' }}>Term Duration</p><p style={{ fontWeight:'bold', fontSize:'1rem', margin:0 }}>{viewDetailsPolicy.term_months || 12} Months</p></div>
                         <div><p style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', margin:'0 0 4px 0' }}>Deductible</p><p style={{ fontWeight:'bold', fontSize:'1rem', margin:0 }}>₹{viewDetailsPolicy.deductible || 0}</p></div>
                         <div><p style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', margin:'0 0 4px 0' }}>Policy Type</p><p style={{ fontWeight:'bold', fontSize:'1rem', margin:0, textTransform:'capitalize' }}>{viewDetailsPolicy.type}</p></div>
                    </div>
                    <div style={{ background:'var(--bg-app)', padding:'1.25rem', borderRadius:'0.75rem', marginBottom:'1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid var(--border)' }}>
                         <div><p style={{ fontSize:'0.75rem', margin:'0 0 4px 0', color:'var(--text-muted)' }}>Annual Premium</p><p style={{ fontSize:'1.25rem', fontWeight:'bold', margin:0 }}>₹{(viewDetailsPolicy.premium || 0).toLocaleString()}</p></div>
                         <div style={{ textAlign:'right' }}><p style={{ fontSize:'0.75rem', margin:'0 0 4px 0', color:'var(--text-muted)' }}>Coverage Amount</p><p style={{ fontSize:'1.25rem', fontWeight:'bold', color:'var(--success)', margin:0 }}>₹{viewDetailsPolicy.coverage?.max ? (viewDetailsPolicy.coverage.max/100000).toFixed(1) + ' Lakhs' : 'N/A'}</p></div>
                    </div>
                    <h4 style={{ fontWeight:'bold', marginBottom:'0.75rem', fontSize:'1.1rem' }}>Description</h4>
                    <p style={{ fontSize:'0.9rem', color:'var(--text-muted)', lineHeight:'1.6', marginBottom:'1.5rem' }}>This is a comprehensive <strong>{viewDetailsPolicy.type}</strong> insurance plan provided by <strong>{viewDetailsPolicy.provider}</strong>. It includes extensive coverage for unforeseen events with a simplified claim process.</p>
                    <h4 style={{ fontWeight:'bold', marginBottom:'0.75rem', fontSize:'1.1rem' }}>Features Included</h4>
                    <ul style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', listStyle:'none', padding:0, margin:0 }}>{Object.entries(getFeatures(viewDetailsPolicy.type)).map(([key, val], i) => (<li key={i} style={{ display:'flex', gap:'0.5rem', fontSize:'0.9rem', color:'var(--text-main)', alignItems:'center' }}><span style={{ color:'var(--success)', fontWeight:'bold' }}>✓</span> <span>{key}: <strong>{val}</strong></span></li>))}</ul>
                 </div>
                 <div style={{ padding: '1.5rem', borderTop:'1px solid var(--border)', display:'flex', gap:'1rem', background:'#f8fafc' }}>
                    {purchasedIds.has(viewDetailsPolicy.id) ? (
                         <button className="buy-btn owned" disabled style={{ width:'100%', opacity:0.7 }}>✅ Plan Active</button>
                    ) : (
                         <button className="buy-btn" onClick={() => { openBuyModal(viewDetailsPolicy); setViewDetailsPolicy(null); }} style={{ width:'100%' }}>Buy Policy Now</button>
                    )}
                 </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PolicyList;
