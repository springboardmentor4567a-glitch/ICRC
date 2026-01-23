const SERVER_USERS_KEY = 'server_users';
const SERVER_REFRESH_MAP = 'server_refresh_map';
const SECRET = 'demo-secret';
const API_BASE_URL = '';

function b64uEncode(obj) {
  const s = typeof obj === 'string' ? obj : JSON.stringify(obj);
  return btoa(s).replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64uDecode(str) {
  try {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(str));
  } catch {
    return null;
  }
}

function makeSignature(headerB64, payloadB64) {
  return b64uEncode(headerB64 + '.' + payloadB64 + '.' + SECRET);
}



export function decodeJWT(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  return b64uDecode(parts[1]);
}

export function getExpiryMillis(token) {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return null;
  return payload.exp * 1000;
}

export function getExpirySecondsLeft(token) {
  const expMs = getExpiryMillis(token);
  if (!expMs) return null;
  return Math.max(0, Math.floor((expMs - Date.now()) / 1000));
}

export function isTokenExpired(token) {
  const left = getExpirySecondsLeft(token);
  return left === null ? true : left <= 0;
}

function getUsers() {
  return JSON.parse(localStorage.getItem(SERVER_USERS_KEY) || '[]');
}

function setUsers(users) {
  localStorage.setItem(SERVER_USERS_KEY, JSON.stringify(users));
}

function getRefreshMap() {
  return JSON.parse(localStorage.getItem(SERVER_REFRESH_MAP) || '{}');
}

function setRefreshMap(map) {
  localStorage.setItem(SERVER_REFRESH_MAP, JSON.stringify(map));
}

function genRefresh() {
  return 'r_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function setRefreshCookie(token) {
  document.cookie = `refresh_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}`;
}

function clearRefreshCookie() {
  document.cookie = 'refresh_token=; path=/; max-age=0';
}

function getRefreshFromCookie() {
  const m = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('refresh_token='));
  if (!m) return null;
  return m.split('=')[1];
}

export const AuthAPI = {
  async register(name, email, phone, password) {
    const res = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });
    if (!res.ok) {
      let errorMessage = 'Registration failed';
      try {
        const error = await res.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use default message
      }
      const err = new Error(errorMessage);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    return { accessToken: data.accessToken };
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      let errorMessage = 'Login failed';
      try {
        const error = await res.json();
        errorMessage = error.message || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use default message
      }
      const err = new Error(errorMessage);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    return { accessToken: data.accessToken };
  },

  async refresh() {
    // For now, just return the current token since backend doesn't have refresh
    const currentToken = localStorage.getItem('access_token');
    if (currentToken) {
      return { accessToken: currentToken };
    }
    const err = new Error('No token to refresh');
    err.status = 401;
    throw err;
  },

  async revoke() {
    localStorage.removeItem('access_token');
    return;
  }
};

function verifyAccessToken(accessToken) {
  const payload = decodeJWT(accessToken);
  if (!payload || !payload.exp) {
    const err = new Error('Invalid token');
    err.status = 401;
    throw err;
  }
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    const err = new Error('Token expired');
    err.status = 401;
    throw err;
  }
  return payload;
}

export const PolicyAPI = {
  async getPolicies(accessToken) {
    // Policies are public, no need to verify token
    const res = await fetch(`${API_BASE_URL}/policies`);
    if (!res.ok) throw new Error('Failed to fetch policies');
    const policies = await res.json();
    return policies.map(p => ({
      ...p,
      priceBase: p.base_premium, // Map backend's base_premium to frontend's priceBase
      features: Array.isArray(p.features) ? p.features : (p.features ? p.features.split(', ') : [])
    }));
  },

  async addPolicy(accessToken, policy) {
    const payload = verifyAccessToken(accessToken);
    if (payload.email !== 'admin@admin.com') {
      const err = new Error('Unauthorized');
      err.status = 403;
      throw err;
    }
    const res = await fetch(`${API_BASE_URL}/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify(policy)
    });
    if (!res.ok) throw new Error('Failed to add policy');
    return await res.json();
  },

  async updatePolicy(accessToken, id, updates) {
    const payload = verifyAccessToken(accessToken);
    if (payload.email !== 'admin@admin.com') {
      const err = new Error('Unauthorized');
      err.status = 403;
      throw err;
    }
    const res = await fetch(`${API_BASE_URL}/policies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update policy');
    return await res.json();
  },

  async deletePolicy(accessToken, id) {
    const payload = verifyAccessToken(accessToken);
    if (payload.email !== 'admin@admin.com') {
      const err = new Error('Unauthorized');
      err.status = 403;
      throw err;
    }
    const res = await fetch(`${API_BASE_URL}/policies/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!res.ok) throw new Error('Failed to delete policy');
    return await res.json();
  }
};

export const RecommendationsAPI = {
  async getRecommendations(accessToken) {
    verifyAccessToken(accessToken);
    const res = await fetch(`${API_BASE_URL}/recommendations`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    const recommendations = await res.json();
    return recommendations.map(r => ({
      ...r.policy,
      score: r.score
    }));
  },

  async saveRecommendations(accessToken, recommendations) {
    verifyAccessToken(accessToken);
    const res = await fetch(`${API_BASE_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ recommendations })
    });
    if (!res.ok) throw new Error('Failed to save recommendations');
    return await res.json();
  }
};
