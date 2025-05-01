'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '../../components/Breadcrumb';
import { useUser } from '@/app/context/UserContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();

  const handleLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    if (!username || !password) {
      setErrorMessage('Username and Password are required.');
      setIsSubmitting(false);
      return;
    }

    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      setUser({
        token: data.token,
        id: data.id,
        username: data.username,
        email: data.email,
      });
      router.push('/pages/dashboard');
    } else {
      const errorData = await response.json();
      setErrorMessage(errorData.message || 'Login failed. Please try again.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-500 flex flex-col justify-center items-center text-white">
      <div className="bg-white p-8 rounded-md shadow-md w-96">
        <Breadcrumb
          links={[
            { href: '/', label: 'Home' },
            { label: 'Login' },
          ]}
        />
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Login</h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          />
        </div>
        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
        <button
          onClick={handleLogin}
          disabled={isSubmitting}
          className={`w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 focus:outline-none ${isSubmitting ? 'opacity-50' : ''}`}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-700">
            Don't have an account?{' '}
            <Link href="/pages/signup" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
