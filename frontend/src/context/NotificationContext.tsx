import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  toasts: Toast[];
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get<{ notifications: Notification[]; unread_count: number }>('/notifications');
      setNotifications(res.notifications);
      setUnreadCount(res.unread_count);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // 15s poll
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        showToast,
        removeToast,
      }}
    >
      {children}
      {/* Toast Render */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border text-sm font-medium transition-all transform duration-300 flex items-center justify-between ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : toast.type === 'error'
                ? 'bg-red-50 text-red-900 border-red-200'
                : toast.type === 'warning'
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-white text-[#17231F] border-[#E4EAE5]'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-xs opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
