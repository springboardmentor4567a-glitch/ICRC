import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPolicies, purchasePolicy, getMyPolicies } from '../../api';
import '../Recommendations/Recommendations.css'; // Shared CSS

const Policies = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [activePolicyIds, setActivePolicyIds] = useState(new Set());
  const [filter, setFilter] = useState('all');
  
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [viewDetailsPolicy, setViewDetailsPolicy] = useState(null);

  const [buyModal, setBuyModal] = useState({
    show: false, step: 'confirm', policy: null, customPrice: 0, customCoverage: 500000
  });

  useEffect(() => {
    const loadData = async () => {
      const allPols = await getPolicies();
      setPolicies(Array.isArray(allPols) ? allPols : []);
      const myPols = await getMyPolicies();
      if (Array.isArray(myPols)) {
          const activeIds = myPols.filter(p => p.status === 'active').map(p => p.policy_id);
          setActivePolicyIds(new Set(activeIds));
      }
    };
    loadData();
  }, []);

  const filteredPolicies = useMemo(() => {
    if (filter === 'all') return policies;
    return policies.filter(p => p.type === filter);
  }, [filter, policies]);

  const getExtendedDetails = (policy) => {
      if (policy.type === 'health') return { "Room Rent": "Single Private", "Bonus": "50% NCB" };
      if (policy.type === 'life') return { "Accidental": "Double Sum", "Terminal": "Covered" };
      if (policy.type === 'auto') return { "Zero Dep": "Included", "Assist": "24x7" };
      return {};
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
          customCoverage: initialCover, customPrice: calculateDynamicPrice(policy, initialCover)
      });
  };

  const updateModalCoverage = (newCoverage) => {
      setBuyModal(prev => ({
          ...prev, customCoverage: newCoverage, customPrice: calculateDynamicPrice(prev.policy, newCoverage)
      }));
  };

  const closeBuyModal = () => {
    setBuyModal({ ...buyModal, show: false });
    if(buyModal.step === 'success') setActivePolicyIds(prev => new Set(prev).add(buyModal.policy.id));
  };

  const confirmPurchase = async () => {
    if (!buyModal.policy) return;
    setBuyModal(prev => ({ ...prev, step: 'processing' }));
    const result = await purchasePolicy(buyModal.policy.id, buyModal.customCoverage);
    if (result.policy_number) setBuyModal(prev => ({ ...prev, step: 'success', resultData: result }));
    else { alert("Failed"); setBuyModal(prev => ({ ...prev, step: 'confirm' })); }
  };

  const toggleCompare = (policy) => {
    if (compareList.find(p => p.id === policy.id)) setCompareList(compareList.filter(p => p.id !== policy.id));
    else { if (compareList.length >= 3) { alert("Max 3 plans."); return; } setCompareList([...compareList, policy]); }
  };

  // Receipt Math
  const getTaxBreakdown = (total) => {
      const base = Math.round(total / 1.18);
      const tax = total - base;
      return { base, tax };
  };
  const { base, tax } = getTaxBreakdown(buyModal.customPrice);

  return (
    <div className="rec-page-container">
      <div className="rec-content-wrapper">
          <div style={{marginBottom:'20px'}}><button className="back-btn" onClick={() => navigate('/')}>← Dashboard</button></div>
          <div className="rec-header">
            <h1>Browse Policies</h1>
            <div className="filter-container">
                {['all', 'health', 'auto', 'life'].map(f => (
                    <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f.toUpperCase()}</button>
                ))}
            </div>
          </div>

          <div className="rec-grid">
            {filteredPolicies.map(policy => (
              <PolicyCard 
                key={policy.id} policy={policy} 
                isActive={activePolicyIds.has(policy.id)}
                isSelected={!!compareList.find(p => p.id === policy.id)}
                onBuy={() => openBuyModal(policy)}
                onCompare={() => toggleCompare(policy)}
                onDetails={() => setViewDetailsPolicy(policy)}
                extendedDetails={getExtendedDetails(policy)}
              />
            ))}
          </div>
      </div>

      {/* COMPARE BAR */}
      {compareList.length > 0 && (
        <div className="compare-bar-fixed">
          <div className="compare-content">
              <div className="compare-text">Comparing <span className="badge">{compareList.length}</span> Plans</div>
              <div className="compare-buttons"><button className="btn-compare-action" onClick={() => setShowCompareModal(true)}>Compare Now</button><button className="btn-clear" onClick={() => setCompareList([])}>Clear</button></div>
          </div>
        </div>
      )}

      {/* ✅ NEW RECEIPT-STYLE BUY POPUP */}
      {buyModal.show && (
        <div className="drawer-overlay">
            <div className="drawer-content">
                <div className="drawer-header"><h3>Order Summary</h3><button className="close-icon" onClick={closeBuyModal}>✕</button></div>
                <div className="drawer-body">
                    {buyModal.step === 'confirm' && (
                        <>
                            <div className="receipt-card">
                                <div className="receipt-header">
                                    <h4>{buyModal.policy.title}</h4>
                                    <span className="provider-badge">{buyModal.policy.provider}</span>
                                </div>
                                <div className="receipt-config">
                                    <div className="config-label"><span>Coverage Amount</span><span className="config-val">₹{buyModal.customCoverage.toLocaleString()}</span></div>
                                    <input type="range" min="500000" max="20000000" step="500000" value={buyModal.customCoverage} onChange={(e) => updateModalCoverage(parseInt(e.target.value))} className="custom-range"/>
                                    <div className="quick-pills">
                                        {[500000, 1000000, 5000000, 10000000].map(amt => (
                                            <button key={amt} className={`pill-btn ${buyModal.customCoverage === amt ? 'selected' : ''}`} onClick={() => updateModalCoverage(amt)}>{amt >= 10000000 ? (amt/10000000)+'Cr' : (amt/100000)+'L'}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="receipt-breakdown">
                                    <div className="line-item"><span>Base Premium</span><span>₹{base.toLocaleString()}</span></div>
                                    <div className="line-item"><span>GST (18%)</span><span>₹{tax.toLocaleString()}</span></div>
                                    <div className="total-separator"></div>
                                    <div className="receipt-total"><span className="label">Total Payable</span><span className="amount">₹{buyModal.customPrice.toLocaleString()}</span></div>
                                </div>
                            </div>
                            <div className="policy-benefits-tags"><span className="benefit-tag">🔒 256-Bit SSL Secure</span><span className="benefit-tag">🛡️ 15-Day Free Look</span></div>
                            <button className="btn-confirm-pay" onClick={confirmPurchase}><span>Proceed to Pay</span> <span>➜</span></button>
                            <div className="secure-badge">🔒 Your transaction is secured by Infosys Finacle</div>
                        </>
                    )}
                    {buyModal.step === 'processing' && <div className="processing-step"><div className="spinner"></div><p>Processing...</p></div>}
                    {buyModal.step === 'success' && <div className="success-step"><div className="success-icon">🎉</div><h4>Policy Issued!</h4><button className="btn-done" onClick={closeBuyModal}>Done</button></div>}
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
                        <li>Comprehensive Cover</li>
                        <li>Cashless Network</li>
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

      {/* COMPARE MODAL */}
      {showCompareModal && (
        <div className="modal-overlay-center">
           <div className="modal-box" style={{maxWidth:'1100px'}}>
             <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}><h2>Compare Plans</h2><button className="close-icon" onClick={() => setShowCompareModal(false)}>✕</button></div>
             <table className="compare-table">
               <thead><tr><th>Features</th>{compareList.map(p => <th key={p.id}>{p.title}</th>)}</tr></thead>
               <tbody>
                 <tr><td><strong>Premium</strong></td>{compareList.map(p => <td key={p.id} className={p.premium === Math.min(...compareList.map(i=>i.premium)) ? 'highlight-best' : ''}>₹{p.premium.toLocaleString()}</td>)}</tr>
                 <tr><td><strong>Coverage</strong></td>{compareList.map(p => <td key={p.id}>{p.coverage_display || 'Up to ₹1 Cr'}</td>)}</tr>
                 {Object.keys(getExtendedDetails(compareList[0])).map(key => (
                     <tr key={key}><td><strong>{key}</strong></td>{compareList.map(p => <td key={p.id}>{getExtendedDetails(p)[key] || '-'}</td>)}</tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
};

const PolicyCard = ({ policy, isActive, isSelected, onBuy, onCompare, onDetails, extendedDetails }) => {
  return (
    <div className={`rec-card ${isSelected ? 'best-match-card' : ''}`}>
      <h3 style={{marginTop:0}}>{policy.title}</h3>
      <span className="policy-provider">{policy.provider}</span>
      <div className="static-coverage">Coverage: Up to ₹1 Cr</div>
      <div className="rec-price">₹{policy.premium.toLocaleString()} <small className="term">/ year</small></div>
      <ul className="rec-benefits">
          {Object.entries(extendedDetails).slice(0, 2).map(([key, val]) => <li key={key}>✅ {key}: <strong>{val}</strong></li>)}
      </ul>
      <div className="card-actions">
        {isActive ? <button className="select-plan-btn btn-owned" disabled>✅ Active</button>
        : <button className="select-plan-btn" onClick={onBuy}>Buy Now</button>}
        <button className="details-btn" onClick={onDetails}>Details</button>
      </div>
      <div className="compare-toggle" onClick={onCompare}>
          <input type="checkbox" checked={isSelected} readOnly /> {isSelected ? 'Added to Compare' : 'Add to Compare'}
      </div>
    </div>
  );
};

export default Policies;