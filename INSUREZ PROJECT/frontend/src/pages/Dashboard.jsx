import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import DashboardLayout from '../components/DashboardLayout';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userResponse, profileResponse] = await Promise.all([
          authAPI.getCurrentUser(),
          authAPI.getProfile()
        ]);
        setUser(userResponse.data);
        setProfile(profileResponse.data);
      } catch (err) {
        setError('Failed to fetch user data');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-background rounded-2xl shadow-xl border border-primary/10 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mr-3"></div>
            <span className="text-primary text-lg">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="bg-background rounded-3xl shadow-xl border border-primary/10 p-12 mb-8">
            <h1 className="text-6xl font-bold text-primary mb-4">
              Welcome to <span className="text-accent">ICR</span>!!!
            </h1>
            <p className="text-xl text-primary/70 mb-6">
              Your Insurance Comparison & Recommendation Platform
            </p>
            {profile && (
              <div className="mt-6">
                <h2 className="text-3xl md:text-4xl font-bold text-accent">
                  Hi {profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : profile.first_name || 'User'}!
                </h2>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-primary mb-6 text-center">Available Features</h2>
            
            <div className="grid gap-6 md:grid-cols-3">
              <button 
                onClick={() => navigate('/policies')}
                className="bg-background rounded-xl p-6 border border-primary/10 hover:border-accent/30 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
              >
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg text-[#D4AF37] font-semibold mb-2">Browse Policies</h3>
                <p className="text-primary/60 text-sm">Explore our comprehensive insurance policy options</p>
              </button>

              <button 
                onClick={() => navigate('/compare')}
                className="bg-background rounded-xl p-6 border border-primary/10 hover:border-accent/30 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
              >
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg text-[#D4AF37] font-semibold mb-2">Compare Policies</h3>
                <p className="text-primary/60 text-sm">Find the best insurance policies tailored to your needs</p>
              </button>

              <button 
                onClick={() => navigate('/calculator')}
                className="bg-background rounded-xl p-6 border border-primary/10 hover:border-accent/30 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
              >
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg text-[#D4AF37] font-semibold mb-2">Premium Calculator</h3>
                <p className="text-primary/60 text-sm">Calculate your insurance premiums instantly</p>
              </button>

              <button 
                onClick={() => navigate('/recommendations')}
                className="bg-background rounded-xl p-6 border border-primary/10 hover:border-accent/30 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
              >
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg text-[#D4AF37] font-semibold mb-2">Smart Recommendations</h3>
                <p className="text-primary/60 text-sm">Get AI-powered recommendations based on your profile</p>
              </button>

              <button 
                onClick={() => navigate('/savings')}
                className="bg-background rounded-xl p-6 border border-primary/10 hover:border-accent/30 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
              >
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg text-[#D4AF37] font-semibold mb-2">Save Money</h3>
                <p className="text-primary/60 text-sm">Compare prices and save on your insurance premiums</p>
              </button>

              <button 
                onClick={() => navigate('/claims')}
                className="bg-background rounded-xl p-6 border border-primary/10 hover:border-accent/30 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
              >
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg text-[#D4AF37] font-semibold mb-2">File Claim</h3>
                <p className="text-primary/60 text-sm">Submit insurance claims quickly and easily</p>
              </button>
            </div>
            
            <div className="flex justify-center mt-6">
              <button 
                onClick={() => navigate('/claim-status')}
                className="bg-background rounded-xl p-6 border border-primary/10 hover:border-accent/30 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer w-full max-w-sm"
              >
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg text-[#D4AF37] font-semibold mb-2">Track Claims</h3>
                <p className="text-primary/60 text-sm">Monitor your claim status and receive updates</p>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}