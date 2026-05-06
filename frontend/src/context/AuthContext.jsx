import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('mediconnect_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const decoded = decodeToken(token);
      if (decoded) {
        setUser({
          _id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
          doctorId: decoded.doctorId || null
        });
      } else {
        localStorage.removeItem('mediconnect_token');
        setUser(null);
      }
    } catch (error) {
      localStorage.removeItem('mediconnect_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    localStorage.setItem('mediconnect_token', data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, role: data.role, doctorId: data.doctorId || null });
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('mediconnect_token', data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, role: data.role });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('mediconnect_token');
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout, reloadUser: loadUser }), [user, loading, loadUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
