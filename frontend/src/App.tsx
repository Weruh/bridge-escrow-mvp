import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AppLayout from './components/layout/AppLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Authenticated Pages
import DashboardPage from './pages/DashboardPage';
import TransactionsListPage from './pages/TransactionsListPage';
import CreateTransactionPage from './pages/CreateTransactionPage';
import TransactionDetailPage from './pages/TransactionDetailPage';
import PaymentsPage from './pages/PaymentsPage';
import WalletPage from './pages/WalletPage';
import DeliveryTrackingPage from './pages/DeliveryTrackingPage';
import DisputesPage from './pages/DisputesPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import AdminPage from './pages/AdminPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Authenticated Dashboard Routes */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/transactions" element={<TransactionsListPage />} />
              <Route path="/transactions/create" element={<CreateTransactionPage />} />
              <Route path="/transactions/:reference" element={<TransactionDetailPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/delivery" element={<DeliveryTrackingPage />} />
              <Route path="/disputes" element={<DisputesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<ProfileSettingsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
