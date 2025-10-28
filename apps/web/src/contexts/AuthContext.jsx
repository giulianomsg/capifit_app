import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { clearSession, loadSession, persistSession } from '../lib/authStorage';
import { clearAccessToken, setAccessToken } from '../lib/httpClient';
import { fetchProfile, login as loginRequest, logout as logoutRequest, register as registerRequest } from '../services/authService';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      setStatus('loading');
      setError(null);

      try {
        const { token, user: storedUser } = loadSession();
        if (!token) {
          setStatus('unauthenticated');
          setUser(null);
          return;
        }

        setAccessToken(token);
        if (storedUser) {
          setUser(storedUser);
        }

        const profile = await fetchProfile();
        setUser(profile);
        persistSession({ token, user: profile });
        setStatus('authenticated');
      } catch (initError) {
        console.error('Failed to restore session', initError);
        clearAccessToken();
        clearSession();
        setUser(null);
        setStatus('unauthenticated');
      }
    };

    void initialize();
  }, []);

  useEffect(() => {
    const handler = () => {
      clearSession();
      clearAccessToken();
      setUser(null);
      setStatus('unauthenticated');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('capifit:session-expired', handler);
      return () => {
        window.removeEventListener('capifit:session-expired', handler);
      };
    }
    return undefined;
  }, []);

  const refreshProfile = useCallback(async () => {
    const session = loadSession();
    if (!session.token) {
      throw new Error('No active session');
    }

    const profile = await fetchProfile();
    setUser(profile);
    persistSession({ token: session.token, user: profile });
    setStatus('authenticated');
    return profile;
  }, []);

  const handleLogin = useCallback(async (credentials) => {
    setStatus('loading');
    setError(null);
    try {
      const result = await loginRequest(credentials);
      persistSession({ token: result.token, user: result.user });
      setAccessToken(result.token);
      setUser(result.user);
      setStatus('authenticated');
      return result;
    } catch (loginError) {
      setStatus('unauthenticated');
      setError(loginError);
      throw loginError;
    }
  }, []);

  const handleRegister = useCallback(async (payload) => {
    setStatus('loading');
    setError(null);
    try {
      const result = await registerRequest(payload);
      persistSession({ token: result.token, user: result.user });
      setAccessToken(result.token);
      setUser(result.user);
      setStatus('authenticated');
      return result;
    } catch (registerError) {
      setStatus('unauthenticated');
      setError(registerError);
      throw registerError;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (logoutError) {
      console.error('Failed to call logout endpoint', logoutError);
    } finally {
      clearSession();
      clearAccessToken();
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      error,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      refreshProfile,
      isAuthenticated: status === 'authenticated',
    }),
    [error, handleLogin, handleLogout, handleRegister, refreshProfile, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
