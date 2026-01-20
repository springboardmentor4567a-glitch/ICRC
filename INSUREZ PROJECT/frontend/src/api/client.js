import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Setup Error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', {
      status: response.status,
      data: response.data,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => {
    return apiClient.post('/auth/register', userData);
  },
  
  login: (email, password) => {
    return apiClient.post('/auth/login', { email, password });
  },
  
  getCurrentUser: () => {
    return apiClient.get('/users/me');
  },
  
  getProfile: () => {
    return apiClient.get('/auth/profile');
  },
  
  getUserPolicies: () => {
    return apiClient.get('/policies');
  },
};

export const claimsAPI = {
  getUserClaims: () => {
    return apiClient.get('/claims/');
  },
  
  getClaim: (claimId) => {
    return apiClient.get(`/claims/${claimId}`);
  },
  
  createClaim: (claimData, options = {}) => {
    return apiClient.post('/claims/', claimData, options);
  },
  
  updateClaimStatus: (claimId, status) => {
    return apiClient.put(`/claims/${claimId}/status`, { status });
  },
};

export default apiClient;