# GAIL Enhanced LMS - Complete Project Export

## Project Overview
This is an AI-Enhanced Learning Management System built for GAIL (Gas Authority of India Limited) with Next.js frontend and Express.js backend.

## Current Issue
Frontend cannot connect to backend - getting "Network error" when trying to login, even though backend APIs work via curl/Postman.

## Project Structure
```
enhanced-lms/
├── frontend/          # Next.js 14 frontend
├── backend/           # Express.js backend
└── COMPLETE_PROJECT_EXPORT.md
```

## Backend Code (Express.js + TypeScript)

### package.json
```json
{
  "name": "gail-lms-backend",
  "version": "1.0.0",
  "description": "Backend for GAIL Enhanced LMS",
  "main": "src/server.ts",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "socket.io": "^4.7.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.5.0",
    "multer": "^1.4.5-lts.1",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/bcryptjs": "^2.4.2",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/multer": "^1.4.7",
    "@types/compression": "^1.7.2",
    "@types/morgan": "^1.9.4",
    "typescript": "^5.1.6",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1"
  }
}
```

### src/server.ts
```typescript
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
  },
});

// CORS configuration - More permissive for development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200, // For legacy browser support
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Explicit OPTIONS handler for CORS preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'development',
  });
});

// Simple API Routes
app.get('/api/courses', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Introduction to GAIL Operations',
        description: 'Learn the basics of GAIL operations and safety protocols',
        category: 'Operations',
        difficulty: 'beginner',
        estimatedDuration: 4,
        isMandatory: true,
      },
      {
        id: '2',
        title: 'Advanced Pipeline Management',
        description: 'Advanced techniques for pipeline monitoring and maintenance',
        category: 'Technical',
        difficulty: 'advanced',
        estimatedDuration: 8,
        isMandatory: false,
      },
    ],
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Demo authentication
  if (email === 'admin@gail.com' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          email: 'admin@gail.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          department: 'Information Technology',
        },
        token: 'demo-jwt-token-admin',
      },
    });
  } else if (email === 'learner@gail.com' && password === 'learner123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '2',
          email: 'learner@gail.com',
          firstName: 'Learner',
          lastName: 'User',
          role: 'learner',
          department: 'Operations',
        },
        token: 'demo-jwt-token-learner',
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server
const port = 9999;
server.listen(port, '127.0.0.1', () => {
  console.log(`🚀 Server running on http://127.0.0.1:${port}`);
  console.log(`📊 Health check: http://127.0.0.1:${port}/health`);
  console.log(`🌐 Also accessible on http://localhost:${port}`);
});
```

## Frontend Code (Next.js 14 + TypeScript)

### package.json
```json
{
  "name": "gail-lms-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "next": "14.0.4",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "@tailwindcss/forms": "^0.5.7",
    "@tailwindcss/typography": "^0.5.10",
    "@tailwindcss/aspect-ratio": "^0.4.2",
    "eslint": "^8",
    "eslint-config-next": "14.0.4"
  }
}
```

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        gail: {
          blue: '#0ea5e9',
          navy: '#1e40af',
          gray: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### src/app/layout.tsx
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GAIL Enhanced LMS',
  description: 'AI-Powered Learning Management System for GAIL Employees',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          {children}
        </div>
      </body>
    </html>
  );
}
```

### src/app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }

  .btn-secondary {
    @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors;
  }

  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  }
}
```

### src/app/page.tsx (Login Page - THE PROBLEMATIC FILE)
```typescript
'use client';

import { useState } from 'react';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const testBackend = async () => {
    try {
      console.log('Testing backend health...');
      const response = await fetch('http://127.0.0.1:9999/health', {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Health check response:', response.status, response.ok);
      const data = await response.json();
      console.log('Health check data:', data);
      alert('Backend is working! Check console for details.');
    } catch (error) {
      console.error('Health check error:', error);
      alert(`Backend test failed: ${error.message}`);
    }
  };

  const testLogin = async () => {
    try {
      console.log('Testing login API...');
      const response = await fetch('http://127.0.0.1:9999/api/auth/login', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'learner@gail.com', password: 'learner123' }),
      });
      console.log('Login test response:', response.status, response.ok);
      const data = await response.json();
      console.log('Login test data:', data);
      alert('Login API is working! Check console for details.');
    } catch (error) {
      console.error('Login test error:', error);
      alert(`Login test failed: ${error.message}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email, password });
      console.log('Fetching from:', 'http://127.0.0.1:9999/api/auth/login');

      const response = await fetch(`http://127.0.0.1:9999/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        // Store token and redirect to dashboard
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error details:', error);
      setError(`Network error: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">GAIL Enhanced LMS</h2>
          <p className="mt-2 text-gray-600">AI-Powered Learning Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Demo Credentials</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Admin:</strong> admin@gail.com / admin123</p>
              <p><strong>Learner:</strong> learner@gail.com / learner123</p>
            </div>
            <div className="mt-3 space-y-2">
              <button
                onClick={testBackend}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Test Backend Health
              </button>
              <button
                onClick={testLogin}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-700 transition-colors"
              >
                Test Login API
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>For GAIL employees only</p>
          <p>Need help? Contact IT Support at <a href="mailto:it-support@gail.com" className="text-blue-600 hover:underline">it-support@gail.com</a></p>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Security Notice</p>
              <p>This is a secure internal system. All activities are logged and monitored for security purposes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### src/app/dashboard/page.tsx
```typescript
'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Fetch courses
    const fetchCourses = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:9999/api/courses`);
        const data = await response.json();
        if (data.success) {
          setCourses(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    fetchCourses();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access the dashboard.</p>
          <a href="/" className="btn-primary">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">GAIL Enhanced LMS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.firstName}!</span>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.firstName}!</h2>
          <p className="text-blue-100">Ready to continue your learning journey?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Courses Enrolled</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Study Groups</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">25%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Available Courses */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Available Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {course.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">{course.estimatedDuration}h</span>
                </div>
                <button className="w-full mt-4 btn-primary">
                  Start Course
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
```

## Problem Description

### Current Issue
The frontend React app cannot connect to the Express.js backend. Specifically:

1. **Backend is working**: curl/Postman requests to `http://127.0.0.1:9999/health` and `http://127.0.0.1:9999/api/auth/login` work perfectly
2. **Frontend fails**: Both test buttons ("Test Backend Health" and "Test Login API") fail with network errors
3. **Login fails**: Actual login attempts result in "Network error" messages

### What We've Tried
1. **CORS Configuration**: Made CORS very permissive (origin: true)
2. **Explicit OPTIONS Handler**: Added preflight request handling
3. **IP Address Change**: Changed from localhost to 127.0.0.1
4. **Port Management**: Ensured no port conflicts
5. **Enhanced Debugging**: Added detailed console logging
6. **Clean Restarts**: Killed all processes and restarted cleanly

### Current Status
- Backend: Running on http://127.0.0.1:9999 ✅
- Frontend: Running on http://localhost:3000 ✅
- Backend APIs: Working via curl/Postman ✅
- Frontend-to-Backend: Failing ❌

### Expected Behavior
The frontend should be able to fetch data from the backend APIs, but all fetch requests are failing with network errors.

### Environment
- Windows 11
- Node.js (latest)
- Next.js 14
- Express.js 4.18.2
- TypeScript

Please help identify why the frontend cannot connect to the backend despite both services running correctly.
```
```
