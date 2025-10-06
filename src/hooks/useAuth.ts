import { useState, useEffect, createContext, useContext } from 'react';
import type { AuthState } from '@/types/auth';
import { authService } from '@/services/authService';

interface PasswordResetState {
  isLoading: boolean;
  error: string | null;
  isSubmitted: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
  
  // password reset methods
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  validateResetToken: (token: string) => Promise<{ valid: boolean; expired?: boolean; used?: boolean }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  
  // Password reset state
  passwordResetState: PasswordResetState;
  clearPasswordResetState: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [passwordResetState, setPasswordResetState] = useState<PasswordResetState>({
    isLoading: false,
    error: null,
    isSubmitted: false,
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getStoredToken();
        const user = authService.getStoredUser();

        if (token && user) {
          // Verify token is still valid by making a request
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setAuthState({
              user: response.data.user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        }
      } catch (error) {
        // Token is invalid, clear storage
        authService.logout();
        console.log('Token validation failed, user logged out');
      }

      // No valid authentication found
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    };

    initAuth();
  }, []);

  // Existing auth methods
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.data) {
        setAuthState({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
    try {
      const response = await authService.register(userData);
      if (response.success && response.data) {
        setAuthState({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    // Clear password reset state on logout
    setPasswordResetState({
      isLoading: false,
      error: null,
      isSubmitted: false,
    });
  };

  // password reset methods
  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    setPasswordResetState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await authService.requestPasswordReset(email);
      
      setPasswordResetState({
        isLoading: false,
        error: result.success ? null : result.message,
        isSubmitted: result.success,
      });

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred while requesting password reset';
      setPasswordResetState({
        isLoading: false,
        error: errorMessage,
        isSubmitted: false,
      });

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const validateResetToken = async (token: string): Promise<{ valid: boolean; expired?: boolean; used?: boolean }> => {
    try {
      return await authService.validateResetToken(token);
    } catch (error: any) {
      console.error('Token validation error:', error);
      return { valid: false };
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    setPasswordResetState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await authService.resetPassword(token, newPassword);
      
      setPasswordResetState({
        isLoading: false,
        error: result.success ? null : result.message,
        isSubmitted: result.success,
      });

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred while resetting password';
      setPasswordResetState({
        isLoading: false,
        error: errorMessage,
        isSubmitted: false,
      });

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const clearPasswordResetState = () => {
    setPasswordResetState({
      isLoading: false,
      error: null,
      isSubmitted: false,
    });
  };

  return {
    ...authState,
    login,
    register,
    logout,
    requestPasswordReset,
    validateResetToken,
    resetPassword,
    passwordResetState,
    clearPasswordResetState,
  };
};

// Custom hook for password reset functionality
export const usePasswordReset = () => {
  const context = useAuth();
  
  return {
    requestPasswordReset: context.requestPasswordReset,
    validateResetToken: context.validateResetToken,
    resetPassword: context.resetPassword,
    passwordResetState: context.passwordResetState,
    clearPasswordResetState: context.clearPasswordResetState,
  };
};