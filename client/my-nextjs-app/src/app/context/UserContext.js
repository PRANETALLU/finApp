'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Create UserContext
const UserContext = createContext();

// Custom hook for consuming context
export const useUser = () => useContext(UserContext);

// UserProvider to wrap the app
export const UserProvider = ({ children }) => {
  // Initialize state from localStorage or set default values
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : { token: null, username: null, email: null };
    }
    return { token: null, username: null, email: null };
  });

  // Update localStorage whenever the user state changes
  useEffect(() => {
    if (user && user.token) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
