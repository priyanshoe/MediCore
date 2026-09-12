import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';
import AuthService from '../services/AuthService';
import PatientService from '../services/PatientService';
import DoctorService from '../services/DoctorService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load existing session on initial load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('medical_user');
      const storedToken = localStorage.getItem('medical_token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
      localStorage.removeItem('medical_user');
      localStorage.removeItem('medical_token');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Simple mock login flow:
   * 1. Query users from API
   * 2. Validate email and password
   * 3. Save user and mock token to localStorage
   */
  const login = async (email, password) => {
    try {
      const response = await AuthService.login(email, password);
      const user = response.data || [];

      if (!user) {
        return { success: false, message: 'Invalid email or password.' };
      }

      if (user.status === 'Inactive') {
        return { success: false, message: 'Your account is deactivated. Please contact an Admin.' };
      }

      // Store auth state
      let authUser = null;
      if (user.role === 'PATIENT') {
        const result = await PatientService.findByUserId(user.id)
        authUser = { ...result.data[0], role: 'PATIENT' }
      }
      if (user.role === 'DOCTOR') {
        const result = await DoctorService.findById(user.id)
        authUser = { ...result.data[0], role: 'PATIENT' }
      }
      localStorage.setItem('medical_user', JSON.stringify(authUser));
      localStorage.setItem('medical_token', `mock_token_${Date.now()}`);
      setUser(user);

      return { success: true, user: user };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'An error occurred while logging in. Please try again.' };
    }
  };

  /**
   * Patient-only public registration:
   * Role is strictly set to PATIENT
   */
  const register = async (userData) => {
    try {

      const Response = await AuthService.register(userData);
      // Auto login newly registered patient
      const result = Response.data;
      let createdUser = null;
      if (result.role === 'PATIENT') {
        createdUser = await PatientService.findById(result.id)
      }
      if (result.role === 'DOCTOR') {
        createdUser = await DoctorService.findById(result.id)
      }
      localStorage.setItem('medical_user', JSON.stringify(createdUser));
      localStorage.setItem('medical_token', `mock_token_${Date.now()}`);
      setUser(createdUser);


      return { success: true, user: createdUser };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, message: 'Failed to create account. Please try again.' };
    }
  };

  /**
   * Logout user and clear tokens
   */
  const logout = () => {
    localStorage.removeItem('medical_user');
    localStorage.removeItem('medical_token');
    setUser(null);
  };

  /**
   * Update current user profile
   */
  const updateUser = async (updates) => {
    if (!user) return { success: false, message: 'No active session' };

    try {
      const response = await api.patch(`/users/${user.id}`, updates);
      const updatedUser = response.data;

      localStorage.setItem('medical_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error('Profile update error:', err);
      return { success: false, message: 'Failed to update profile.' };
    }
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
