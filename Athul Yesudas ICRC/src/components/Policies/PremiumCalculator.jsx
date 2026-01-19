import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPolicies, purchasePolicy, getMyPolicies } from '../../api'; 
import './PremiumCalculator.css';

export default function PremiumCalculator() {
    const navigate = useNavigate();
    const [allPolicies, setAllPolicies] = useState([]);
    const [activePolicyIds, setActivePolicyIds] = useState(new Set()); // ✅ Store active IDs
    const [loadingData, setLoadingData] = useState(true);
    
    const [formData, setFormData] = useState({
        age: 30,
        policyType: 'life', 
        coverageAmount: 500000, 
        selectedPolicyId: ''
    });
    
    const [result, setResult] = useState(null); 

    // Buy Modal State
    const [buyModal, setBuyModal] = useState({
        show: false, step: 'confirm', policy: null, customPrice: 0, customCoverage: 500000
    });

    // 1. Fetch Data (Policies + User's Active Plans)
    useEffect(() => {
        const loadData = async () => {
            try {
                // Parallel fetch for speed
                const [policiesData, myPoliciesData] = await Promise.all([
                    getPolicies(),
                    getMyPolicies()
                ]);

                if (Array.isArray(policiesData)) setAllPolicies(policiesData);
                
                if (Array.isArray(myPoliciesData)) {
                    // Filter only active policies and store their IDs
                    const activeSet = new Set(
                        myPoliciesData.filter(p => p.status === 'active').map(p => p.policy_id)
                    );
                    setActivePolicyIds(activeSet);
                }

            } catch (err) { console.error("Failed to load data", err); } 
            finally { setLoadingData(false); }
        };
        loadData();
    }, []);

    // ✅ Define Filtered Policies
    const filteredPolicies = allPolicies.filter(p => {
        const type = (p.type || p.policy_type || '').toLowerCase();
        return type === formData.policyType.toLowerCase();
    });

    // 2. Calculation Logic
    const calculatePremium = (data) => {
        const { age, policyType, coverageAmount, selectedPolicyId } = data;
        let baseRate = 0;
        let planTitle = "Market Standard Plan";

        // If specific plan selected
        if (selectedPolicyId) {
            const policy = allPolicies.find(p => p.id === parseInt(selectedPolicyId));
            if (policy) {
                planTitle = policy.title;
                baseRate = (policy.premium / 500000) * 1000; 
            }
        } 
        
        // Default Market Rates
        if (baseRate === 0) {
            if (policyType === 'life') baseRate = 5.5;   
            if (policyType === 'health') baseRate = 8.0; 
            if (policyType === 'auto') baseRate = 18.0;  
        }

        const ageFactor = 1 + ((parseInt(age) - 18) * 0.025);
        const estimatedAnnual = (parseInt(coverageAmount) / 1000) * baseRate * ageFactor;

        return {
            planName: planTitle,
            annual: Math.round(estimatedAnnual),
            monthly: Math.round(estimatedAnnual / 12),
            halfYearly: Math.round(estimatedAnnual / 2)
        };
    };

    // 3. Handle Changes with Validation
    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;

        // Validation Logic
        if (name === 'age') {
            if (value > 100) finalValue = 100;
        }
        if (name === 'coverageAmount') {
            if (value > 20000000) finalValue = 20000000; // Max 2 Cr
        }

        const newData = {
            ...formData,
            [name]: finalValue,
            ...(name === 'policyType' ? { selectedPolicyId: '' } : {}) 
        };
        setFormData(newData);
        setResult(calculatePremium(newData));
    };

    // Strict Validation on Blur
    const handleBlur = (e) => {
        const { name, value } = e.target;
        let cleanVal = parseInt(value) || 0;

        if (name === 'age') {
            if (cleanVal < 18) cleanVal = 18;
            if (cleanVal > 100) cleanVal = 100;
        }
        if (name === 'coverageAmount') {
            if (cleanVal < 100000) cleanVal = 100000; // Min 1 Lakh
            if (cleanVal > 20000000) cleanVal = 20000000; // Max 2 Cr
            cleanVal = Math.round(cleanVal / 1000) * 1000; 
        }

        const newData = { ...formData, [name]: cleanVal };
        setFormData(newData);
        setResult(calculatePremium(newData));
    };

    const handleQuickSelect = (amount) => {
        const newData = { ...formData, coverageAmount: amount };
        setFormData(newData);
        setResult(calculatePremium(newData));
    };

    useEffect(() => {
        if (!loadingData) setResult(calculatePremium(formData));
    }, [loadingData, allPolicies]);

    // --- BUY MODAL HANDLERS ---
    const openBuyModal = () => {
        const policy = allPolicies.find(p => p.id === parseInt(formData.selectedPolicyId));
        if (!policy) return;

        setBuyModal({ 
            show: true, 
            step: 'confirm', 
            policy: policy, 
            customCoverage: parseInt(formData.coverageAmount),
            customPrice: result.annual 
        });
    };

    const closeBuyModal = () => {
        setBuyModal({ ...buyModal, show: false });
        if(buyModal.step === 'success') {
            // Update active policies locally to show "Active" immediately
            setActivePolicyIds(prev => new Set(prev).add(buyModal.policy.id));
            navigate('/profile');
        }
    };

    const confirmPurchase = async () => {
        if (!buyModal.policy) return;
        setBuyModal(prev => ({ ...prev, step: 'processing' }));
        try {
            const res = await purchasePolicy(buyModal.policy.id, buyModal.customCoverage);
            if (res.policy_number) setBuyModal(prev => ({ ...prev, step: 'success' }));
            else alert("Failed");
        } catch { alert("Error"); }
    };

    // Helpers
    const formatRupee = (amount) => new Intl.NumberFormat('en-IN').format(amount);
    const getQuickAmounts = () => [500000, 1000000, 2500000, 5000000, 10000000];
    const formatLabel = (amt) => amt >= 10000000 ? (amt/10000000)+'Cr' : (amt/100000)+'L';

    // Receipt Math
    const basePrice = Math.round(buyModal.customPrice / 1.18);
    const taxPrice = buyModal.customPrice - basePrice;

    // ✅ CHECK ACTIVE STATUS
    const isSelectedPolicyActive = formData.selectedPolicyId && activePolicyIds.has(parseInt(formData.selectedPolicyId));

    return (
        <div className="calc-page-container">
             <div style={{width: '100%', maxWidth: '1100px', margin: '0 auto 20px', textAlign: 'left'}}>
                 <button className="back-btn" onClick={() => navigate('/')}>← Dashboard</button>
             </div>

            <div className="calculator-wrapper">
                <h1 className="calc-main-title">Premium Estimator</h1>
                
                <div className="calculator-layout">
                    {/* LEFT SIDE: FORM */}
                    <div className="calc-left">
                        <form className="calculator-form" onSubmit={(e) => e.preventDefault()}>
                            
                            <div className="form-group">
                                <label>Policy Type</label>
                                <div className="type-selector">
                                    {['life', 'health', 'auto'].map(type => (
                                        <button 
                                            key={type} type="button"
                                            className={`type-btn ${formData.policyType === type ? 'active' : ''}`} 
                                            onClick={() => handleChange({ target: { name: 'policyType', value: type } })}
                                        >
                                            {type.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Select Plan (Optional)</label>
                                <select 
                                    name="selectedPolicyId" 
                                    value={formData.selectedPolicyId} 
                                    onChange={handleChange} 
                                    className="standard-select"
                                >
                                    <option value="">-- General Market Average --</option>
                                    {filteredPolicies.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.title} {activePolicyIds.has(p.id) ? '(Active)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* AGE INPUT */}
                            {formData.policyType !== 'auto' && (
                                <div className="form-group">
                                    <label>Your Age (18 - 100)</label>
                                    <div className="slider-input-row">
                                        <input 
                                            type="range" name="age" min="18" max="100" 
                                            value={formData.age} onChange={handleChange} 
                                            className="custom-slider" 
                                        />
                                        <input 
                                            type="number" name="age" min="18" max="100" 
                                            value={formData.age} onChange={handleChange} onBlur={handleBlur}
                                            className="number-box" 
                                        />
                                    </div>
                                </div>
                            )}

                            {/* COVERAGE INPUT */}
                            <div className="form-group">
                                <label>Coverage Amount (₹1L - ₹2Cr)</label>
                                <div className="slider-input-row">
                                    <input 
                                        type="range" name="coverageAmount" 
                                        min="100000" max="20000000" step="50000" 
                                        value={formData.coverageAmount} onChange={handleChange} 
                                        className="custom-slider" 
                                    />
                                    <input 
                                        type="number" name="coverageAmount" 
                                        min="100000" max="20000000" step="1000"
                                        value={formData.coverageAmount} onChange={handleChange} onBlur={handleBlur}
                                        className="number-box large" 
                                    />
                                </div>
                                <div className="quick-select-row">
                                    {getQuickAmounts().map((amt) => (
                                        <button 
                                            key={amt} type="button" 
                                            className={`quick-btn ${parseInt(formData.coverageAmount) === amt ? 'selected' : ''}`} 
                                            onClick={() => handleQuickSelect(amt)}
                                        >
                                            {formatLabel(amt)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT SIDE: RESULTS */}
                    <div className="calc-right">
                        <div className="result-card active">
                            <div className="result-header">
                                <span className="plan-label">ESTIMATED QUOTE</span>
                                <h3>{result?.planName}</h3>
                            </div>
                            
                            <div className="main-price-box">
                                <span className="price-label">Annual Premium</span>
                                <div className="price-value">₹{formatRupee(result?.annual || 0)}</div>
                                <span className="price-sub">approx. ₹{formatRupee(result?.monthly || 0)} / mo</span>
                            </div>

                            <div className="features-list">
                                <div className="feature-item">
                                    <span>🛡️ Coverage:</span> <strong>₹{formatRupee(formData.coverageAmount)}</strong>
                                </div>
                                <div className="feature-item">
                                    <span>⏳ Term:</span> <strong>1 Year</strong>
                                </div>
                            </div>

                            {/* BUTTONS: Check if Selected Plan is Active */}
                            <div style={{display:'flex', flexDirection:'column', gap:'10px', padding:'0 30px 30px'}}>
                                {formData.selectedPolicyId ? (
                                    <>
                                        {isSelectedPolicyActive ? (
                                            <button className="apply-btn btn-owned" disabled>
                                                ✅ Active Plan
                                            </button>
                                        ) : (
                                            <button className="apply-btn" style={{margin:0}} onClick={openBuyModal}>
                                                Buy This Plan ➜
                                            </button>
                                        )}
                                        
                                        <button className="text-link-btn" onClick={() => navigate('/policies')}>
                                            or Browse Other Plans
                                        </button>
                                    </>
                                ) : (
                                    <button className="apply-btn" style={{margin:0}} onClick={() => navigate('/policies')}>
                                        Browse Plans & Buy
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BUY POPUP (Receipt Style) */}
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
                                        <div className="receipt-breakdown">
                                            <div className="line-item"><span>Coverage</span><span>₹{buyModal.customCoverage.toLocaleString()}</span></div>
                                            <div className="line-item"><span>Base Premium</span><span>₹{basePrice.toLocaleString()}</span></div>
                                            <div className="line-item"><span>GST (18%)</span><span>₹{taxPrice.toLocaleString()}</span></div>
                                            <div className="total-separator"></div>
                                            <div className="receipt-total"><span className="label">Total</span><span className="amount">₹{buyModal.customPrice.toLocaleString()}</span></div>
                                        </div>
                                    </div>
                                    <button className="btn-confirm-pay" onClick={confirmPurchase}>Proceed to Pay</button>
                                </>
                            )}
                            {buyModal.step === 'processing' && <div className="processing-step"><div className="spinner"></div><p>Processing...</p></div>}
                            {buyModal.step === 'success' && <div className="success-step"><div className="success-icon">🎉</div><h4>Success!</h4><button className="btn-done" onClick={closeBuyModal}>Done</button></div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}