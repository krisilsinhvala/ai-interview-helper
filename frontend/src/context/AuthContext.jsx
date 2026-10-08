import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.warn("Auth check failed:", err.response?.data?.message || err.message);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const loginUser = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const registerUser = async (name, email, password, confirmPassword) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', { name, email, password, confirmPassword });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logoutUser = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        loginUser,
        registerUser,
        logoutUser,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
