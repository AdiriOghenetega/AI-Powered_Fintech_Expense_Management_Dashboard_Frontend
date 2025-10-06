import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { usePasswordReset } from '@/hooks/useAuth';

const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm: React.FC = () => {
  const { 
    requestPasswordReset, 
    passwordResetState, 
    clearPasswordResetState 
  } = usePasswordReset();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await requestPasswordReset(data.email);
  };

  const handleResendEmail = async () => {
    const email = getValues('email');
    if (email) {
      clearPasswordResetState(); // Clear previous state
      await requestPasswordReset(email);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {passwordResetState.isSubmitted ? 'Check your email' : 'Forgot your password?'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {passwordResetState.isSubmitted 
              ? 'We\'ve sent password reset instructions to your email address.'
              : 'No worries! Enter your email and we\'ll send you reset instructions.'
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          {!passwordResetState.isSubmitted ? (
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

              <Input
                {...register('email')}
                type="email"
                label="Email address"
                icon={<Mail />}
                error={errors.email?.message}
                placeholder="Enter your email address"
                autoComplete="email"
                autoFocus
              />

              <Button
                type="submit"
                loading={passwordResetState.isLoading}
                className="w-full"
              >
                Send reset instructions
              </Button>

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
          ) : (
            <div className="text-center space-y-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Email sent!</h3>
                <p className="mt-2 text-sm text-gray-600">
                  We've sent password reset instructions to{' '}
                  <span className="font-medium">{getValues('email')}</span>
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                
                <Button
                  variant="secondary"
                  onClick={handleResendEmail}
                  loading={passwordResetState.isLoading}
                  className="w-full"
                >
                  Resend email
                </Button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to sign in
                </Link>
              </div>
            </div>
          )}
        </Card>

        {/* Help Section */}
        <div className="mt-6">
          <Card>
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Still need help?</h4>
              <p className="text-xs text-gray-600 mb-3">
                If you're having trouble resetting your password, contact our support team.
              </p>
              <a 
                href="mailto:support@fintech.com" 
                className="text-xs text-blue-600 hover:text-blue-500 font-medium"
              >
                Contact Support
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};