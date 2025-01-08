'use client';

import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-green-500 flex flex-col justify-center items-center text-white">
      <h1 className="text-5xl font-bold mb-6">Welcome to FinApp</h1>
      <p className="text-lg mb-8 text-center px-6">
        Take control of your financial journey with ease. Track income, manage expenses, and grow your savings.
      </p>
      <div className="flex space-x-4">
        <Link href="/pages/login" className="bg-white text-blue-500 px-6 py-3 rounded-full shadow-md hover:bg-blue-100 transition">
          Login
        </Link>
        <Link href="/pages/signup" className="bg-white text-green-500 px-6 py-3 rounded-full shadow-md hover:bg-green-100 transition">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
