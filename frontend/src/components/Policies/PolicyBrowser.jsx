import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPolicies, getMyPolicies } from '../../api'; 
import './PolicyList.css';

const PolicyList = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [purchasedIds, setPurchasedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  
  // ✅ DETAILS MODAL STATE
  const [viewDetailsPolicy, setViewDetailsPolicy] = useState(null);

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

  const handleBuy = (policyId) => {
    navigate(`/purchase/${policyId}`);
  };

  // Helper for extra details
  const getFeatures = (type) => {
      if (type === 'health') return { "Room Rent": "Single Private", "Waiting Period": "2 Years" };
      if (type === 'life') return { "Terminal Illness": "Covered", "Accidental": "Double Sum" };
      return { "Zero Dep": "Included", "NCB": "Yes" };
  };

  if (loading) return <div className="loading-spinner">Loading plans...</div>;

  return (
    <div className="policy-page">
      <div className="policy-header">
        <h1>Insurance Plans</h1>
        <p>Choose the best protection for you and your family.</p>
      </div>

      <div className="policy-grid">
        {policies.map((policy) => {
          const isOwned = purchasedIds.has(policy.id);

          return (
            <div key={policy.id} className={`policy-card ${isOwned ? 'owned-card' : ''}`}>
              <div className="policy-badge">{policy.type || 'General'}</div>
              <h3>{policy.title}</h3>
              <div className="policy-provider">{policy.provider}</div>
              
              <div className="policy-price">
                ₹{policy.premium.toLocaleString()} <span>/year</span>
              </div>

              <div className="policy-features">
                <div className="feature-row">
                  <span>Coverage</span>
                  <strong>₹{policy.coverage?.max ? policy.coverage.max.toLocaleString() : 'N/A'}</strong>
                </div>
                <div className="feature-row">
                  <span>Term</span>
                  <strong>{policy.term_months} Months</strong>
                </div>
              </div>

              <div className="card-actions-row" style={{display:'flex', gap:'10px', marginTop:'15px'}}>
                  {isOwned ? (
                    <button className="buy-btn owned" disabled>✅ Active</button>
                  ) : (
                    <button className="buy-btn" onClick={() => handleBuy(policy.id)}>Buy Now</button>
                  )}
                  {/* ✅ Added Details Button */}
                  <button className="buy-btn secondary" onClick={() => setViewDetailsPolicy(policy)}>Details</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ DETAILS MODAL FOR BROWSE POLICIES */}
      {viewDetailsPolicy && (
        <div className="modal-overlay-center">
            <div className="modal-box">
                <div style={{display:'flex', justifyContent:'space-between'}}><h2>{viewDetailsPolicy.title}</h2><button className="close-icon" onClick={() => setViewDetailsPolicy(null)}>✕</button></div>
                <div style={{background:'#f8fafc', padding:'20px', borderRadius:'12px', margin:'20px 0'}}>
                    <h4>Full Details</h4>
                    <ul className="details-list">
                        <li><strong>Provider:</strong> {viewDetailsPolicy.provider}</li>
                        <li><strong>Coverage Limit:</strong> ₹{viewDetailsPolicy.coverage?.max?.toLocaleString()}</li>
                        <li><strong>Deductible:</strong> ₹{viewDetailsPolicy.deductible}</li>
                        {Object.entries(getFeatures(viewDetailsPolicy.type)).map(([key, val]) => (
                            <li key={key}><strong>{key}:</strong> {val}</li>
                        ))}
                    </ul>
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                    {/* ✅ Check ownership here too */}
                    {purchasedIds.has(viewDetailsPolicy.id) ? (
                        <button className="buy-btn owned" disabled>✅ Active Plan</button>
                    ) : (
                        <button className="buy-btn" onClick={() => handleBuy(viewDetailsPolicy.id)}>Buy Now</button>
                    )}
                    <button className="buy-btn secondary" onClick={() => setViewDetailsPolicy(null)}>Close</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PolicyList;