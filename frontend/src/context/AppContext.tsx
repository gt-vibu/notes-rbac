import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  user: User | null;
  isLoading: boolean;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const checkAuth = async () => {
    try {
      const res = await client.get('/auth/me');
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await client.post('/auth/login', { email, password });
      setUser(res.data.user);
      addToast(`Welcome back, ${res.data.user.name}!`, 'success');
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to login';
      addToast(errMsg, 'error');
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await client.post('/auth/register', { name, email, password });
      setUser(res.data.user);
      addToast(`Account created! Welcome, ${res.data.user.name}!`, 'success');
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to register';
      addToast(errMsg, 'error');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout');
      setUser(null);
      addToast('Logged out successfully', 'info');
    } catch (err) {
      addToast('Failed to logout', 'error');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        toasts,
        addToast,
        removeToast,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
