import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (id: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  adminId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fitflow_auth') === 'true';
  });

  const [adminId, setAdminId] = useState<string>('admin123');

  useEffect(() => {
    localStorage.setItem('fitflow_auth', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  const login = (id: string, pass: string) => {
    if (id.trim() === 'admin123' && pass === '123') {
      setIsAuthenticated(true);
      setAdminId('admin123');
      return { success: true };
    }
    return { success: false, error: 'Invalid ID or password' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('fitflow_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, adminId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
