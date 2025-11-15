import axios from 'axios';
import type { ApiResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Event emitter for backend warmup events
type WarmupEventListener = (needsWarmup: boolean) => void;
const warmupListeners: WarmupEventListener[] = [];

export const onBackendWarmupNeeded = (listener: WarmupEventListener) => {
  warmupListeners.push(listener);
  return () => {
    const index = warmupListeners.indexOf(listener);
    if (index > -1) warmupListeners.splice(index, 1);
  };
};

const emitWarmupEvent = (needsWarmup: boolean) => {
  warmupListeners.forEach(listener => listener(needsWarmup));
};

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and handle FormData
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Handle FormData - let browser set Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and warmup detection
api.interceptors.response.use(
  (response) => {
    // Successful response - backend is up
    emitWarmupEvent(false);
    return response;
  },
  (error) => {
    // Check if this is a network error that might indicate backend is down
    const isNetworkError = 
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout') ||
      !error.response;

    if (isNetworkError) {
      // Emit warmup event
      emitWarmupEvent(true);
      
      // Return a custom error that can be detected
      return Promise.reject({
        ...error,
        isBackendDown: true,
        needsWarmup: true,
      });
    }

    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Generic API helper with retry logic
export const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  retries: number = 0
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.request({
      method,
      url,
      data,
    });
    return response.data;
  } catch (error: any) {
    // If backend needs warmup and we haven't retried too many times, wait and retry
    if (error.needsWarmup && retries < 1) {
      // Don't auto-retry - let the warmup component handle it
      // Just throw the error with warmup flag
      throw {
        ...error,
        needsWarmup: true,
        isBackendDown: true,
      };
    }

    if (error.response?.data) {
      throw error.response.data;
    }
    
    throw {
      success: false,
      message: error.needsWarmup 
        ? 'Backend is starting up. Please wait...' 
        : 'Network error occurred',
      needsWarmup: error.needsWarmup || false,
    };
  }
};