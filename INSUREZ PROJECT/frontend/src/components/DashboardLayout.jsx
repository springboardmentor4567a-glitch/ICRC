import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';

export default function DashboardLayout({ children, user }) {
  const [profile, setProfile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        setProfile(response.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const getInitials = (profile) => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
    }
    if (profile?.email) {
      return profile.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = (profile) => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    return 'User';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navy background and Gold accents */}
      <nav className="bg-primary shadow-lg border-b-2 border-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-background">
                INSUREZ
              </h1>
              <div className="ml-2 w-2 h-2 bg-accent rounded-full"></div>
            </div>

            {/* Profile Section */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 hover:bg-primary/80 rounded-lg p-2 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary font-semibold border-2 border-background">
                  {getInitials(profile)}
                </div>
                
                {/* User Info */}
                <div className="hidden sm:block text-left">
                  <p className="text-background text-sm font-medium">
                    {getDisplayName(profile)}
                  </p>
                  <p className="text-accent text-xs">
                    {profile?.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>

                {/* Dropdown Arrow */}
                <svg className={`w-4 h-4 text-background transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-background rounded-lg shadow-xl border border-primary/10 py-2 z-50">
                  <div className="px-4 py-3 border-b border-primary/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-primary font-semibold">
                        {getInitials(profile)}
                      </div>
                      <div>
                        <p className="text-primary font-semibold">
                          {getDisplayName(profile)}
                        </p>
                        <p className="text-primary/60 text-sm">
                          {profile?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${profile?.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-primary/70">
                        {profile?.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    {profile?.phone && (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-sm text-primary/70">
                          {profile.phone}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-primary/10 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
