import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, quickLoginDemo } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      showToast('Welcome back to BridgeEscrow!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'buyer' | 'seller' | 'courier' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      await quickLoginDemo(role);
      showToast(`Logged in successfully as demo ${role}.`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F4] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#103D32] flex items-center justify-center text-[#B7F36B] shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#103D32]">
            Bridge<span className="text-[#218653]">Escrow</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-[#17231F]">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-[#75817A]">
          Manage your protected transactions and escrow settlements
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-card rounded-3xl border border-[#E4EAE5] sm:px-10 space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[#17231F] mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@bridgeescrow.co.ke"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4EAE5] text-xs focus:outline-none focus:ring-2 focus:ring-[#B7F36B] focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#17231F]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-[#218653] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4EAE5] text-xs focus:outline-none focus:ring-2 focus:ring-[#B7F36B] focus:border-transparent font-medium"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Login Pill Section */}
          <div className="pt-4 border-t border-[#F0F4F1] space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-center text-gray-400">
              One-Click Demo Accounts (Instant Testing)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('buyer')}
                disabled={loading}
                className="py-2 px-2.5 rounded-xl bg-gray-50 hover:bg-[#EBFDD6] border border-[#E4EAE5] text-[11px] font-semibold text-[#17231F] text-left transition-colors flex items-center justify-between"
              >
                <span>🛒 Buyer (Wanjiku)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('seller')}
                disabled={loading}
                className="py-2 px-2.5 rounded-xl bg-gray-50 hover:bg-[#EBFDD6] border border-[#E4EAE5] text-[11px] font-semibold text-[#17231F] text-left transition-colors flex items-center justify-between"
              >
                <span>💼 Seller (Juma)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('courier')}
                disabled={loading}
                className="py-2 px-2.5 rounded-xl bg-gray-50 hover:bg-[#EBFDD6] border border-[#E4EAE5] text-[11px] font-semibold text-[#17231F] text-left transition-colors flex items-center justify-between"
              >
                <span>🚚 Courier (Boda)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="py-2 px-2.5 rounded-xl bg-gray-50 hover:bg-red-50 border border-[#E4EAE5] text-[11px] font-semibold text-red-900 text-left transition-colors flex items-center justify-between"
              >
                <span>🛡️ Admin Portal</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-[#75817A] pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#218653] hover:underline">
              Create an account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
