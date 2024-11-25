// src/app/api/auth/login/route.js
import axios from 'axios';

export async function POST(req) {
  const { username, email, password } = await req.json();

  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, { username, email, password });
    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Login failed' }), { status: 401 });
  }
}
