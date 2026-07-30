import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// This wraps the entire app and provides auth state to all components
export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if user is already logged in
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Save login data to state and localStorage
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Clear everything on logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  // Check if user is admin
  const isAdmin = () => user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, logout, isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth anywhere in the app
export const useAuth = () => useContext(AuthContext);