import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      // Registration successful, navigate to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start tracking your expenses today
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register('firstName')}
                type="text"
                label="First Name"
                icon={<User />}
                error={errors.firstName?.message}
                placeholder="John"
              />

              <Input
                {...register('lastName')}
                type="text"
                label="Last Name"
                icon={<User />}
                error={errors.lastName?.message}
                placeholder="Doe"
              />
            </div>

            {/* Email */}
            <Input
              {...register('email')}
              type="email"
              label="Email address"
              icon={<Mail />}
              error={errors.email?.message}
              placeholder="john.doe@example.com"
            />

            {/* Password */}
            <div className="relative">
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                icon={<Lock />}
                error={errors.password?.message}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                className="absolute right-4 top-11 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                icon={<Lock />}
                error={errors.confirmPassword?.message}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute right-4 top-11 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <p className="text-xs text-gray-600 mb-2">Password must contain:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• At least 8 characters</li>
                <li>• At least one letter</li>
                <li>• At least one number</li>
              </ul>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-600">
                  I agree to the{' '}
                  <a href="/terms" className="font-medium text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
            >
              Create Account
            </Button>

            {/* Login Link */}
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </span>
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-700 text-center">
                <strong>Free Account Features:</strong><br />
                ✓ Unlimited expense tracking<br />
                ✓ AI-powered categorization<br />
                ✓ Spending analytics & reports
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
