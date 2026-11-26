import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  registerEmployee as registerEmployeeRequest,
} from '../services/authApi.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const clearError = useCallback(() => setError(''), []);

  useEffect(() => {
    const clearUser = () => setUser(null);

    window.addEventListener('auth:unauthorized', clearUser);
    return () => window.removeEventListener('auth:unauthorized', clearUser);
  }, []);

  useEffect(() => {
    let active = true;

    // Limpia las claves de la versión que guardaba la sesión en localStorage.
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    getMe()
      .then(({ data }) => {
        if (active) setUser(data);
      })
      .catch((caughtError) => {
        if (active && caughtError.status !== 401) {
          setError(caughtError.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError('');

    try {
      const { data } = await loginRequest(email, password);
      setUser(data.user);
      return data.user;
    } catch (caughtError) {
      setError(caughtError.message ?? 'No se pudo iniciar sesión.');
      throw caughtError;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    setError('');
  }, []);

  const register = useCallback(async (payload) => {
    setError('');
    const response = await registerEmployeeRequest(payload);
    return response?.data ?? response ?? {};
  }, []);

  const value = useMemo(() => ({
    user,
    error,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    register,
    clearError,
  }), [user, error, loading, login, logout, register, clearError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 