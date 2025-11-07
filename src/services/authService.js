import { supabase } from '../lib/supabase';

export const authService = {
  // Sign up new user
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.fullName || '',
            role: userData?.role || 'client'
          }
        }
      })
      
      if (error) {
        return { error }
      }
      
      return { data, error: null }
    } catch (error) {
      return { 
        error: { 
          message: 'Network error. Please check your connection and try again.' 
        } 
      }
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        return { error }
      }
      
      return { data, error: null }
    } catch (error) {
      return { 
        error: { 
          message: 'Network error. Please check your connection and try again.' 
        } 
      }
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase?.auth?.signOut()
      return { error }
    } catch (error) {
      return { 
        error: { 
          message: 'Network error. Please try again.' 
        } 
      }
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase?.auth?.getSession()
      return { session, error }
    } catch (error) {
      return { 
        session: null, 
        error: { 
          message: 'Unable to get session.' 
        } 
      }
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { data, error } = await supabase?.auth?.resetPasswordForEmail(email, {
        redirectTo: `${window.location?.origin}/reset-password`
      })
      
      return { data, error }
    } catch (error) {
      return { 
        error: { 
          message: 'Network error. Please try again.' 
        } 
      }
    }
  },

  // Update password
  async updatePassword(password) {
    try {
      const { data, error } = await supabase?.auth?.updateUser({
        password
      })
      
      return { data, error }
    } catch (error) {
      return { 
        error: { 
          message: 'Network error. Please try again.' 
        } 
      }
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.eq('id', userId)
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        data: null, 
        error: { 
          message: 'Unable to load profile.' 
        } 
      }
    }
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.update(updates)
        ?.eq('id', userId)
        ?.select()
        ?.single()
      
      return { data, error }
    } catch (error) {
      return { 
        error: { 
          message: 'Unable to update profile.' 
        } 
      }
    }
  }
}