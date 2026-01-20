import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [pin, setPin] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);
      
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('role', 'user');
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (digit, index) => {
    if (digit.match(/\d/)) {
      const newPin = pin.slice(0, index) + digit + pin.slice(index + 1);
      setPin(newPin);
      
      // Auto-focus next input
      if (digit && index < 5) {
        const nextInput = document.querySelector(`input[data-pin-index="${index + 1}"]`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handlePinKeydown = (e, index) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.querySelector(`input[data-pin-index="${index - 1}"]`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSecureAdminLogin = async () => {
    if (pin !== '251987') return;
    
    setAdminLoading(true);
    try {
      const response = await fetch('http://localhost:8000/admin/secure-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: '251987' })
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('role', 'admin');
        setShowAdminModal(false);
        navigate('/admin-dashboard');
      }
    } catch (error) {
      setError('Admin authentication failed');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <>
      {/* YOUR EXISTING LOGIN PAGE - DON'T TOUCH */}
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-background rounded-2xl shadow-xl border border-primary/10 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary">
                Welcome Back
              </h2>
              <p className="mt-2 text-primary/60">Sign in to your account</p>
              <div className="mt-4 w-16 h-1 bg-accent mx-auto rounded-full"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-background focus:ring-2 focus:ring-accent focus:border-accent transition-colors placeholder-primary/40 text-primary"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-background focus:ring-2 focus:ring-accent focus:border-accent transition-colors placeholder-primary/40 text-primary"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-background hover:bg-primary/90 disabled:bg-primary/50 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg border border-accent hover:border-accent/80"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-primary/60">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-medium text-accent hover:text-accent/80 transition-colors"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN ICON - FORCE VISIBLE */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 999999 }}>
        <button
          onClick={() => setShowAdminModal(true)}
          style={{
            width: '70px', height: '70px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: 'none', borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.3s ease',
            fontSize: '30px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#D4AF37';
            e.target.style.transform = 'scale(1.2) rotate(10deg)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
            e.target.style.transform = '';
          }}
        >
          👨💼
        </button>
      </div>

      {/* ADMIN MODAL - SECURE PIN ONLY */}
      {showAdminModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', zIndex: 1000000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
            padding: '0px', borderRadius: '24px', width: '100%', maxWidth: '400px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.8)', border: '2px solid rgba(212, 175, 55, 0.2)'
          }}>
            {/* Header - NO credentials visible */}
            <div style={{ padding: '32px', textAlign: 'center', borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <div style={{
                width: '96px', height: '96px', margin: '0 auto 24px',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(245, 158, 11, 0.3))',
                borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(212, 175, 55, 0.4)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}>
                <svg style={{ width: '48px', height: '48px', color: '#D4AF37' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <h2 style={{ 
                fontSize: '24px', fontWeight: '900', background: 'linear-gradient(135deg, #ffffff, #cbd5e1)', 
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px'
              }}>
                Admin Authentication
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Enter 6-digit PIN</p>
            </div>
            
            {/* PIN Input - SECURE 6-digit */}
            <div style={{ padding: '32px 32px 16px' }}>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
                {Array(6).fill().map((_, i) => (
                  <input
                    key={i}
                    type="password"
                    maxLength={1}
                    value={pin[i] || ''}
                    onChange={(e) => handlePinChange(e.target.value, i)}
                    onKeyDown={(e) => handlePinKeydown(e, i)}
                    data-pin-index={i}
                    style={{
                      width: '56px', height: '56px', fontSize: '24px', fontWeight: 'bold',
                      textAlign: 'center', background: 'rgba(51, 65, 85, 0.7)',
                      border: '2px solid rgba(51, 65, 85, 0.5)', borderRadius: '16px',
                      color: 'white', outline: 'none', transition: 'all 0.2s',
                      ...(pin[i] ? { borderColor: 'rgba(212, 175, 55, 0.7)' } : {})
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.7)'}
                    onBlur={(e) => e.target.style.borderColor = pin[i] ? 'rgba(212, 175, 55, 0.7)' : 'rgba(51, 65, 85, 0.5)'}
                  />
                ))}
              </div>
              
              {/* Status */}
              {pin.length === 6 && (
                <div style={{
                  textAlign: 'center', padding: '12px 24px', borderRadius: '16px',
                  fontWeight: '600', fontSize: '14px', marginBottom: '24px',
                  ...(pin === '251987' ? {
                    background: 'rgba(16, 185, 129, 0.2)', color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  } : {
                    background: 'rgba(239, 68, 68, 0.2)', color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  })
                }}>
                  {pin === '251987' ? 'Access Granted ✅' : 'Invalid PIN'}
                </div>
              )}
              
              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowAdminModal(false)}
                  style={{
                    flex: '1', padding: '12px', background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid #D4AF37', borderRadius: '16px', color: '#D4AF37',
                    cursor: 'pointer', fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSecureAdminLogin}
                  disabled={pin.length !== 6 || pin !== '251987' || adminLoading}
                  style={{
                    flex: '2', padding: '16px', borderRadius: '24px', border: 'none',
                    background: pin === '251987' ? 'linear-gradient(135deg, #D4AF37, #f59e0b)' : 'rgba(51, 65, 85, 0.5)',
                    color: pin === '251987' ? '#000' : '#94a3b8',
                    fontSize: '18px', fontWeight: '900', cursor: pin === '251987' ? 'pointer' : 'not-allowed',
                    boxShadow: pin === '251987' ? '0 20px 40px rgba(212, 175, 55, 0.3)' : 'none',
                    transition: 'all 0.3s', opacity: (pin.length !== 6 || pin !== '251987') ? 0.5 : 1
                  }}
                >
                  {adminLoading ? 'Authenticating...' : (pin === '251987' ? 'Enter Admin Dashboard' : 'Enter PIN')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}