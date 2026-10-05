import { AuthContext } from './AuthContext';
import { useEffect, useState } from 'react';
import apiRequest from '../services/api';

function getSavedAuth() {
  if (typeof window === 'undefined') return { user: null, token: null, isAuthenticated: false };
  const stored = window.localStorage.getItem('homiesAuth');
  if (!stored) return { user: null, token: null, isAuthenticated: false };
  try {
    const parsed = JSON.parse(stored);
    return { user: parsed.user, token: parsed.token, isAuthenticated: !!parsed.token };
  } catch {
    return { user: null, token: null, isAuthenticated: false };
  }
}

export function AuthProvider({ children }) {
  const initial = getSavedAuth();
  const [user, setUser] = useState(initial.user);
  const [token, setToken] = useState(initial.token);
  const [isAuthenticated, setIsAuthenticated] = useState(initial.isAuthenticated);

  useEffect(() => {
    if (token && user) {
      window.localStorage.setItem('homiesAuth', JSON.stringify({ user, token }));
    } else {
      window.localStorage.removeItem('homiesAuth');
    }
  }, [user, token]);

  const login = async ({ email, password }) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const userData = {
      id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    };

    setUser(userData);
    setToken(data.token);
    setIsAuthenticated(true);
    return userData;
  };

  const googleLogin = async (credential) => {
    const data = await apiRequest('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });

    const userData = {
      id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    };

    setUser(userData);
    setToken(data.token);
    setIsAuthenticated(true);
    return userData;
  };

  const register = async (payload) => {
    const name = payload.name || `${payload.firstName || ''} ${payload.lastName || ''}`.trim();
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email: payload.email,
        password: payload.password,
      }),
    });

    const userData = {
      id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    };

    setUser(userData);
    setToken(data.token);
    setIsAuthenticated(true);
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    window.localStorage.removeItem('homiesAuth');
  };

  const updateProfile = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const updateAddresses = (addresses) => {
    setUser((prev) => ({ ...prev, addresses }));
  };

  const updatePreferences = (notifications) => {
    setUser((prev) => ({ ...prev, notifications }));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, googleLogin, register, logout, updateProfile, updateAddresses, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
}
