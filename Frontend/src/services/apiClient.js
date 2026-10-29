const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function apiRequest(path, options = {}) {
  const token = window.localStorage.getItem('cryptova-access-token');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.error?.message || payload?.detail?.message || 'The backend request failed.';
    throw new Error(message);
  }

  return payload;
}

export const backendHealth = () => apiRequest('/health');
export const backendVault = () => apiRequest('/vault');
export const backendActivity = (page = 1) => apiRequest(`/activity?page=${page}`);
