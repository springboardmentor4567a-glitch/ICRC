import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendations, purchasePolicy, getMyPolicies } from '../../api';
import './Recommendations.css'; 

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const RecommendationList = () => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePolicyIds, setActivePolicyIds] = useState(new Set());
  const [filter, setFilter] = useState('all');
  
  // TOAST STATE
  const [toast, setToast] = useState(null);

  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [viewDetailsPolicy, setViewDetailsPolicy] = useState(null);

  const [buyModal, setBuyModal] = useState({
    show: false, step: 'confirm', policy: null, customPrice: 0, customCoverage: 500000
  });

  const navigate = useNavigate();

  useEffect(() => {
    const initData = async () => {
      try {
        const recData = await getRecommendations();
        if (recData?.redirect) { navigate(recData.redirect); return; }
        
        const myPolicies = await getMyPolicies();
        if (Array.isArray(myPolicies)) {
            const activeSet = new Set(myPolicies.filter(p => p.status === 'active').map(p => p.policy_id));
            setActivePolicyIds(activeSet);
        }
        setRecs(Array.isArray(recData) ? recData : []);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    initData();
  }, [navigate]);

  const showToast = (msg, type='info') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
  };

  const getExtendedDetails = (policy) => {
      if (policy.policy_type === 'health') return { "Room Rent Limit": "Single Private", "Network Hospitals": "8500+", "Waiting Period": "2 Years" };
      if (policy.policy_type === 'life') return { "Claim Ratio": "99.1%", "Terminal Illness": "Covered", "Accidental Death": "Double Sum" };
      if (policy.policy_type === 'auto') return { "IDV": "Market Value", "Zero Dep": "Included", "NCB Protect": "Yes" };
      return {};
  };

  const calculateDynamicPrice = (policy, coverage) => {
      let final = policy.premium;
      if (policy.policy_type === 'life') final = 5000 + (coverage / 100000) * 200; 
      else final = 3000 + (coverage / 100000) * 1500;
      return Math.round(final);
  };

  const openBuyModal = (policy) => {
      const initialCover = policy.policy_type === 'life' ? 5000000 : 500000;
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
        setActivePolicyIds(prev => new Set(prev).add(buyModal.policy.id));
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
            showToast("Purchase Failed. Please try again.", "error"); 
            setBuyModal(prev => ({ ...prev, step: 'confirm' }));
        }
    } catch { 
        showToast("Server Error. Please try again later.", "error");
        setBuyModal(prev => ({ ...prev, step: 'confirm' })); 
    }
  };

  const toggleCompare = (policy) => {
    if (compareList.find(p => p.id === policy.id)) {
        setCompareList(compareList.filter(p => p.id !== policy.id));
    } else { 
        if (compareList.length >= 3) { 
            showToast("You can only compare up to 3 plans.", "warning");
            return; 
        } 
        setCompareList([...compareList, policy]); 
    }
  };

  const getBestValue = (field) => {
      if (compareList.length < 2) return null;
      if (field === 'premium') return Math.min(...compareList.map(p => p.premium));
      if (field === 'csr') return Math.max(...compareList.map(p => p.csr));
      return null;
  };

  const renderCategorySection = (type, title, emoji) => {
    const categoryPolicies = recs.filter(p => p.policy_type === type).sort((a,b) => b.match_score - a.match_score).slice(0,3);
    if (categoryPolicies.length === 0) return null;

    return (
        <div className="category-section" key={type}>
            <div className="category-header"><h2>{emoji} {title} Recommendations</h2></div>
            <div className="rec-grid">
                {categoryPolicies.map((policy, index) => (
                    <RecommendationCard 
                        key={policy.id} policy={policy} 
                        isActive={activePolicyIds.has(policy.id)}
                        isSelected={!!compareList.find(p => p.id === policy.id)}
                        isTopPick={index === 0}
                        onBuy={() => openBuyModal(policy)}
                        onCompare={() => toggleCompare(policy)}
                        onDetails={() => setViewDetailsPolicy(policy)}
                        extendedDetails={getExtendedDetails(policy)}
                    />
                ))}
            </div>
        </div>
    );
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="rec-page-container">
      {/* TOAST UI */}
      {toast && (
          <div style={{ position: 'fixed', top: '20px', right: '20px', padding: '12px 20px', borderRadius: '8px', background: toast.type === 'error' ? '#fee2e2' : '#f0f9ff', color: toast.type === 'error' ? '#b91c1c' : '#0369a1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 9999, fontWeight: '500', display:'flex', alignItems:'center', gap:'8px' }}>
              {toast.type === 'error' ? '⚠️' : 'ℹ️'} {toast.msg}
          </div>
      )}

      <div className="rec-content-wrapper">
          <div className="nav-row">
              <button className="back-btn" onClick={() => navigate('/')}>← Dashboard</button>
              <button className="update-profile-btn" onClick={() => navigate('/risk-profile')}>✏️ Update Risk Profile</button>
          </div>
          <div className="rec-header">
            <h1>Your Personalized Recommendations</h1>
            <p>Policies matching your risk profile.</p>
            <div className="filter-container">
                {['all', 'health', 'auto', 'life'].map(f => (
                    <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f.toUpperCase()}</button>
                ))}
            </div>
          </div>

          {(filter === 'all' || filter === 'auto') && renderCategorySection('auto', 'Auto Insurance', '🚗')}
          {(filter === 'all' || filter === 'health') && renderCategorySection('health', 'Health Insurance', '🏥')}
          {(filter === 'all' || filter === 'life') && renderCategorySection('life', 'Life Insurance', '🛡️')}
      </div>

      {/* STICKY COMPARE BAR */}
      {compareList.length > 0 && (
        <div className="compare-bar-fixed">
          <div className="compare-content">
              <div className="compare-text">Comparing <span className="badge">{compareList.length}</span> Plans</div>
              <div className="compare-buttons">
                  <button className="btn-compare-action" onClick={() => setShowCompareModal(true)}>Compare Now</button>
                  <button className="btn-clear" onClick={() => setCompareList([])}>Clear</button>
              </div>
          </div>
        </div>
      )}

      {/* ✅ UNIFIED BUY POPUP */}
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
                    {buyModal.step === 'processing' && (
                        <div style={{ textAlign:'center', padding:'2rem 0' }}><div className="spinner" style={{ margin:'0 auto 1rem' }}></div><p style={{ color:'var(--text-muted)' }}>Securely processing your payment...</p></div>
                    )}
                    {buyModal.step === 'success' && (
                        <div style={{ textAlign:'center', padding:'1rem 0' }}><div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🎉</div><h3 style={{ marginBottom:'0.5rem', fontWeight:'bold' }}>Policy Issued Successfully!</h3><p style={{ color:'var(--text-muted)', marginBottom:'1.5rem' }}>Check your dashboard for details.</p><button onClick={closeBuyModal} style={{ padding:'0.75rem 2rem', background:'var(--primary)', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer' }}>Done</button></div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* COMPARE MODAL */}
      {showCompareModal && (
        <div className="modal-overlay-center">
           <div className="modal-box" style={{maxWidth:'1100px'}}>
             <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}><h2>Compare Plans</h2><button className="close-icon" onClick={() => setShowCompareModal(false)}>✕</button></div>
             <div style={{overflowX:'auto'}}>
             <table className="compare-table">
               <thead><tr><th>Features</th>{compareList.map(p => <th key={p.id}>{p.title}</th>)}</tr></thead>
               <tbody>
                 <tr><td><strong>Premium</strong></td>{compareList.map(p => <td key={p.id} className={p.premium === getBestValue('premium') ? 'highlight-best' : ''}>₹{p.premium.toLocaleString()}</td>)}</tr>
                 <tr><td><strong>Coverage</strong></td>{compareList.map(p => <td key={p.id}>{p.coverage_display || 'Up to ₹2 Cr'}</td>)}</tr>
                 <tr><td><strong>Claim Ratio</strong></td>{compareList.map(p => <td key={p.id} className={p.csr === getBestValue('csr') ? 'highlight-best' : ''}>{p.csr}%</td>)}</tr>
                 {Object.keys(getExtendedDetails(compareList[0])).map(key => (
                     <tr key={key}>
                         <td><strong>{key}</strong></td>
                         {compareList.map(p => <td key={p.id}>{getExtendedDetails(p)[key] || '-'}</td>)}
                     </tr>
                 ))}
               </tbody>
             </table>
             </div>
           </div>
        </div>
      )}

      {/* ✅ DETAILS MODAL (MATCHING USER PROFILE STYLE) */}
      {viewDetailsPolicy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setViewDetailsPolicy(null)}>
            <div className="card animate-slide" style={{ width: '600px', maxWidth: '95%', padding: 0, overflow:'hidden', borderRadius:'12px', background:'white', boxShadow:'0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} onClick={e => e.stopPropagation()}>
                 <div style={{ padding: '1.5rem', background: 'var(--primary)', color:'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize:'0.75rem', opacity:0.8, textTransform:'uppercase', letterSpacing:'1px', margin:0 }}>{viewDetailsPolicy.policy_type || 'Recommended'} Plan</p>
                        <h3 style={{ fontWeight: 'bold', fontSize: '1.5rem', margin:0 }}>{viewDetailsPolicy.title}</h3>
                    </div>
                    <button onClick={() => setViewDetailsPolicy(null)} style={{ background:'transparent', border:'none', color:'white', cursor:'pointer', padding:'5px' }}><CloseIcon /></button>
                 </div>
                 <div style={{ padding: '2rem', maxHeight:'70vh', overflowY:'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                         <div><p style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', margin:'0 0 4px 0' }}>Provider</p><p style={{ fontWeight:'bold', fontSize:'1rem', margin:0 }}>{viewDetailsPolicy.provider || 'Verified Partner'}</p></div>
                         <div><p style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', margin:'0 0 4px 0' }}>Match Score</p><p style={{ fontWeight:'bold', fontSize:'1rem', margin:0, color:'var(--success)' }}>{viewDetailsPolicy.match_score || 95}%</p></div>
                         <div><p style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', margin:'0 0 4px 0' }}>Claim Settlement</p><p style={{ fontWeight:'bold', fontSize:'1rem', margin:0 }}>{viewDetailsPolicy.csr || '98'}%</p></div>
                         <div><p style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', margin:'0 0 4px 0' }}>Category</p><p style={{ fontWeight:'bold', fontSize:'1rem', margin:0, textTransform:'capitalize' }}>{viewDetailsPolicy.policy_type}</p></div>
                    </div>
                    <div style={{ background:'var(--bg-app)', padding:'1.25rem', borderRadius:'0.75rem', marginBottom:'1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid var(--border)' }}>
                         <div><p style={{ fontSize:'0.75rem', margin:'0 0 4px 0', color:'var(--text-muted)' }}>Estimated Premium</p><p style={{ fontSize:'1.25rem', fontWeight:'bold', margin:0 }}>₹{(viewDetailsPolicy.premium || 0).toLocaleString()}</p></div>
                         <div style={{ textAlign:'right' }}><p style={{ fontSize:'0.75rem', margin:'0 0 4px 0', color:'var(--text-muted)' }}>Max Coverage</p><p style={{ fontSize:'1.25rem', fontWeight:'bold', color:'var(--success)', margin:0 }}>{viewDetailsPolicy.coverage_display || 'Up to ₹2 Cr'}</p></div>
                    </div>
                    <h4 style={{ fontWeight:'bold', marginBottom:'0.75rem', fontSize:'1.1rem' }}>Recommended Because:</h4>
                    <p style={{ fontSize:'0.9rem', color:'var(--text-muted)', lineHeight:'1.6', marginBottom:'1.5rem' }}>Based on your risk profile, this <strong>{viewDetailsPolicy.policy_type}</strong> plan offers the best balance of coverage and premium. It has a high match score of <strong>{viewDetailsPolicy.match_score}%</strong>.</p>
                    <h4 style={{ fontWeight:'bold', marginBottom:'0.75rem', fontSize:'1.1rem' }}>Plan Features</h4>
                    <ul style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', listStyle:'none', padding:0, margin:0 }}>{Object.entries(getExtendedDetails(viewDetailsPolicy)).map(([key, val], i) => (<li key={i} style={{ display:'flex', gap:'0.5rem', fontSize:'0.9rem', color:'var(--text-main)', alignItems:'center' }}><span style={{ color:'var(--success)', fontWeight:'bold' }}>✓</span> <span>{key}: <strong>{val}</strong></span></li>))}</ul>
                 </div>
                 <div style={{ padding: '1.5rem', borderTop:'1px solid var(--border)', display:'flex', gap:'1rem', background:'#f8fafc' }}>
                    {activePolicyIds.has(viewDetailsPolicy.id) ? (
                         <button className="select-plan-btn btn-owned" disabled style={{ width:'100%', opacity:0.7 }}>✅ Plan Active</button>
                    ) : (
                         <button className="select-plan-btn" onClick={() => { openBuyModal(viewDetailsPolicy); setViewDetailsPolicy(null); }} style={{ width:'100%' }}>Buy This Plan</button>
                    )}
                 </div>
            </div>
        </div>
      )}
    </div>
  );
};

const RecommendationCard = ({ policy, isActive, isSelected, isTopPick, onBuy, onCompare, onDetails, extendedDetails }) => {
    return (
        <div className={`rec-card ${isTopPick ? 'best-match-card' : ''}`}>
            {isTopPick && <div className="best-match-badge">🏆 Best Match</div>}
            <div className="rec-card-header">
                <span className="star-icon">{policy.policy_type === 'health' ? '🏥' : policy.policy_type === 'auto' ? '🚗' : '🛡️'}</span>
                <div><h3 style={{marginBottom:'5px'}}>{policy.title}</h3><span className="policy-provider">{policy.provider}</span></div>
            </div>
            <div className="static-coverage">Coverage: Up to ₹2 Cr</div>
            <div className="rec-price">₹{policy.premium.toLocaleString()} <small className="term">/year</small></div>
            <ul className="rec-benefits">
                <li>Match Score: <strong>{policy.match_score}/100</strong></li>
                {Object.entries(extendedDetails).slice(0, 2).map(([key, val]) => <li key={key}>✅ {key}: <strong>{val}</strong></li>)}
            </ul>
            <div className="card-actions">
                {isActive ? <button className="select-plan-btn btn-owned" disabled>✅ Active Plan</button> 
                : <button className="select-plan-btn" onClick={onBuy}>Buy Now</button>}
                <button className="details-btn" onClick={onDetails}>Details</button>
            </div>
            <div className="compare-toggle" onClick={onCompare}>
                <input type="checkbox" checked={isSelected} readOnly /> 
                {isSelected ? 'Added to Compare' : 'Add to Compare'}
            </div>
        </div>
    );
};

export default RecommendationList;
