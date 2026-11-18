'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  apiLogin,
  apiRegister,
  apiGetMe,
  apiToggleBookmark,
  getStoredToken
} from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    name: string;
    password: string;
    role?: string;
    preferred_topics?: string[];
    preferred_perspectives?: string[];
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  toggleBookmark: (clusterId: string) => Promise<boolean>;
  isBookmarked: (clusterId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from localStorage on initial render
  useEffect(() => {
    const savedToken = getStoredToken();
    if (savedToken) {
      setToken(savedToken);
      apiGetMe(savedToken)
        .then((res) => {
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            // Token expired or invalid
            localStorage.removeItem('nynk_auth_token');
            setToken(null);
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('nynk_auth_token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('nynk_auth_token', res.token);
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to sign in' };
  };

  const register = async (data: {
    email: string;
    name: string;
    password: string;
    role?: string;
    preferred_topics?: string[];
    preferred_perspectives?: string[];
  }) => {
    const res = await apiRegister(data);
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('nynk_auth_token', res.token);
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to create account' };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nynk_auth_token');
  };

  const toggleBookmark = async (clusterId: string): Promise<boolean> => {
    if (!token || !user) return false;

    // Optimistic UI update
    const currentBookmarks = user.bookmarked_cluster_ids || [];
    const alreadyBookmarked = currentBookmarks.includes(clusterId);
    const newBookmarks = alreadyBookmarked
      ? currentBookmarks.filter((id) => id !== clusterId)
      : [...currentBookmarks, clusterId];

    setUser({ ...user, bookmarked_cluster_ids: newBookmarks });

    try {
      const res = await apiToggleBookmark(token, clusterId);
      if (res.success && res.bookmarked_cluster_ids) {
        setUser({ ...user, bookmarked_cluster_ids: res.bookmarked_cluster_ids });
        return res.is_bookmarked || false;
      }
    } catch (e) {
      // Revert if error
      setUser({ ...user, bookmarked_cluster_ids: currentBookmarks });
    }
    return !alreadyBookmarked;
  };

  const isBookmarked = (clusterId: string): boolean => {
    return Boolean(user?.bookmarked_cluster_ids?.includes(clusterId));
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = user?.role === 'admin';
  const isEditor = user?.role === 'editor' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isEditor,
        login,
        register,
        logout,
        toggleBookmark,
        isBookmarked
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

