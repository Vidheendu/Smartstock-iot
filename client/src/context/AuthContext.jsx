import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth.service.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'smartstock_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await authService.getMe();
        if (data.success && data.user) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.warn('[AUTH] Session validation failed:', err.response?.data?.message || err.message);
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    if (data.success && data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || 'Login failed');
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        logout
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

export default AuthContext;
