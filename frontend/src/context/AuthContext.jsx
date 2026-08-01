import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('darkon_token');
    if (token) {
      authAPI.getMe()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('darkon_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const clearExpiredSession = () => setUser(null);
    window.addEventListener('darkon:unauthorized', clearExpiredSession);
    return () => window.removeEventListener('darkon:unauthorized', clearExpiredSession);
  }, []);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    localStorage.setItem('darkon_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    localStorage.setItem('darkon_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('darkon_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
