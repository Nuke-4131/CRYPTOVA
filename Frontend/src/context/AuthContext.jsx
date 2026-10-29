import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const GOOGLE_PROFILE_KEY = 'cryptova-google-profile';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(GOOGLE_PROFILE_KEY) || 'null');
    } catch {
      return null;
    }
  });

  const loginWithGoogle = async (account) => {
    const profile = { ...account, role: 'Security Administrator' };
    window.localStorage.setItem(GOOGLE_PROFILE_KEY, JSON.stringify(profile));
    setUser(profile);
    return profile;
  };

  const updateRole = async (role) => {
    const profile = { ...user, role };
    setUser(profile);
    return profile;
  };

  const updateProfile = async (changes) => {
    const profile = { ...user, ...changes };
    setUser(profile);
    return profile;
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isLoading: false,
    loginWithGoogle,
    updateRole,
    updateProfile,
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
