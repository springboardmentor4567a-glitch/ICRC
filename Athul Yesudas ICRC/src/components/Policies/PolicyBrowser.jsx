import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPolicies } from '../../api'; 
import './PremiumCalculator.css';

export default function PremiumCalculator() {
    const navigate = useNavigate();
    
    // Store Real Policies from DB
    const [allPolicies, setAllPolicies] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    
    const [formData, setFormData] = useState({
        age: 30,
        policyType: 'life', // 'life', 'health', 'auto'
        coverageAmount: 500000, 
        selectedPolicyId: ''
    });
    
    const [result, setResult] = useState(null); 

    // 1. Fetch Real Policies from Backend on Load
    useEffect(() => {
        const loadPolicies = async () => {
            try {
                const data = await getPolicies();
                if (Array.isArray(data)) {
                    setAllPolicies(data);
                }
            } catch (err) {
                console.error("Failed to load policies for dropdown", err);
            } finally {
                setLoadingData(false);
            }
        };
        loadPolicies();
    }, []);

    // 2. Filter Policies for Dropdown
    const filteredPolicies = allPolicies.filter(p => {
        const type = (p.type || p.policy_type || '').toLowerCase();
        return type === formData.policyType.toLowerCase();
    });

    // 3. Calculation Logic
    const calculatePremium = (data) => {
        const { age, policyType, coverageAmount, selectedPolicyId } = data;
        
        // A. Determine Base Rate (Per 1000 Sum Assured)
        let baseRate = 0;
        let planTitle = "Market Standard Plan";

        if (selectedPolicyId) {
            // Case 1: Specific Plan Selected -> Use its REAL premium
            const policy = allPolicies.find(p => p.id === parseInt(selectedPolicyId));
            if (policy) {
                planTitle = policy.title;
                // Calculate base rate from the real policy premium (assuming standard coverage base)
                baseRate = (policy.premium / 500000) * 1000; 
            }
        } 
        
        // Case 2: No Plan Selected -> Use Market Averages
        if (baseRate === 0) {
            if (policyType === 'life') baseRate = 5.5;   
            if (policyType === 'health') baseRate = 8.0; 
            if (policyType === 'auto') baseRate = 18.0;  
        }

        // B. Apply Age Loading (2.5% increase per year over 18)
        const ageFactor = 1 + ((parseInt(age) - 18) * 0.025);
        
        // C. Final Formula
        const estimatedAnnual = (parseInt(coverageAmount) / 1000) * baseRate * ageFactor;

        return {
            planName: planTitle,
            annual: Math.round(estimatedAnnual),
            monthly: Math.round(estimatedAnnual / 12),
            halfYearly: Math.round(estimatedAnnual / 2)
        };
    };

    // 4. Handle Input Changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        const newData = {
            ...formData,
            [name]: value,
            // If type changes, reset the specific plan selection
            ...(name === 'policyType' ? { selectedPolicyId: '' } : {}) 
        };
        
        setFormData(newData);
        setResult(calculatePremium(newData));
    };

    const handleQuickSelect = (amount) => {
        const newData = { ...formData, coverageAmount: amount };
        setFormData(newData);
        setResult(calculatePremium(newData));
    };

    // Initial Calc
    useEffect(() => {
        if (!loadingData) {
            setResult(calculatePremium(formData));
        }
    }, [loadingData, allPolicies]);

    // Helpers
    const formatRupee = (amount) => new Intl.NumberFormat('en-IN').format(amount);
    
    const getQuickAmounts = () => {
        if (formData.policyType === 'life') return [5000000, 10000000, 20000000]; // 50L, 1Cr, 2Cr
        if (formData.policyType === 'health') return [500000, 1000000, 1500000]; // 5L, 10L, 15L
        return [500000, 1000000, 1500000]; // Auto
    };

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
                            
                            {/* Policy Type Tabs */}
                            <div className="form-group">
                                <label>Policy Type</label>
                                <div className="type-selector">
                                    {['life', 'health', 'auto'].map(type => (
                                        <button 
                                            key={type} 
                                            type="button"
                                            className={`type-btn ${formData.policyType === type ? 'active' : ''}`} 
                                            onClick={() => handleChange({ target: { name: 'policyType', value: type } })}
                                        >
                                            {type.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Plan Selection Dropdown */}
                            <div className="form-group">
                                <label>Select Specific Plan (Optional)</label>
                                <select 
                                    name="selectedPolicyId" 
                                    value={formData.selectedPolicyId} 
                                    onChange={handleChange} 
                                    className="standard-select"
                                >
                                    <option value="">-- General Market Estimate --</option>
                                    {filteredPolicies.length > 0 ? (
                                        filteredPolicies.map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))
                                    ) : (
                                        <option disabled>No plans available for this category</option>
                                    )}
                                </select>
                            </div>

                            {/* ✅ UPDATED Age Input (Slider + Number Box) */}
                            {formData.policyType !== 'auto' && (
                                <div className="form-group">
                                    <label>Your Age</label>
                                    <div className="slider-input-row">
                                        <input 
                                            type="range" name="age" min="18" max="70" 
                                            value={formData.age} onChange={handleChange} 
                                            className="custom-slider" 
                                        />
                                        <input 
                                            type="number" name="age" min="18" max="70" 
                                            value={formData.age} onChange={handleChange} 
                                            className="number-box" 
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Coverage Slider */}
                            <div className="form-group">
                                <label>{formData.policyType === 'auto' ? 'Vehicle Value (IDV)' : 'Coverage Amount'}</label>
                                <div className="slider-input-row">
                                    <input 
                                        type="range" name="coverageAmount" 
                                        min="100000" max="20000000" step="50000" 
                                        value={formData.coverageAmount} onChange={handleChange} 
                                        className="custom-slider" 
                                    />
                                    <input 
                                        type="number" name="coverageAmount" 
                                        value={formData.coverageAmount} onChange={handleChange} 
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
                                            {amt >= 10000000 ? (amt/10000000)+'Cr' : (amt/100000)+'L'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </form>
                    </div>

                    {/* RIGHT SIDE: RESULTS CARD */}
                    <div className="calc-right">
                        <div className="result-card active">
                            <div className="result-header">
                                <span className="plan-label">ESTIMATED PREMIUM FOR</span>
                                <h3>{result?.planName}</h3>
                            </div>
                            
                            <div className="price-breakdown">
                                <div className="price-row highlight">
                                    <span className="label">Monthly</span>
                                    <span className="amount">₹{formatRupee(result?.monthly || 0)}</span>
                                </div>
                                <div className="divider"></div>
                                <div className="price-row">
                                    <span className="label">Annually</span>
                                    <span className="amount">₹{formatRupee(result?.annual || 0)}</span>
                                </div>
                            </div>

                            <button className="apply-btn" onClick={() => navigate('/policies')}>
                                Browse & Buy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}