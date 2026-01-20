import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userData = {
        email,
        password,
        ...(firstName && { first_name: firstName }),
        ...(lastName && { last_name: lastName }),
        ...(phone && { phone })
      };
      
      const response = await authAPI.register(userData);
      setSuccess(response.data.message || 'Account created successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      let errorMessage = 'Registration failed';
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || !err.response) {
        errorMessage = 'Network error – cannot reach backend at http://127.0.0.1:8000';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - backend took too long to respond';
      } else if (err.response) {
        if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = `Server error (${err.response.status}): ${err.response.statusText || 'Unknown error'}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-2xl shadow-xl border border-primary/10 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary">
              Create Account
            </h2>
            <p className="mt-2 text-primary/60">Join our platform today</p>
            <div className="mt-4 w-16 h-1 bg-accent mx-auto rounded-full"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                Email Address *
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
                Password *
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-background focus:ring-2 focus:ring-accent focus:border-accent transition-colors placeholder-primary/40 text-primary"
                placeholder="Create a password (min 6 characters)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-primary mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-background focus:ring-2 focus:ring-accent focus:border-accent transition-colors placeholder-primary/40 text-primary"
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-primary mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-background focus:ring-2 focus:ring-accent focus:border-accent transition-colors placeholder-primary/40 text-primary"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-primary mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-background focus:ring-2 focus:ring-accent focus:border-accent transition-colors placeholder-primary/40 text-primary"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success} Redirecting to login...
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-primary text-background hover:bg-primary/90 disabled:bg-primary/50 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg border border-accent hover:border-accent/80"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-primary/60">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-accent hover:text-accent/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}