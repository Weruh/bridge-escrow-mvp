import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  activeRole: UserRole;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (data: any) => Promise<void>;
  refreshUser: () => Promise<void>;
  quickLoginDemo: (role: 'buyer' | 'seller' | 'courier' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('buyer');
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('bridge_escrow_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.get<{ user: User }>('/auth/me');
      setUser(res.user);
      // If activeRole hasn't been set by user, set to user's assigned role
      const savedRole = localStorage.getItem('bridge_escrow_active_role') as UserRole;
      if (savedRole) {
        setActiveRole(savedRole);
      } else {
        setActiveRole(res.user.role);
      }
    } catch (err) {
      localStorage.removeItem('bridge_escrow_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    localStorage.setItem('bridge_escrow_token', res.token);
    setUser(res.user);
    setActiveRole(res.user.role);
    localStorage.setItem('bridge_escrow_active_role', res.user.role);
  };

  const register = async (data: any) => {
    const res = await api.post<{ token: string; user: User }>('/auth/register', data);
    localStorage.setItem('bridge_escrow_token', res.token);
    setUser(res.user);
    setActiveRole(res.user.role);
    localStorage.setItem('bridge_escrow_active_role', res.user.role);
  };

  const logout = () => {
    localStorage.removeItem('bridge_escrow_token');
    localStorage.removeItem('bridge_escrow_active_role');
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    localStorage.setItem('bridge_escrow_active_role', role);
  };

  const updateProfile = async (data: any) => {
    const res = await api.put<{ user: User }>('/auth/profile', data);
    setUser(res.user);
  };

  const quickLoginDemo = async (role: 'buyer' | 'seller' | 'courier' | 'admin') => {
    const accounts = {
      buyer: { email: 'buyer@bridgeescrow.co.ke', password: 'Password123!' },
      seller: { email: 'seller@bridgeescrow.co.ke', password: 'Password123!' },
      courier: { email: 'courier@bridgeescrow.co.ke', password: 'Password123!' },
      admin: { email: 'admin@bridgeescrow.co.ke', password: 'AdminSecret123!' },
    };
    const creds = accounts[role];
    await login(creds.email, creds.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        loading,
        login,
        register,
        logout,
        switchRole,
        updateProfile,
        refreshUser,
        quickLoginDemo,
      }}
    >
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
