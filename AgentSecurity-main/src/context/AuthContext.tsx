import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { User, LoginResponse } from '../types/api';
import { api, setApiToken, setOnAuthExpired } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpiredMessage: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (email: string, password: string) => Promise<void>;
  logout: (message?: string) => void;
  clearExpiredMessage: () => void;
}

const STORAGE_KEY_TOKEN = 'agentshield_auth_token';
const STORAGE_KEY_USER = 'agentshield_auth_user';
const STORAGE_KEY_EXPIRES = 'agentshield_auth_expires';

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY_TOKEN);
    } catch {
      return null;
    }
  });

  const [expiresAt, setExpiresAt] = useState<number | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_EXPIRES);
      return saved ? Number(saved) : null;
    } catch {
      return null;
    }
  });

  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback((message?: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToken(null);
    setUser(null);
    setExpiresAt(null);
    setApiToken(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY_TOKEN);
      sessionStorage.removeItem(STORAGE_KEY_USER);
      sessionStorage.removeItem(STORAGE_KEY_EXPIRES);
    } catch {
      // Ignore storage errors
    }
    if (message) {
      setSessionExpiredMessage(message);
    }
  }, []);

  // Initialize and check token expiry on mount
  useEffect(() => {
    if (token && expiresAt) {
      const remainingMs = expiresAt - Date.now();
      if (remainingMs <= 0) {
        logout('Your session has expired. Please sign in again.');
      } else {
        setApiToken(token);
        timerRef.current = setTimeout(() => {
          logout('Your session has expired. Please sign in again.');
        }, remainingMs);
      }
    } else {
      setApiToken(null);
    }
    setIsLoading(false);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [token, expiresAt, logout]);

  // Hook 401 callback from API client
  useEffect(() => {
    setOnAuthExpired(() => {
      logout('Your session has expired. Please sign in again.');
    });
  }, [logout]);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const res = await api.login({ email, password });
    const expiresTimestamp = Date.now() + res.expires_in * 1000;

    setToken(res.access_token);
    setUser(res.user);
    setExpiresAt(expiresTimestamp);
    setApiToken(res.access_token);
    setSessionExpiredMessage(null);

    try {
      sessionStorage.setItem(STORAGE_KEY_TOKEN, res.access_token);
      sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user));
      sessionStorage.setItem(STORAGE_KEY_EXPIRES, String(expiresTimestamp));
    } catch {
      // Storage quota or restriction fallback
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      logout('Your session has expired. Please sign in again.');
    }, res.expires_in * 1000);

    return res;
  };

  const register = async (email: string, password: string): Promise<void> => {
    await api.register({ email, password });
    // After registration, immediately log the user in
    await login(email, password);
  };

  const clearExpiredMessage = () => {
    setSessionExpiredMessage(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        expiresAt,
        isAuthenticated: Boolean(token && user),
        isLoading,
        sessionExpiredMessage,
        login,
        register,
        logout,
        clearExpiredMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050506] flex items-center justify-center text-[#E8E8EC] font-sans">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-[#FF2A2A] animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-85" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-medium text-[#8A8A92] font-mono">Verifying security enclave...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const searchParams = new URLSearchParams();
    searchParams.set('redirect', location.pathname + location.search);
    return <NavigateToLogin searchParams={searchParams} />;
  }

  return <>{children}</>;
};

function NavigateToLogin({ searchParams }: { searchParams: URLSearchParams }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/login?${searchParams.toString()}`, { replace: true });
  }, [navigate, searchParams]);
  return null;
}

export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
};
