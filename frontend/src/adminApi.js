const API_BASE_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export const getAdminDashboard = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard`, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { return null; }
};

export const listAdminClaims = async ({ page=1, per_page=10, status='', q='', start_date='', end_date='', severity='' } = {}) => {
  try {
    const qs = new URLSearchParams();
    qs.set('page', page);
    qs.set('per_page', per_page);
    if (status) qs.set('status', status);
    if (q) qs.set('q', q);
    if (start_date) qs.set('start_date', start_date);
    if (end_date) qs.set('end_date', end_date);
    if (severity) qs.set('severity', severity);
    const res = await fetch(`${API_BASE_URL}/admin/claims?${qs.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) return { items: [], page: 1, per_page, total: 0, pages: 1 };
    return await res.json();
  } catch (e) { return { items: [], page: 1, per_page, total: 0, pages: 1 }; }
};

export const decideClaim = async (id, action, adminComments = '') => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/claims/${id}/decision`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ action, admin_comments: adminComments }) });
    return await res.json();
  } catch (e) { return null; }
};

// ✅ ADDED: Missing function to Re-analyze Claims
export const reanalyzeClaim = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/claims/${id}/reanalyze`, { method: 'POST', headers: getAuthHeaders() });
    return await res.json();
  } catch (e) { return null; }
};

// ✅ ADDED: Missing function to Toggle Fraud Flags
export const toggleFlag = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/flags/${id}/toggle`, { method: 'PUT', headers: getAuthHeaders() });
    return await res.json();
  } catch (e) { return null; }
};

export const createPolicy = async (data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/policies`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) });
    return await res.json();
  } catch (e) { return null; }
};

export const deletePolicy = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/policies/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    return await res.json();
  } catch (e) { return null; }
};

export const listUsers = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) { return []; }
};

export const banUser = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}/ban`, { method: 'PUT', headers: getAuthHeaders() });
    return await res.json();
  } catch (e) { return null; }
};

export const unbanUser = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}/unban`, { method: 'PUT', headers: getAuthHeaders() });
    return await res.json();
  } catch (e) { return null; }
};