const API_BASE_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// --- AUTH ---
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await response.json();
  } catch (error) {
    return { message: "Registration failed" };
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await response.json();
  } catch (error) {
    return { message: "Login failed" };
  }
};

export const logoutUser = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_risk_profile');
};

// --- RISK PROFILE ---
export const saveRiskProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/risk/save`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return await response.json();
  } catch (error) {
    return { message: "Failed to save profile" };
  }
};

export const getProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/risk/profile`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
};

// --- RECOMMENDATIONS & POLICIES ---
export const getRecommendations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/recommendations`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    return [];
  }
};

export const getPolicies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/policies`, { 
        method: 'GET',
        headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    return [];
  }
};

export const purchasePolicy = async (policyId, coverageAmount) => {
  try {
    const response = await fetch(`${API_BASE_URL}/policies/buy`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
          policy_id: policyId,
          coverage_amount: coverageAmount 
      })
    });
    return await response.json();
  } catch (error) {
    return { message: "Purchase failed" };
  }
};

export const cancelUserPolicy = async (userPolicyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/policies/cancel/${userPolicyId}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    return { message: "Cancellation failed" };
  }
};

// ✅ ADDED THIS MISSING FUNCTION
export const payPremium = async (userPolicyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/policies/pay-premium/${userPolicyId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    return { message: "Payment failed" };
  }
};

export const calculatePremium = async (data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/calculator/calculate`, { // Adjust route as needed
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return null;
    }
};

// --- CLAIMS ---
export const getMyPolicies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/claims/my-policies`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
};

export const submitClaim = async (formData) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/claims/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}` 
      },
      body: formData
    });
    return await response.json();
  } catch (error) {
    return { message: "Submission failed" };
  }
};

export const getUserDashboard = async () => {
  try {
    const token = localStorage.getItem('access_token');
    // ✅ URL must match the blueprint prefix in __init__.py (/api/profile) + route (/dashboard)
    const response = await fetch(`http://localhost:5000/api/profile/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
};