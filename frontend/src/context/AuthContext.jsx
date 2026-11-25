import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  getMe,
  login as loginRequest,
  registerEmployee as registerEmployeeRequest,
} from '../services/authApi.js';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));
  const [error, setError] = useState('');

  const saveUser = useCallback((nextUser) => {
    setUser(nextUser);

    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setError('');
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      setError('');

      try {
        const response = await loginRequest(email, password);
        const data = response?.data ?? response ?? {};
        const nextToken = data.token;

        if (!nextToken) {
          throw new Error('La respuesta del servidor no incluyó un token.');
        }

        localStorage.setItem(TOKEN_KEY, nextToken);
        setToken(nextToken);

        const nextUser = data.user ?? null;
        if (nextUser) {
          saveUser(nextUser);
        }

        return nextUser;
      } catch (caughtError) {
        setError(caughtError.message ?? 'No se pudo iniciar sesión.');
        throw caughtError;
      } finally {
        setLoading(false);
      }
    },
    [saveUser]
  );

  const register = useCallback(async (payload) => {
    setError('');
    const response = await registerEmployeeRequest(payload);
    return response?.data ?? response ?? {};
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);

    getMe()
      .then((response) => {
        if (!active) return;
        const data = response?.data ?? response ?? {};
        saveUser(data.user ?? data);
      })
      .catch(() => {
        if (active) {
          logout();
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token, saveUser, logout]);

  useEffect(() => {
    window.addEventListener('auth:unauthorized', logout);
    return () => window.removeEventListener('auth:unauthorized', logout);
  }, [logout]);

  const value = useMemo(
    () => ({
      token,
      user,
      error,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      register,
      clearError: () => setError(''),
    }),
    [token, user, error, loading, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
