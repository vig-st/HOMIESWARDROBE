import { createContext } from 'react';

export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => {},
  googleLogin: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: () => {},
  updateAddresses: () => {},
  updatePreferences: () => {},
});
