import { createContext, useContext, useState, useEffect } from "react";
import { AuthAPI, PolicyAPI } from "./auth";

// Helper function to decode base64url (used in JWT)
function base64UrlDecode(str) {
  // Convert base64url to base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  try {
    return JSON.parse(atob(base64));
  } catch (e) {
    console.error('Failed to decode JWT payload:', e);
    return null;
  }
}

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = base64UrlDecode(token.split('.')[1]);
        setUser(payload);
        setIsAuthenticated(true);
        setIsAdmin(payload.role === 'admin');
      } catch (e) {
        localStorage.removeItem('access_token');
      }
    }
    setLoading(false);
  }, []);

  // Initialize policies on mount
  useEffect(() => {
    // Always try to load policies, whether logged in or not
    refreshPolicies();
  }, []);

  const refreshPolicies = async () => {
    try {
      const at = localStorage.getItem("access_token");
      const list = await PolicyAPI.getPolicies(at);
      setPolicies(list);
      return list;
    } catch (err) {
      if (err?.status === 401) {
        try {
          const { accessToken } = await AuthAPI.refresh();
          localStorage.setItem("access_token", accessToken);
          const list = await PolicyAPI.getPolicies(accessToken);
          setPolicies(list);
          return list;
        } catch (e) {
          localStorage.removeItem("access_token");
          const fallback = JSON.parse(localStorage.getItem("policies") || "[]");
          setPolicies(fallback);
          return fallback;
        }
      }
      throw err;
    }
  };

  const getPolicies = () => {
    // Clear old localStorage data to force fresh load
    localStorage.removeItem("policies");
    localStorage.removeItem("policies_backup");

    const currentPolicies = policies.length ? policies : JSON.parse(localStorage.getItem("policies") || "[]");

    // Always return sample policies if none are loaded (whether logged in or not)
    if (currentPolicies.length === 0) {
      const samplePolicies = [
        {
          id: 1,
          name: "Comprehensive Health Insurance",
          category: "Health",
          provider: "HealthCorp",
          coverage: 1000000,
          priceBase: 5000,
          rating: 4.5,
          features: ["Hospitalization", "Day Care", "Ambulance"],
          term: 1,
          eligibilityAge: "18-65 years"
        },
        {
          id: 2,
          name: "Term Life Insurance",
          category: "Life",
          provider: "LifeSecure",
          coverage: 5000000,
          priceBase: 3000,
          rating: 4.2,
          features: ["Death Benefit", "Terminal Illness", "Accidental Death"],
          term: 20,
          eligibilityAge: "18-60 years"
        },
        {
          id: 3,
          name: "Car Insurance",
          category: "Auto",
          provider: "AutoGuard",
          coverage: 2000000,
          priceBase: 4000,
          rating: 4.0,
          features: ["Third Party Liability", "Own Damage", "Theft"],
          term: 1,
          eligibilityAge: "18+ years"
        },
        {
          id: 4,
          name: "Home Insurance",
          category: "Home",
          provider: "HomeSafe",
          coverage: 3000000,
          priceBase: 6000,
          rating: 4.3,
          features: ["Structure", "Contents", "Burglary"],
          term: 1,
          eligibilityAge: "18+ years"
        },
        {
          id: 5,
          name: "Travel Insurance",
          category: "Travel",
          provider: "TravelCare",
          coverage: 500000,
          priceBase: 2000,
          rating: 4.1,
          features: ["Medical Emergency", "Trip Cancellation", "Lost Luggage"],
          term: 1,
          eligibilityAge: "18+ years"
        },
        {
          id: 6,
          name: "Business Insurance",
          category: "Business",
          provider: "BizProtect",
          coverage: 2000000,
          priceBase: 8000,
          rating: 4.4,
          features: ["Property Damage", "Liability", "Business Interruption"],
          term: 1,
          eligibilityAge: "18+ years"
        },
        {
          id: 7,
          name: "Critical Illness Insurance",
          category: "Health",
          provider: "MediCare Plus",
          coverage: 1500000,
          priceBase: 4500,
          rating: 4.6,
          features: ["Cancer Coverage", "Heart Disease", "Stroke"],
          term: 1,
          eligibilityAge: "18-60 years"
        },
        {
          id: 8,
          name: "Whole Life Insurance",
          category: "Life",
          provider: "EverLife",
          coverage: 10000000,
          priceBase: 8000,
          rating: 4.7,
          features: ["Lifetime Coverage", "Cash Value", "Loan Facility"],
          term: 99,
          eligibilityAge: "18-50 years"
        },
        {
          id: 9,
          name: "Two Wheeler Insurance",
          category: "Auto",
          provider: "BikeSafe",
          coverage: 500000,
          priceBase: 1500,
          rating: 4.2,
          features: ["Third Party", "Own Damage", "Personal Accident"],
          term: 1,
          eligibilityAge: "18+ years"
        },
        {
          id: 10,
          name: "Commercial Property Insurance",
          category: "Business",
          provider: "CommProtect",
          coverage: 5000000,
          priceBase: 12000,
          rating: 4.5,
          features: ["Building", "Equipment", "Stock"],
          term: 1,
          eligibilityAge: "Business owners"
        }
      ];

      // Store sample policies in localStorage for persistence
      localStorage.setItem("policies", JSON.stringify(samplePolicies));
      return samplePolicies;
    }
    return currentPolicies;
  };

  const register = async (name, email, phone, password) => {
    const { accessToken } = await AuthAPI.register(name, email, phone, password);
    localStorage.setItem('access_token', accessToken);
    const payload = base64UrlDecode(accessToken.split('.')[1]);
    setUser(payload);
    setIsAuthenticated(true);
    setIsAdmin(payload.role === 'admin');
    // Dispatch custom event to notify App.jsx of registration success
    window.dispatchEvent(new CustomEvent('loginSuccess'));
    // Refresh policies after login
    await refreshPolicies();
  };

  const login = async (email, password) => {
    const { accessToken } = await AuthAPI.login(email, password);
    localStorage.setItem('access_token', accessToken);
    const payload = base64UrlDecode(accessToken.split('.')[1]);
    setUser(payload);
    setIsAuthenticated(true);
    setIsAdmin(payload.role === 'admin');
    // Dispatch custom event to notify App.jsx of login success
    window.dispatchEvent(new CustomEvent('loginSuccess'));
    // Refresh policies after login
    await refreshPolicies();
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setPolicies([]);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      loading,
      register,
      login,
      logout,
      getPolicies,
      refreshPolicies,
      policies
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
