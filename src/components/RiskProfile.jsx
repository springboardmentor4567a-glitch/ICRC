import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RiskProfile.css'; 

const RiskProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    age: '',
    occupation: '',
    income: '',
    dependents: '',
    policy_types: [], // Stores selected types e.g. ['health', 'auto']
    health: 'good',
    smoker: false, 
    vehicle_ownership: false
  });

  // 1. Fetch existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const response = await fetch('http://127.0.0.1:5000/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.risk_profile) {
            setFormData(prev => ({
                ...prev,
                ...data.risk_profile,
                // Ensure policy_types is always an array
                policy_types: Array.isArray(data.risk_profile.policy_types) ? data.risk_profile.policy_types : []
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch existing profile", err);
      }
    };
    fetchProfile();
  }, []);

  // Handle Text/Select Inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  // ✅ FIXED: Correctly toggle policy types
  const handlePolicyTypeChange = (e) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
        let newTypes = prev.policy_types ? [...prev.policy_types] : [];
        if (checked) {
            if (!newTypes.includes(value)) newTypes.push(value);
        } else {
            newTypes = newTypes.filter(type => type !== value);
        }
        return { ...prev, policy_types: newTypes };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.policy_types.length === 0) {
        alert("Please select at least one policy type.");
        return;
    }

    setLoading(true);
    setError('');

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert("Please login first.");
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 401) throw new Error("Unauthorized");
      if (!response.ok) throw new Error('Server error');

      localStorage.setItem('userRiskProfile', JSON.stringify(formData));
      navigate('/recommendations');

    } catch (err) {
      console.error("API Error:", err);
      if (err.message.includes("Unauthorized")) {
        alert("Session expired. Please log in again.");
        navigate('/login');
      } else {
        setError('Failed to save profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helpers for conditional rendering
  const showHealthFields = formData.policy_types.includes('health') || formData.policy_types.includes('life');
  const showAutoFields = formData.policy_types.includes('auto');

  return (
    <div className="risk-profile-wrapper">
      <div className="risk-profile-container">
        
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back to Dashboard
          </button>
        </div>

        <h2>Risk Assessment</h2>
        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          
          {/* --- 1. Policy Interest (TILES) --- */}
          <div className="form-group">
            <label>I am looking for recommendations on:</label>
            
            {/* ✅ FIXED: Used 'label' tag instead of 'div' so clicking works */}
            <div className="policy-type-grid">
                
                {/* Health Tile */}
                <label className="policy-card-checkbox">
                    <input 
                        type="checkbox" 
                        value="health" 
                        checked={formData.policy_types.includes('health')} 
                        onChange={handlePolicyTypeChange} 
                    />
                    <div className="policy-card-label">
                        <span style={{fontSize:'1.5rem', marginBottom:'5px'}}>🏥</span>
                        Health
                    </div>
                </label>

                {/* Life Tile */}
                <label className="policy-card-checkbox">
                    <input 
                        type="checkbox" 
                        value="life" 
                        checked={formData.policy_types.includes('life')} 
                        onChange={handlePolicyTypeChange} 
                    />
                    <div className="policy-card-label">
                        <span style={{fontSize:'1.5rem', marginBottom:'5px'}}>🛡️</span>
                        Life
                    </div>
                </label>

                {/* Auto Tile */}
                <label className="policy-card-checkbox">
                    <input 
                        type="checkbox" 
                        value="auto" 
                        checked={formData.policy_types.includes('auto')} 
                        onChange={handlePolicyTypeChange} 
                    />
                    <div className="policy-card-label">
                        <span style={{fontSize:'1.5rem', marginBottom:'5px'}}>🚗</span>
                        Auto
                    </div>
                </label>
            </div>
          </div>

          <hr style={{margin: '30px 0', border: '0', borderTop: '1px solid #e2e8f0'}} />

          {/* --- 2. Basic Info (Grid) --- */}
          <div className="form-grid">
            <div className="form-group">
                <label>Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} required placeholder="e.g. 30" />
            </div>

            <div className="form-group">
                <label>Annual Income (₹)</label>
                <input 
                    type="text" 
                    name="income" 
                    value={formData.income ? Number(formData.income).toLocaleString('en-IN') : ''} 
                    onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, ''); 
                        if (!isNaN(rawValue)) { 
                            handleChange({ target: { name: 'income', value: rawValue } });
                        }
                    }} 
                    required 
                    placeholder="e.g. 5,00,000" 
                />
            </div>

            <div className="form-group">
                <label>Occupation</label>
                <select name="occupation" value={formData.occupation} onChange={handleChange} required>
                <option value="">Select Occupation</option>
                <option value="salaried">Salaried</option>
                <option value="business">Business / Self-Employed</option>
                <option value="student">Student</option>
                </select>
            </div>

            {/* Show Dependents if Health/Life is selected OR nothing selected yet */}
            {(showHealthFields || formData.policy_types.length === 0) && (
                <div className="form-group">
                    <label>Dependents</label>
                    <input type="number" name="dependents" value={formData.dependents} onChange={handleChange} placeholder="0" />
                </div>
            )}
          </div>

          {/* --- 3. Conditional Sections --- */}
          
          {showHealthFields && (
            <div className="conditional-section">
                <h4 style={{marginBottom:'15px', color:'#2c3e50', marginTop:0}}>Health & Lifestyle</h4>
                <div className="form-group">
                    <label>Current Health Condition</label>
                    <select name="health" value={formData.health} onChange={handleChange}>
                        <option value="good">Good (No issues)</option>
                        <option value="average">Average</option>
                        <option value="poor">Pre-existing Condition</option>
                    </select>
                </div>
                <div className="form-group checkbox-row">
                    <input 
                        type="checkbox" 
                        name="smoker" 
                        id="smokerCheck"
                        checked={formData.smoker || false} 
                        onChange={handleChange} 
                    />
                    <label htmlFor="smokerCheck">Do you smoke or consume alcohol?</label>
                </div>
            </div>
          )}

          {showAutoFields && (
            <div className="conditional-section">
                <h4 style={{marginBottom:'15px', color:'#2c3e50', marginTop:0}}>Vehicle Details</h4>
                <div className="form-group checkbox-row">
                    <input 
                        type="checkbox" 
                        name="vehicle_ownership" 
                        id="vehicleCheck"
                        checked={formData.vehicle_ownership || false} 
                        onChange={handleChange} 
                    />
                    <label htmlFor="vehicleCheck">I own a vehicle (Car/Bike)</label>
                </div>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Analyzing Profile...' : 'Generate Recommendations'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RiskProfile;