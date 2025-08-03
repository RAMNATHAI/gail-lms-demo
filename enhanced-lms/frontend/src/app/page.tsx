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
      console.log('=== BACKEND HEALTH TEST START ===');
      console.log('URL:', 'http://127.0.0.1:9999/health');
      console.log('Method: GET');
      console.log('Mode: cors');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/health', {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Response received!');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('OK:', response.ok);
      console.log('Headers:', [...response.headers.entries()]);

      const data = await response.json();
      console.log('Response data:', data);
      console.log('=== BACKEND HEALTH TEST SUCCESS ===');

      alert(`✅ Backend Health Test PASSED!\nStatus: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('=== BACKEND HEALTH TEST FAILED ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error:', error);

      let errorMsg = `❌ Backend Health Test FAILED!\n`;
      errorMsg += `Error: ${error.message}\n`;
      errorMsg += `Type: ${error.constructor.name}`;

      if (error.name === 'AbortError') {
        errorMsg += '\n⏰ Request timed out after 10 seconds';
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMsg += '\n🌐 Network connectivity issue';
      }

      alert(errorMsg);
    }
  };

  const testLogin = async () => {
    try {
      console.log('=== LOGIN API TEST START ===');
      const testData = { email: 'learner@gail.com', password: 'learner123' };
      console.log('Test data:', testData);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', [...response.headers.entries()]);

      const data = await response.json();
      console.log('Login response data:', data);
      console.log('=== LOGIN API TEST SUCCESS ===');

      alert(`✅ Login API Test PASSED!\nStatus: ${response.status}\nSuccess: ${data.success}`);
    } catch (error) {
      console.error('=== LOGIN API TEST FAILED ===');
      console.error('Full error:', error);
      alert(`❌ Login API Test FAILED!\nError: ${error.message}`);
    }
  };

  const testAlternativeUrls = async () => {
    const urls = [
      'http://localhost:9999/health',
      'http://127.0.0.1:9999/health',
      'http://0.0.0.0:9999/health'
    ];

    console.log('=== TESTING ALTERNATIVE URLS ===');

    for (const url of urls) {
      try {
        console.log(`Testing: ${url}`);
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
        });
        console.log(`✅ ${url} - Status: ${response.status}`);
        const data = await response.json();
        console.log(`✅ ${url} - Data:`, data);
        alert(`✅ SUCCESS with ${url}!`);
        return; // Stop on first success
      } catch (error) {
        console.log(`❌ ${url} - Error: ${error.message}`);
      }
    }

    alert('❌ All URL tests failed!');
  };

  const testWithXHR = async () => {
    return new Promise((resolve, reject) => {
      console.log('=== TESTING WITH XMLHttpRequest ===');

      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'http://127.0.0.1:9999/health', true);
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            console.log('✅ XHR Success!');
            console.log('Response:', xhr.responseText);
            alert(`✅ XHR Test PASSED!\nStatus: ${xhr.status}\nResponse: ${xhr.responseText}`);
            resolve(xhr.responseText);
          } else {
            console.log('❌ XHR Failed!');
            console.log('Status:', xhr.status);
            console.log('Response:', xhr.responseText);
            alert(`❌ XHR Test FAILED!\nStatus: ${xhr.status}\nResponse: ${xhr.responseText}`);
            reject(new Error(`XHR failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = function() {
        console.log('❌ XHR Error!');
        alert('❌ XHR Test FAILED!\nNetwork error occurred');
        reject(new Error('XHR network error'));
      };

      xhr.ontimeout = function() {
        console.log('❌ XHR Timeout!');
        alert('❌ XHR Test FAILED!\nRequest timed out');
        reject(new Error('XHR timeout'));
      };

      xhr.timeout = 10000; // 10 second timeout
      xhr.send();
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email, password });
      console.log('Fetching from:', 'http://localhost:9999/api/auth/login');

      const response = await fetch(`/api/auth/login`, {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 space-y-6">
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

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your GAIL email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
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

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
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
            <button
              onClick={testAlternativeUrls}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-purple-700 transition-colors"
            >
              Test Alternative URLs
            </button>
            <button
              onClick={testWithXHR}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-orange-700 transition-colors"
            >
              Test with XMLHttpRequest
            </button>
          </div>
        </div>

        {/* Additional Information */}
        <div className="text-center text-sm text-gray-600">
          <p>For GAIL employees only</p>
          <p className="mt-1">
            Need help? Contact IT Support at{' '}
            <a href="mailto:it-support@gail.com" className="text-blue-600 hover:underline">
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
      </div>
    </div>
  );
}
