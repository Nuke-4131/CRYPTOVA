import { apiRequest } from './apiClient';

const SESSION_KEY = 'cryptova-session';
const TOKEN_KEY = 'cryptova-access-token';

const saveSession = (data) => {
  if (data.access_token) window.localStorage.setItem(TOKEN_KEY, data.access_token);
  const profile = { ...(data.user || {}), userId: data.user?.id, role: 'Business User' };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
  return profile;
};

export async function registerUser({ displayName, email, password }) {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ display_name: displayName, email, password })
  });
  if (!response.data.access_token) {
    throw new Error('Registration succeeded. Confirm your email before signing in.');
  }
  return saveSession(response.data);
}

export async function loginWithPassword({ email, password }) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return saveSession(response.data);
}

export async function getCurrentProfile() {
  if (!window.localStorage.getItem(TOKEN_KEY)) return null;
  try {
    const response = await apiRequest('/auth/me');
    const profile = { ...response.data, userId: response.data.id };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    return profile;
  } catch {
    await clearCurrentProfile();
    return null;
  }
}

export async function clearCurrentProfile() {
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function updateUserRole() {
  return getCurrentProfile();
}

export async function updateUserProfile() {
  return getCurrentProfile();
}
