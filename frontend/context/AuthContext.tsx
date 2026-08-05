'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiGet, apiPost } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const res = await apiGet<{ status: string; data: { user: User } }>('/auth/me');
      if (res.ok && res.data?.data?.user) {
        setUser(res.data.data.user);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await apiPost<{ status: string; data: { user: User; token: string }; message?: string }>('/auth/login', {
        email,
        password,
      });

      if (res.ok && res.data?.data) {
        const { user: userData, token: userToken } = res.data.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('token', userToken);
        return { success: true };
      } else {
        return { success: false, error: res.data?.message || 'Invalid credentials' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await apiPost<{ status: string; data: { user: User; token: string }; message?: string }>('/auth/register', {
        name,
        email,
        password,
      });

      if (res.ok && res.data?.data) {
        const { user: userData, token: userToken } = res.data.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('token', userToken);
        return { success: true };
      } else {
        return { success: false, error: res.data?.message || 'Registration failed' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
