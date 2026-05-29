import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ic_user')); } catch { return null; }
  });

  const login = (token, userData) => {
    localStorage.setItem('ic_token', token);
    localStorage.setItem('ic_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('ic_token');
    localStorage.removeItem('ic_user');
    setUser(null);
  };

  // Decode basic info from JWT
  const decodeUser = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload.sub, name: payload.name, phone: payload.phone, role: payload.role };
    } catch { return null; }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, decodeUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
