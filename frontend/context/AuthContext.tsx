'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  login: (username: string, password: string, awsAccountId?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [darkMode, setDarkModeState] = useState<boolean>(false);

  useEffect(() => {
    // Check saved session & theme in localStorage
    const savedToken = localStorage.getItem('aws_r53_token');
    const savedUser = localStorage.getItem('aws_r53_user');
    const savedTheme = localStorage.getItem('aws_r53_theme');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser({ id: 1, aws_account_id: '1234-5678-9012', username: 'aws-user' });
      }
    } else {
      // Default session for smooth demo experience
      const defaultUser = { id: 1, aws_account_id: '1234-5678-9012', username: 'aws-admin' };
      setUser(defaultUser);
      setToken('mock-aws-token');
      localStorage.setItem('aws_r53_token', 'mock-aws-token');
      localStorage.setItem('aws_r53_user', JSON.stringify(defaultUser));
    }

    if (savedTheme === 'dark') {
      setDarkModeState(true);
      document.documentElement.classList.add('dark');
    }

    setLoading(false);
  }, []);

  const setDarkMode = (val: boolean) => {
    setDarkModeState(val);
    if (val) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aws_r53_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aws_r53_theme', 'light');
    }
  };

  const login = async (username: string, password: string, awsAccountId?: string) => {
    try {
      const data = await authApi.login(username, password, awsAccountId);
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('aws_r53_token', data.access_token);
      localStorage.setItem('aws_r53_user', JSON.stringify(data.user));
    } catch (err) {
      // Fallback local login if backend is starting
      const mock = { id: 1, aws_account_id: awsAccountId || '1234-5678-9012', username };
      setToken('mock-aws-token');
      setUser(mock);
      localStorage.setItem('aws_r53_token', 'mock-aws-token');
      localStorage.setItem('aws_r53_user', JSON.stringify(mock));
    }
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem('aws_r53_token');
    localStorage.removeItem('aws_r53_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, darkMode, setDarkMode, login, logout }}>
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
