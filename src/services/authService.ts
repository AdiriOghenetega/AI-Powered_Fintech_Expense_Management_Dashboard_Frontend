import { apiRequest } from './api';
import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  TokenValidationResult 
} from '@/types/auth';

interface PasswordResetResponse {
  success: boolean;
  message: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await apiRequest<{ user: User; token: string }>('POST', '/auth/login', credentials);
    
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  async register(userData: RegisterData) {
    const response = await apiRequest<{ user: User; token: string }>('POST', '/auth/register', userData);
    
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  async getCurrentUser() {
    return await apiRequest<{ user: User }>('GET', '/auth/me');
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getStoredUser(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  },

  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    try {
      const response = await apiRequest<PasswordResetResponse>('POST', '/auth/forgot-password', {
        email: email.toLowerCase(),
      });
      
      return {
        success: response.success,
        message: response.message || 'If an account with that email exists, a password reset link has been sent.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'An error occurred while requesting password reset.',
      };
    }
  },

  async validateResetToken(token: string): Promise<TokenValidationResult> {
    try {
      const response = await apiRequest<{
        valid: boolean;
        expired?: boolean;
        used?: boolean;
      }>(
        'GET', 
        `/auth/validate-reset-token/${encodeURIComponent(token)}`
      );
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return { valid: false };
      }
    } catch (error: any) {
      // Handle specific error cases from the response
      if (error.data?.expired) {
        return { valid: false, expired: true };
      } else if (error.data?.used) {
        return { valid: false, used: true };
      }
      return { valid: false };
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<PasswordResetResponse> {
    try {
      const response = await apiRequest<PasswordResetResponse>('POST', '/auth/reset-password', {
        token,
        newPassword,
      });
      
      return {
        success: response.success,
        message: response.message || 'Password has been reset successfully.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'An error occurred while resetting password.',
      };
    }
  },

  // Admin/utility method
  async cleanupExpiredTokens(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiRequest<{ success: boolean; message: string; data?: { deletedCount: number } }>(
        'POST', 
        '/auth/cleanup-tokens'
      );
      
      return {
        success: response.success,
        message: response.message || 'Token cleanup completed.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to cleanup expired tokens.',
      };
    }
  },
};