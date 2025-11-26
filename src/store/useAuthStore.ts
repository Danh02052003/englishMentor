import { create } from 'zustand';

import type { TokenResponse, User } from '../api/types';

// Load initial state from localStorage
const getInitialState = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user || null,
        accessToken: parsed.accessToken || null,
        refreshToken: parsed.refreshToken || null,
      };
    }
  } catch (error) {
    console.error('Error loading auth state from localStorage:', error);
  }
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
  };
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (payload: TokenResponse) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),
  setAuth: (payload: TokenResponse) => {
    const newState = {
      user: payload.user,
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token
    };
    // Save to localStorage
    localStorage.setItem('auth-storage', JSON.stringify(newState));
    set(newState);
  },
  logout: () => {
    const newState = { user: null, accessToken: null, refreshToken: null };
    // Remove from localStorage
    localStorage.removeItem('auth-storage');
    set(newState);
  }
}));

export default useAuthStore;

