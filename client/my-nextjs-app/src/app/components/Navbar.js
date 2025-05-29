'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';

export default function Navbar() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/pages/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/pages/dashboard' },
    { name: 'Transactions', path: '/pages/transactions' },
    { name: 'Budget', path: '/pages/budget' },
    { name: 'Savings Goals', path: '/pages/savingsGoal' },
  ];

  return (
    <nav className="fixed top-0 w-full bg-indigo-600 text-white shadow-md py-3 px-6 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-white">FinApp</h1>

        {/* Hamburger Icon */}
        <button
          className="lg:hidden text-white focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Navigation Links (Desktop) */}
        <ul className="hidden lg:flex space-x-6 text-base font-medium bg-transparent text-gray-500">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link href={link.path} className="hover:text-blue-300">
                {link.name}
              </Link>
            </li>
          ))}

          {/* Avatar with Dropdown */}
          {user && (
            <li className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2"
              >
                <img
                  src="/path/to/avatar.jpg" // Replace with actual avatar URL or default
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <span className="hidden lg:block">{user.name}</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left hover:bg-indigo-600 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
