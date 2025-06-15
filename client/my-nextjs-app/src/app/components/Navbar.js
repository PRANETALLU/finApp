'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';

export default function Navbar() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <nav className="fixed top-0 w-full bg-indigo-600 text-white shadow-md z-50">
      <div className="w-full max-w-screen-xl mx-auto flex justify-between items-center px-6 py-4">

        {/* Logo */}
        <h1 className="text-2xl font-bold">FinApp</h1>

        {/* Hamburger */}
        <button
          className="lg:hidden focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Navigation Links (Desktop) */}
        <ul className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link href={link.path}>
                <span className="cursor-pointer px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition">
                  {link.name}
                </span>
              </Link>
            </li>
          ))}

          {user && (
            <li className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition focus:outline-none"
              >
                <span className="hidden lg:block">{user.name}</span>
              </button>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded-lg shadow-md z-50">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-indigo-600 hover:text-white rounded-b-md transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-indigo-600 px-6 pb-4">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.path}>
                  <span className="block px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition">
                    {link.name}
                  </span>
                </Link>
              </li>
            ))}

            {user && (
              <li>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm rounded-md hover:bg-indigo-700 transition"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>

  );
}
