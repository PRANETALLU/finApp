// src/app/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../context/UserContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { setUser } = useUser();

  const handleLogin = async () => {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',  // Add this header
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Login successful');
      setUser({
        token: data.token, 
        id: data.id, 
        username: data.username, 
        email: data.email
      }); 
      router.push('/pages/dashboard');
    } else {
      alert('Login failed');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
