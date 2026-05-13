import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        const response = await authAPI.getProfile();
        setUser(response.data);
      }
    } catch (error) {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);
      const { access, refresh } = response.data;

      await AsyncStorage.setItem('access_token', access);
      await AsyncStorage.setItem('refresh_token', refresh);

      const profileResponse = await authAPI.getProfile();
      setUser(profileResponse.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      await authAPI.register(username, email, password);
      await login(username, password);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};