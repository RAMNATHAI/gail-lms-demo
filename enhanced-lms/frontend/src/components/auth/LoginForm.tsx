'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

// TC-001: User Login validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // TC-001: User Login & TC-002: Invalid Login handling
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Login successful! Welcome to GAIL LMS');
    } catch (error: any) {
      // TC-002: Invalid Login error handling
      const errorMessage = error.response?.data?.message || 'Invalid credentials';
      
      if (error.response?.status === 401) {
        setError('email', { message: 'Invalid email or password' });
        setError('password', { message: 'Invalid email or password' });
      } else if (error.response?.status === 429) {
        toast.error('Too many login attempts. Please try again later.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        {/* GAIL Logo */}
        <div className="text-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/GAIL_Logo.svg/1200px-GAIL_Logo.svg.png"
            alt="GAIL Logo"
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">
            GAIL Enhanced LMS
          </h1>
          <p className="text-gray-600 mt-2">
            AI-Powered Learning Management System
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your GAIL email"
              {...register('email')}
              error={errors.email?.message}
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
                error={errors.password?.message}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            loading={isLoading}
          >
            <LogIn className="w-4 h-4 mr-2" />
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Additional Information */}
        <div className="text-center text-sm text-gray-600">
          <p>For GAIL employees only</p>
          <p className="mt-1">
            Need help? Contact IT Support at{' '}
            <a href="mailto:it-support@gail.com" className="text-primary-600 hover:underline">
              it-support@gail.com
            </a>
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-amber-800">
              <p className="font-medium">Security Notice</p>
              <p className="mt-1">
                This is a secure internal system. All activities are logged and monitored.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Demo credentials component for development
export function DemoCredentials() {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Card className="mt-4 p-4 bg-blue-50 border-blue-200">
      <h3 className="font-medium text-blue-900 mb-2">Demo Credentials</h3>
      <div className="text-sm text-blue-800 space-y-1">
        <p><strong>Admin:</strong> admin@gail.com / admin123</p>
        <p><strong>Instructor:</strong> instructor@gail.com / instructor123</p>
        <p><strong>Learner:</strong> learner@gail.com / learner123</p>
      </div>
    </Card>
  );
}
