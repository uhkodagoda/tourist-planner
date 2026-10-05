import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(() => localStorage.getItem('admin_username'));

  function login(token, uname) {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_username', uname);
    setUsername(uname);
  }

  function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    setUsername(null);
  }

  const isAuthenticated = Boolean(localStorage.getItem('admin_token'));

  return (
    <AuthContext.Provider value={{ username, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
