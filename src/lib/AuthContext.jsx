import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '@/api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const formatUser = (userData) => {
    if (userData && userData.firstName && userData.lastName) {
      userData.full_name = `${userData.firstName} ${userData.lastName}`;
    }
    return userData;
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');

      // First, set state from local storage if available for immediate responsiveness
      if (token && storedUser) {
        setUser(formatUser(JSON.parse(storedUser)));
        setIsAuthenticated(true);
        
        // Then, optionally refresh from backend to get fresh onboarding progress
        try {
          const data = await authApi.getMe();
          const refreshedUser = formatUser(data.user);
          setUser(refreshedUser);
          localStorage.setItem('auth_user', JSON.stringify(refreshedUser));
        } catch (err) {
          console.warn('Backend user refresh failed, using cached data');
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (email, password) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const data = await authApi.login({ email, password });
      const formattedUser = formatUser(data.user);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(formattedUser));
      setUser(formattedUser);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      setAuthError({ type: 'login_failed', message: error.message });
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const register = async (userData) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const data = await authApi.register(userData);
      const formattedUser = formatUser(data.user);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(formattedUser));
      setUser(formattedUser);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      setAuthError({ type: 'registration_failed', message: error.message });
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const updateUser = (updatedUserData) => {
    const newUser = formatUser({ ...user, ...updatedUserData });
    setUser(newUser);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/auth';
  };

  const navigateToLogin = () => {
    window.location.href = '/auth';
  };

  // Compatibility with existing code
  const isLoadingPublicSettings = false; 
  const appPublicSettings = { id: 'custom' };
  const checkAppState = async () => {};

  return (
    <AuthContext.Provider value={{ 
      user,
      setUser,
      updateUser,
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      login,
      register,
      navigateToLogin,
      checkAppState
    }}>
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