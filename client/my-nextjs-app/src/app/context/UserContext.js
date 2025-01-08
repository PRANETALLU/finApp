'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Create UserContext
const UserContext = createContext(null);

// Custom hook for consuming the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Default user structure
const defaultUser = {
  token: null,
  id: null,
  username: null,
  email: null,
};

// UserProvider component to wrap the app
export const UserProvider = ({ children }) => {
  // Initialize user state from localStorage or default values
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : defaultUser;
    }
    return defaultUser;
  });

  // Sync user state to localStorage whenever it changes
  useEffect(() => {
    if (user?.token) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Clear user state (logout function)
  const clearUser = () => setUser(defaultUser);

  return (
    <UserContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};
