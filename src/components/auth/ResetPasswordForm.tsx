import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { usePasswordReset } from '@/hooks/useAuth';

const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const { 
    validateResetToken, 
    resetPassword, 
    passwordResetState 
  } = usePasswordReset();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPassword = watch('newPassword');

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError('Invalid or missing reset token');
        setIsValidating(false);
        return;
      }

      try {
        const result = await validateResetToken(token);
        
        if (result.valid) {
          setTokenValid(true);
        } else {
          let errorMessage = 'Invalid reset token';
          if (result.expired) {
            errorMessage = 'Reset token has expired. Please request a new password reset.';
          } else if (result.used) {
            errorMessage = 'Reset token has already been used. Please request a new password reset.';
          }
          setTokenError(errorMessage);
        }
      } catch (err: any) {
        setTokenError(err.message || 'An error occurred while validating the reset token');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, validateResetToken]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    const result = await resetPassword(token, data.newPassword);
    
    if (result.success) {
      setIsSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || 'bg-gray-300',
    };
  };

  const passwordStrength = getPasswordStrength(newPassword || '');

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Validating reset token...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {isSuccess ? 'Password reset successful!' : 'Set new password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSuccess 
              ? 'Your password has been updated. You can now sign in with your new password.'
              : 'Please enter a strong password for your account.'
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          {!tokenValid && !isSuccess ? (
            // Invalid Token State
            <div className="text-center space-y-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Invalid Reset Link</h3>
                <p className="mt-2 text-sm text-red-600">{tokenError}</p>
              </div>

              <div className="space-y-3">
                <Link to="/forgot-password">
                  <Button className="w-full">
                    Request New Reset Link
                  </Button>
                </Link>
                
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            // Success State
            <div className="text-center space-y-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Password Updated!</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Your password has been successfully updated. You will be redirected to the login page shortly.
                </p>
              </div>

              <div className="space-y-3">
                <Link to="/login">
                  <Button className="w-full">
                    Continue to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            // Reset Password Form
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {passwordResetState.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{passwordResetState.error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* New Password */}
              <div className="relative">
                <Input
                  {...register('newPassword')}
                  type={showPassword ? 'text' : 'password'}
                  label="New Password"
                  icon={<Lock />}
                  error={errors.newPassword?.message}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Password strength:</span>
                    <span className={`text-sm font-medium ${
                      passwordStrength.strength <= 2 ? 'text-red-600' :
                      passwordStrength.strength === 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div className="relative">
                <Input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm New Password"
                  icon={<Lock />}
                  error={errors.confirmPassword?.message}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <p className="text-xs text-gray-600 mb-2">Password must contain:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li className={`flex items-center ${newPassword && newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{newPassword && newPassword.length >= 8 ? '✓' : '•'}</span>
                    At least 8 characters
                  </li>
                  <li className={`flex items-center ${newPassword && /[A-Za-z]/.test(newPassword) ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{newPassword && /[A-Za-z]/.test(newPassword) ? '✓' : '•'}</span>
                    At least one letter
                  </li>
                  <li className={`flex items-center ${newPassword && /[0-9]/.test(newPassword) ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{newPassword && /[0-9]/.test(newPassword) ? '✓' : '•'}</span>
                    At least one number
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                loading={passwordResetState.isLoading}
                className="w-full"
                disabled={!newPassword || passwordStrength.strength < 2}
              >
                Update Password
              </Button>

              {/* Back to Login */}
              <div className="text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};