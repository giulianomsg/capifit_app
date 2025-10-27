// ================================================
// CAPIFIT - DATABASE CONNECTION HANDLER
// ================================================
// This file handles both MySQL and PostgreSQL connections
// and provides a unified interface for database operations
// ================================================

import axios from 'axios';

// Database configuration from environment variables
const DB_CONFIG = {
  type: import.meta.env?.VITE_DB_TYPE || 'postgresql', // 'mysql' or 'postgresql'
  host: import.meta.env?.VITE_DB_HOST || 'localhost',
  port: import.meta.env?.VITE_DB_PORT || (import.meta.env?.VITE_DB_TYPE === 'mysql' ? 3306 : 5432),
  database: import.meta.env?.VITE_DB_NAME || 'capifit_db',
  user: import.meta.env?.VITE_DB_USER || 'capifit_user',
  password: import.meta.env?.VITE_DB_PASSWORD || 'capifit_password',
  apiUrl: import.meta.env?.VITE_API_URL || 'http://localhost:3001/api'
};

// API client instance
const apiClient = axios?.create({
  baseURL: DB_CONFIG?.apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
apiClient?.interceptors?.request?.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Database operations class
export class DatabaseService {
  
  // ==========================================
  // AUTHENTICATION METHODS
  // ==========================================
  
  static async signIn(email, password) {
    try {
      const response = await apiClient?.post('/auth/signin', { email, password });
      const { user, token } = response?.data;
      
      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      return { data: { user }, error: null };
    } catch (error) {
      return { data: null, error: error?.response?.data?.message || 'Login failed' };
    }
  }
  
  static async signUp(email, password, userData) {
    try {
      const response = await apiClient?.post('/auth/signup', { 
        email, 
        password, 
        ...userData 
      });
      const { user, token } = response?.data;
      
      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      return { data: { user }, error: null };
    } catch (error) {
      return { data: null, error: error?.response?.data?.message || 'Registration failed' };
    }
  }
  
  static async signOut() {
    try {
      await apiClient?.post('/auth/signout');
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      return { error: null };
    } catch (error) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      return { error: null };
    }
  }
  
  static async getCurrentUser() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      
      const response = await apiClient?.get('/auth/me');
      return response?.data?.user;
    } catch (error) {
      // If token is invalid, clear it
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      return null;
    }
  }
  
  // ==========================================
  // GENERIC CRUD OPERATIONS
  // ==========================================
  
  static async select(table, options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options?.where) {
        params?.append('where', JSON.stringify(options?.where));
      }
      if (options?.orderBy) {
        params?.append('orderBy', JSON.stringify(options?.orderBy));
      }
      if (options?.limit) {
        params?.append('limit', options?.limit);
      }
      if (options?.offset) {
        params?.append('offset', options?.offset);
      }
      
      const response = await apiClient?.get(`/${table}?${params}`);
      return { data: response?.data, error: null };
    } catch (error) {
      return { data: null, error: error?.response?.data?.message || 'Query failed' };
    }
  }
  
  static async insert(table, data) {
    try {
      const response = await apiClient?.post(`/${table}`, data);
      return { data: response?.data, error: null };
    } catch (error) {
      return { data: null, error: error?.response?.data?.message || 'Insert failed' };
    }
  }
  
  static async update(table, id, data) {
    try {
      const response = await apiClient?.put(`/${table}/${id}`, data);
      return { data: response?.data, error: null };
    } catch (error) {
      return { data: null, error: error?.response?.data?.message || 'Update failed' };
    }
  }
  
  static async delete(table, id) {
    try {
      await apiClient?.delete(`/${table}/${id}`);
      return { error: null };
    } catch (error) {
      return { error: error?.response?.data?.message || 'Delete failed' };
    }
  }
  
  // ==========================================
  // SPECIFIC BUSINESS OPERATIONS
  // ==========================================
  
  // Users operations
  static async getUsers(filters = {}) {
    return this.select('users', { where: filters });
  }
  
  static async createUser(userData) {
    return this.insert('users', userData);
  }
  
  static async updateUser(userId, userData) {
    return this.update('users', userId, userData);
  }
  
  // Clients operations
  static async getClients(trainerId = null) {
    const where = trainerId ? { trainer_id: trainerId } : {};
    return this.select('clients', { where });
  }
  
  static async createClient(clientData) {
    return this.insert('clients', clientData);
  }
  
  static async updateClient(clientId, clientData) {
    return this.update('clients', clientId, clientData);
  }
  
  static async deleteClient(clientId) {
    return this.delete('clients', clientId);
  }
  
  // Exercises operations
  static async getExercises(filters = {}) {
    return this.select('exercises', { 
      where: filters,
      orderBy: { name: 'asc' }
    });
  }
  
  static async createExercise(exerciseData) {
    return this.insert('exercises', exerciseData);
  }
  
  static async updateExercise(exerciseId, exerciseData) {
    return this.update('exercises', exerciseId, exerciseData);
  }
  
  // Workouts operations
  static async getWorkouts(filters = {}) {
    return this.select('workouts', { 
      where: filters,
      orderBy: { created_at: 'desc' }
    });
  }
  
  static async createWorkout(workoutData) {
    return this.insert('workouts', workoutData);
  }
  
  static async updateWorkout(workoutId, workoutData) {
    return this.update('workouts', workoutId, workoutData);
  }
  
  // Physical assessments operations
  static async getPhysicalAssessments(clientId) {
    return this.select('physical_assessments', { 
      where: { client_id: clientId },
      orderBy: { assessment_date: 'desc' }
    });
  }
  
  static async createPhysicalAssessment(assessmentData) {
    return this.insert('physical_assessments', assessmentData);
  }
  
  // Foods operations
  static async getFoods(filters = {}) {
    return this.select('foods', { 
      where: filters,
      orderBy: { name: 'asc' }
    });
  }
  
  static async createFood(foodData) {
    return this.insert('foods', foodData);
  }
  
  // Meal plans operations
  static async getMealPlans(filters = {}) {
    return this.select('meal_plans', { 
      where: filters,
      orderBy: { created_at: 'desc' }
    });
  }
  
  static async createMealPlan(mealPlanData) {
    return this.insert('meal_plans', mealPlanData);
  }
  
  // Messages operations
  static async getMessages(userId) {
    return this.select('messages', { 
      where: {
        $or: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      orderBy: { created_at: 'desc' }
    });
  }
  
  static async sendMessage(messageData) {
    return this.insert('messages', messageData);
  }
  
  static async markMessageAsRead(messageId) {
    return this.update('messages', messageId, { is_read: true });
  }
  
  // Notifications operations
  static async getNotifications(userId) {
    return this.select('notifications', { 
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
  }
  
  static async createNotification(notificationData) {
    return this.insert('notifications', notificationData);
  }
  
  static async markNotificationAsRead(notificationId) {
    return this.update('notifications', notificationId, { is_read: true });
  }
  
  // File upload operations
  static async uploadFile(fileData) {
    try {
      const formData = new FormData();
      formData?.append('file', fileData?.file);
      formData?.append('upload_purpose', fileData?.upload_purpose);
      
      const response = await apiClient?.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return { data: response?.data, error: null };
    } catch (error) {
      return { data: null, error: error?.response?.data?.message || 'Upload failed' };
    }
  }
}

// Backward compatibility with Supabase-style exports
export const db = DatabaseService;

// Auth helpers
export const signIn = DatabaseService?.signIn;
export const signUp = DatabaseService?.signUp;
export const signOut = DatabaseService?.signOut;
export const getCurrentUser = DatabaseService?.getCurrentUser;

// Default export
export default DatabaseService;