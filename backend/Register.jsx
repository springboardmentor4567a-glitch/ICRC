import React, { useState, useContext } from 'react';
import { AuthContext } from './authContext';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Please fill all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.phone, formData.password);
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left Side - Information */}
        <div className="register-info">
          <div className="logo">ICRCA</div>
          <h1>Insurance Comparison Recommendation and Claim Assistance</h1>
          <p>Join thousands of users who trust us for personalized insurance recommendations and seamless claim assistance.</p>
          <div className="features-list">
            <div className="feature-item">
              <span>🔒</span>
              <span>Secure & Encrypted Data</span>
            </div>
            <div className="feature-item">
              <span>📊</span>
              <span>Personalized Recommendations</span>
            </div>
            <div className="feature-item">
              <span>⚡</span>
              <span>Quick Claim Processing</span>
            </div>
            <div className="feature-item">
              <span>💰</span>
              <span>Best Price Comparison</span>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="register-form-card">
          <div className="form-header">
            <h2>Create Your Account</h2>
            <p>Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {error && <div className="error">{error}</div>}

            <input
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <input
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <input
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />

            <input
              type="password"
              placeholder="Create your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <input
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />

            <button type="submit" disabled={loading} className="register-btn">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="register-links">
            <p>
              Already have an account? <Link to="/login">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
