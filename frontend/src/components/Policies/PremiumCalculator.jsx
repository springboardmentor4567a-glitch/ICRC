import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPolicies, purchasePolicy, getMyPolicies } from '../../api'; 
import './PremiumCalculator.css';

export default function PremiumCalculator() {
    const navigate = useNavigate();
    const [allPolicies, setAllPolicies] = useState([]);
    const [activePolicyIds, setActivePolicyIds] = useState(new Set()); 
    const [loadingData, setLoadingData] = useState(true);
    
    // Default values
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

    // 1. Fetch Data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [policiesData, myPoliciesData] = await Promise.all([
                    getPolicies(),
                    getMyPolicies()
                ]);

                if (Array.isArray(policiesData)) setAllPolicies(policiesData);
                
                if (Array.isArray(myPoliciesData)) {
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

    // 2. Calculation Logic
    const calculatePremium = useCallback((data) => {
        const { age, policyType, coverageAmount, selectedPolicyId } = data;
        let baseRate = 0;
        let planTitle = "Market Standard Plan";

        // Logic: For live estimation, treat invalid inputs safely (without blocking typing)
        const numericAge = parseInt(age);
        const calculationAge = isNaN(numericAge) || numericAge < 18 ? 18 : numericAge;

        const numericCoverage = parseInt(coverageAmount);
        const calculationCoverage = isNaN(numericCoverage) || numericCoverage < 500000 ? 500000 : numericCoverage;

        // If specific plan selected
        if (selectedPolicyId) {
            const policy = allPolicies.find(p => p.id === parseInt(selectedPolicyId));
            if (policy) {
                planTitle = policy.title;
                baseRate = (policy.premium / 500000) * 1000; 
            }
        } 
        
        // Default Market Rates (fallback)
        if (baseRate === 0) {
            if (policyType === 'life') baseRate = 5.5;   
            if (policyType === 'health') baseRate = 8.0; 
            if (policyType === 'auto') baseRate = 18.0;  
        }

        const ageFactor = 1 + ((calculationAge - 18) * 0.025);
        const estimatedAnnual = (calculationCoverage / 1000) * baseRate * ageFactor;

        return {
            planName: planTitle,
            annual: Math.round(estimatedAnnual),
            monthly: Math.round(estimatedAnnual / 12),
            halfYearly: Math.round(estimatedAnnual / 2)
        };
    }, [allPolicies]); 

    const filteredPolicies = allPolicies.filter(p => {
        const type = (p.type || p.policy_type || '').toLowerCase();
        return type === formData.policyType.toLowerCase();
    });

    // Handle Input Changes (Allows typing freely)
    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;

        if (name === 'age') {
            if (value === '') finalValue = ''; 
            else {
                let val = parseInt(value);
                if (val > 100) finalValue = 100;
            }
        }
        
        if (name === 'coverageAmount') {
            if (value === '') finalValue = '';
            else {
                let val = parseInt(value);
                if (val > 20000000) finalValue = 20000000;
            }
        }

        const newData = {
            ...formData,
            [name]: finalValue,
            ...(name === 'policyType' ? { selectedPolicyId: '' } : {}) 
        };
        setFormData(newData);
        setResult(calculatePremium(newData));
    };

    // Auto-correct on Blur (Optional convenience)
    const handleBlur = (e) => {
        const { name, value } = e.target;
        let cleanVal = parseInt(value) || 0;

        if (name === 'age') {
            if (cleanVal < 18) cleanVal = 18;
            if (cleanVal > 100) cleanVal = 100;
        }
        if (name === 'coverageAmount') {
            if (cleanVal < 500000) cleanVal = 500000; 
            if (cleanVal > 20000000) cleanVal = 20000000; 
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
    }, [loadingData, formData, calculatePremium]);

    // --- BUY MODAL HANDLERS ---
    
    // ✅ STRICT VALIDATION BEFORE OPENING MODAL
    const openBuyModal = () => {
        // 1. Validate Age
        const ageVal = parseInt(formData.age);
        if (!ageVal || ageVal < 18 || ageVal > 100) {
            alert("Age must be between 18 and 100 to purchase a policy.");
            return;
        }

        // 2. Validate Coverage
        const coverageVal = parseInt(formData.coverageAmount);
        if (!coverageVal || coverageVal < 500000 || coverageVal > 20000000) {
            alert("Minimum coverage amount allowed is ₹5,00,000 (5 Lakhs).");
            return;
        }

        // 3. Find Policy
        const policy = allPolicies.find(p => p.id === parseInt(formData.selectedPolicyId));
        if (!policy) {
            alert("Please select a specific plan from the list to proceed.");
            return;
        }

        setBuyModal({ 
            show: true, 
            step: 'confirm', 
            policy: policy, 
            customCoverage: coverageVal,
            customPrice: result.annual 
        });
    };

    const closeBuyModal = () => {
        setBuyModal({ ...buyModal, show: false });
        if(buyModal.step === 'success') {
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
            else alert("Failed to purchase policy.");
        } catch { alert("Transaction Failed. Please try again."); }
    };

    // Helpers
    const formatRupee = (amount) => new Intl.NumberFormat('en-IN').format(amount);
    const getQuickAmounts = () => [500000, 1000000, 2500000, 5000000, 10000000];
    const formatLabel = (amt) => amt >= 10000000 ? (amt/10000000)+'Cr' : (amt/100000)+'L';

    const basePrice = Math.round(buyModal.customPrice / 1.18);
    const taxPrice = buyModal.customPrice - basePrice;

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
                                            value={parseInt(formData.age) || 18} 
                                            onChange={handleChange} 
                                            className="custom-slider" 
                                        />
                                        <input 
                                            type="number" name="age" min="18" max="100" 
                                            value={formData.age} 
                                            onChange={handleChange} 
                                            onBlur={handleBlur}
                                            className="number-box" 
                                        />
                                    </div>
                                </div>
                            )}

                            {/* COVERAGE INPUT */}
                            <div className="form-group">
                                <label>Coverage Amount (Min: ₹5L)</label>
                                <div className="slider-input-row">
                                    <input 
                                        type="range" name="coverageAmount" 
                                        min="500000" max="20000000" step="50000" 
                                        value={parseInt(formData.coverageAmount) || 500000} 
                                        onChange={handleChange} 
                                        className="custom-slider" 
                                    />
                                    <input 
                                        type="number" name="coverageAmount" 
                                        min="500000" max="20000000" step="1000"
                                        value={formData.coverageAmount} 
                                        onChange={handleChange} 
                                        onBlur={handleBlur}
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
                                    <span>🛡️ Coverage:</span> 
                                    <strong>₹{formatRupee(Math.max(parseInt(formData.coverageAmount) || 0, 500000))}</strong>
                                </div>
                                <div className="feature-item">
                                    <span>⏳ Term:</span> <strong>1 Year</strong>
                                </div>
                            </div>

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

            {/* BUY POPUP */}
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