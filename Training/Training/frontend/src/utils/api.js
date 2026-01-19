// src/utils/api.js
// API utility functions with token handling

export const API_BASE_URL = "http://localhost:8000";

/**
 * Check if access token is expired or about to expire
 */
const isTokenExpired = () => {
  const expiresAt = localStorage.getItem("token_expires_at");
  if (!expiresAt) return false;
  
  // Check if token expires in less than 1 minute
  return Date.now() >= (parseInt(expiresAt) - 60000);
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    
    // Update tokens in localStorage
    if (data.access_token) localStorage.setItem("token", data.access_token);
    if (data.expires_in) localStorage.setItem("token_expires_at", Date.now() + (data.expires_in * 1000));
    
    return data.access_token;
  } catch (error) {
    // Clear tokens and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_expires_at");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw error;
  }
};

/**
 * Get authentication headers with token
 */
export const getAuthHeaders = async () => {
  // Check if token needs refresh
  if (isTokenExpired()) {
    await refreshAccessToken();
  }
  
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

/**
 * Authenticated fetch wrapper
 */
export const authenticatedFetch = async (url, options = {}) => {
  const headers = await getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });
  
  // Handle unauthorized - try to refresh token once
  if (response.status === 401) {
    try {
      await refreshAccessToken();
      
      // Retry request with new token
      const newHeaders = await getAuthHeaders();
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          ...newHeaders,
          ...options.headers
        }
      });
      
      if (retryResponse.status === 401) {
        // Still unauthorized, redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      
      return retryResponse;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw error;
    }
  }
  
  return response;
};

/**
 * GET request with authentication
 */
export const apiGet = async (endpoint) => {
  return authenticatedFetch(`${API_BASE_URL}${endpoint}`);
};

/**
 * POST request with authentication
 */
export const apiPost = async (endpoint, data) => {
  return authenticatedFetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    body: JSON.stringify(data)
  });
};

/**
 * PUT request with authentication
 */
export const apiPut = async (endpoint, data) => {
  return authenticatedFetch(`${API_BASE_URL}${endpoint}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
};

/**
 * DELETE request with authentication
 */
export const apiDelete = async (endpoint) => {
  return authenticatedFetch(`${API_BASE_URL}${endpoint}`, {
    method: "DELETE"
  });
};
