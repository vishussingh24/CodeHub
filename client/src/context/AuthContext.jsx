import {
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { authApi } from '../lib/api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [providers, setProviders] = useState({
    google: false,
    github: false,
  });
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function bootstrapAuth() {
      try {
        const [providersResult, currentUserResult] = await Promise.allSettled([
          authApi.getProviders(),
          authApi.getCurrentUser(),
        ]);

        if (!isActive) {
          return;
        }

        if (providersResult.status === 'fulfilled') {
          setProviders(providersResult.value.providers);
        }

        if (currentUserResult.status === 'fulfilled') {
          setUser(currentUserResult.value.user);
        } else {
          setUser(null);
        }
      } finally {
        if (isActive) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrapAuth();

    return () => {
      isActive = false;
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const result = await authApi.getCurrentUser();
    setUser(result.user);
    return result.user;
  }, []);

  const login = useCallback(async (payload) => {
    setIsSubmitting(true);
    try {
      const result = await authApi.login(payload);
      setUser(result.user);
      return result.user;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const signup = useCallback(async (payload) => {
    setIsSubmitting(true);
    try {
      const result = await authApi.signup(payload);
      setUser(result.user);
      return result.user;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await authApi.logout();
      setUser(null);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        providers,
        isAuthenticated: Boolean(user),
        isBootstrapping,
        isSubmitting,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
