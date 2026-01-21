import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from "./authContext";
import { useNavigate } from 'react-router-dom';

const samplePolicies = [
  {
    id: 1,
    name: 'Jeevan Anand',
    provider: 'LIC',
    category: 'Life',
    coverage: 10000000,
    priceBase: 25000,
    rating: 4.2,
    features: 'Death benefit, Maturity benefit, Loan facility, Surrender value'
  },
  {
    id: 2,
    name: 'Health Shield',
    provider: 'HDFC',
    category: 'Health',
    coverage: 500000,
    priceBase: 15000,
    rating: 4.5,
    features: 'Hospitalization cover, Day care procedures, Pre-existing diseases, Maternity cover'
  },
  {
    id: 3,
    name: 'Motor Secure',
    provider: 'ICICI',
    category: 'Auto',
    coverage: 800000,
    priceBase: 12000,
    rating: 4.0,
    features: 'Third party liability, Own damage cover, Personal accident cover, Roadside assistance'
  },
  {
    id: 4,
    name: 'Smart Wealth',
    provider: 'Max Life',
    category: 'Life',
    coverage: 15000000,
    priceBase: 32000,
    rating: 4.3,
    features: 'Investment growth, Life protection, Tax benefits, Flexible premiums'
  },
  {
    id: 5,
    name: 'Complete Health Plus',
    provider: 'Star Health',
    category: 'Health',
    coverage: 750000,
    priceBase: 18000,
    rating: 4.4,
    features: 'Cashless hospitalization, Critical illness cover, OPD expenses, Wellness programs'
  },
  {
    id: 6,
    name: 'Two Wheeler Secure',
    provider: 'Bajaj Allianz',
    category: 'Auto',
    coverage: 300000,
    priceBase: 8000,
    rating: 3.8,
    features: 'Third party liability, Own damage, Add-on covers, Zero depreciation'
  }
];

function PolicyCard({ policy, isSelected, onToggleSelect }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCoverage = (amount) => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
      return `${(amount / 100000).toFixed(1)} L`;
    }
    return formatCurrency(amount);
  };

  return (
    <div className={`policy-card ${isSelected ? 'selected' : ''}`}>
      <div className="card-header">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(policy)}
          className="policy-checkbox"
        />
        <div className={`type-badge ${policy.category.toLowerCase()}`}>{policy.category.toUpperCase()}</div>
        <div>
          <h3>{policy.name}</h3>
          <p>{policy.provider}</p>
        </div>
      </div>

      <div className="policy-details">
        <div className="detail-row">
          <span className="detail-label">Coverage:</span>
          <span className="detail-value">{formatCoverage(policy.coverage)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Premium:</span>
          <span className="detail-value">{formatCurrency(policy.priceBase)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Rating:</span>
          <span className="detail-value">⭐ {policy.rating}/5.0</span>
        </div>
      </div>

      <div className="card-actions">
        <button className="primary">View Details</button>
        <button className="secondary">T&Cs</button>
      </div>
    </div>
  );
}

export default function PolicyCatalog() {
  const { user, logout, getPolicies } = useAuth();
  const navigate = useNavigate();
  const [policies] = useState(samplePolicies);
  const [filters, setFilters] = useState({ type: 'all', search: '' });
  const [selected, setSelected] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const filteredPolicies = policies.filter(p => {
    const matchesType = filters.type === 'all' || p.category.toLowerCase() === filters.type;
    const matchesSearch = p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         p.provider.toLowerCase().includes(filters.search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleToggleSelect = (policy) => {
    setSelected(prev => {
      const isSelected = prev.some(p => p.id === policy.id);
      if (isSelected) {
        return prev.filter(p => p.id !== policy.id);
      } else if (prev.length < 2) {
        return [...prev, policy];
      }
      return prev;
    });
  };

  const handleCompare = () => {
    if (selected.length === 2) {
      navigate('/compare', { state: { policies: selected } });
    }
  };

  return (
    <div className="policy-catalog">
      <nav className="navbar">
        <h1>Insurance Comparision Recommendation and Claim Assistance
 </h1>
        <div>
          <span>Welcome, {user?.name}</span>
          <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <header>
        <h2>Insurance Policies</h2>
        <p>Browse {policies.length} policies from top providers</p>
        {selected.length === 2 && (
          <button onClick={handleCompare}>
            Compare Selected Policies →
          </button>
        )}
      </header>

      <div className="filters">
        <input 
          placeholder="Search policies..." 
          value={filters.search} 
          onChange={e => setFilters({...filters, search: e.target.value})}
        />
        <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
          <option value="all">All Categories</option>
          <option value="auto">Auto</option>
          <option value="health">Health</option>
          <option value="life">Life</option>
        </select>
      </div>

      <div className="policy-grid">
        {filteredPolicies.map(policy => (
          <PolicyCard
            key={policy.id}
            policy={policy}
            isSelected={selected.some(p => p.id === policy.id)}
            onToggleSelect={handleToggleSelect}
          />
        ))}
      </div>
    </div>
  );
}