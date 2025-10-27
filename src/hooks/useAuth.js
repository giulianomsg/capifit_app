// ================================================
// CAPIFIT - AUTHENTICATION HOOK
// ================================================
// Updated to work with local MySQL/PostgreSQL database
// ================================================

import { useEffect, useState } from 'react';
import { DatabaseService } from '../lib/database';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const checkCurrentUser = async () => {
      try {
        setLoading(true);
        
        // First check localStorage for cached user
        const cachedUser = localStorage.getItem('currentUser');
        const token = localStorage.getItem('authToken');
        
        if (cachedUser && token) {
          setUser(JSON.parse(cachedUser));
        }
        
        // Verify with server
        const currentUser = await DatabaseService?.getCurrentUser();
        setUser(currentUser);
        
        // Update localStorage if user exists
        if (currentUser) {
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
          // Clear invalid session
          localStorage.removeItem('currentUser');
          localStorage.removeItem('authToken');
        }
        
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    checkCurrentUser();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await DatabaseService?.signIn(email, password);
      
      if (error) {
        return { error };
      }
      
      setUser(data?.user);
      return { data, error: null };
    } catch (error) {
      return { error: error?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, userData) => {
    try {
      setLoading(true);
      const { data, error } = await DatabaseService?.signUp(email, password, userData);
      
      if (error) {
        return { error };
      }
      
      setUser(data?.user);
      return { data, error: null };
    } catch (error) {
      return { error: error?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await DatabaseService?.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout locally even if server call fails
      setUser(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      if (!user?.id) {
        throw new Error('No user logged in');
      }
      
      const { data, error } = await DatabaseService?.updateUser(user?.id, userData);
      
      if (error) {
        return { error };
      }
      
      // Update local user state
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      return { data, error: null };
    } catch (error) {
      return { error: error?.message || 'Profile update failed' };
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is trainer
  const isTrainer = () => {
    return hasRole('trainer');
  };

  // Check if user is client
  const isClient = () => {
    return hasRole('client');
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    isTrainer,
    isClient,
    isAdmin,
    isAuthenticated: !!user
  };
};

export default useAuth;