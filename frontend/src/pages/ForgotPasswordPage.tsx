import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('884219');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post<{ message: string; simulation_notice: string }>('/auth/forgot-password', { email });
      setInfoMsg(`${res.message} ${res.simulation_notice}`);
      setStep('reset');
      showToast('Reset instructions dispatched.', 'info');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/reset-password', {
        email,
        code,
        password: newPassword,
      });
      showToast('Password reset successfully! Please log in.', 'success');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
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
          Recover your account
        </h2>
        <p className="mt-1 text-xs text-[#75817A]">
          Follow the secure recovery steps to reset your credentials
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

          {infoMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {step === 'request' ? (
            <form className="space-y-4" onSubmit={handleRequest}>
              <div>
                <label className="block text-xs font-bold text-[#17231F] mb-1">
                  Registered Email Address
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

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="w-full mt-2"
              >
                Send Reset Code
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleReset}>
              <div>
                <label className="block text-xs font-bold text-[#17231F] mb-1">
                  6-Digit Reset Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="e.g. 884219"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4EAE5] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#B7F36B] focus:border-transparent"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Demo recovery code provided in sandbox banner.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231F] mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
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
              >
                Update Password
              </Button>
            </form>
          )}

          <div className="text-center text-xs text-[#75817A] pt-2">
            Remember your credentials?{' '}
            <Link to="/login" className="font-bold text-[#218653] hover:underline">
              Return to log in
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
