import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendations, purchasePolicy, getMyPolicies } from '../../api';
import './Recommendations.css'; 

const RecommendationList = () => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePolicyIds, setActivePolicyIds] = useState(new Set());
  const [filter, setFilter] = useState('all');
  
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

  // --- Logic Helpers ---
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
            alert("Failed"); setBuyModal(prev => ({ ...prev, step: 'confirm' }));
        }
    } catch { alert("Error"); setBuyModal(prev => ({ ...prev, step: 'confirm' })); }
  };

  const toggleCompare = (policy) => {
    if (compareList.find(p => p.id === policy.id)) setCompareList(compareList.filter(p => p.id !== policy.id));
    else { if (compareList.length >= 3) { alert("Max 3 plans."); return; } setCompareList([...compareList, policy]); }
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

      {/* ✅ IMPROVED BUY POPUP */}
      {buyModal.show && (
        <div className="drawer-overlay">
            <div className="drawer-content">
                <div className="drawer-header"><h3>Customize Plan</h3><button className="close-icon" onClick={closeBuyModal}>✕</button></div>
                <div className="drawer-body">
                    {buyModal.step === 'confirm' && (
                        <>
                            <div className="plan-summary">
                                <h4 style={{marginTop:0}}>{buyModal.policy.title}</h4>
                                <div className="summary-row"><span>Provider</span><strong>{buyModal.policy.provider}</strong></div>
                                <div className="summary-row"><span>Trust Score</span><strong>{buyModal.policy.csr}%</strong></div>
                            </div>

                            <div className="popup-slider-section">
                                <div className="popup-slider-label">
                                    <span>Coverage Amount</span>
                                    <span style={{color:'#2563eb'}}>₹{buyModal.customCoverage.toLocaleString()}</span>
                                </div>
                                <input 
                                    type="range" min="500000" max="20000000" step="500000" 
                                    value={buyModal.customCoverage} 
                                    onChange={(e) => updateModalCoverage(parseInt(e.target.value))} 
                                    className="custom-range"
                                />
                                <div className="quick-pills">
                                    {[500000, 1000000, 5000000, 10000000, 20000000].map(amt => (
                                        <button 
                                            key={amt} 
                                            className={`pill-btn ${buyModal.customCoverage === amt ? 'selected' : ''}`}
                                            onClick={() => updateModalCoverage(amt)}
                                        >
                                            {amt >= 10000000 ? (amt/10000000)+'Cr' : (amt/100000)+'L'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="price-breakdown-box">
                                <div className="total-row"><span>Final Premium</span><span>₹{buyModal.customPrice.toLocaleString()}</span></div>
                            </div>
                            
                            <button className="btn-confirm-pay" onClick={confirmPurchase}>Proceed to Pay</button>
                        </>
                    )}
                    {buyModal.step === 'processing' && <div className="processing-step"><div className="spinner"></div><p>Secure Payment...</p></div>}
                    {buyModal.step === 'success' && <div className="success-step"><div className="success-icon">🎉</div><h4>Policy Issued!</h4><button className="btn-done" onClick={closeBuyModal}>Done</button></div>}
                </div>
            </div>
        </div>
      )}

      {/* ✅ RESTORED COMPARE MODAL */}
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
                 
                 {/* Extended Features */}
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

      {/* DETAILS MODAL */}
      {viewDetailsPolicy && (
        <div className="modal-overlay-center">
            <div className="modal-box">
                <div style={{display:'flex', justifyContent:'space-between'}}><h2>{viewDetailsPolicy.title}</h2><button className="close-icon" onClick={() => setViewDetailsPolicy(null)}>✕</button></div>
                <div style={{background:'#f8fafc', padding:'20px', borderRadius:'12px', margin:'20px 0'}}>
                    <h4>Plan Features</h4>
                    <ul className="details-list">
                        <li><strong>Standard Coverage:</strong> Up to ₹2 Cr</li>
                        <li><strong>Claim Ratio:</strong> {viewDetailsPolicy.csr}%</li>
                        {Object.entries(getExtendedDetails(viewDetailsPolicy)).map(([key, val]) => (
                            <li key={key}><strong>{key}:</strong> {val}</li>
                        ))}
                    </ul>
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                    <button className="select-plan-btn" onClick={() => { openBuyModal(viewDetailsPolicy); setViewDetailsPolicy(null); }}>Buy Now</button>
                    <button className="details-btn" onClick={() => setViewDetailsPolicy(null)}>Close</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// CLEAN CARD (No Slider)
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