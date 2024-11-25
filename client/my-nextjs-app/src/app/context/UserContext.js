'use client';

import { createContext, useContext, useState } from 'react';

// Create UserContext
const UserContext = createContext();

// Custom hook for consuming context
export const useUser = () => useContext(UserContext);

// UserProvider to wrap the app
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State to store user info

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
