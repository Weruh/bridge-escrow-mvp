import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User as UserIcon, Phone, AlertCircle, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { UserRole } from '../types';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('You must accept the Escrow Terms and Custody Agreement.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register({
        full_name: fullName,
        email,
        phone_number: phone,
        password,
        role,
      });
      showToast('Account registered successfully! Welcome to BridgeEscrow.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
          Create a protected account
        </h2>
        <p className="mt-1 text-xs text-[#75817A]">
          Join Kenya's secure peer-to-peer escrow marketplace
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

          {/* Role selector tabs */}
          <div>
            <label className="block text-xs font-bold text-[#17231F] mb-1.5">
              Primary Account Type
            </label>
            <div className="grid grid-cols-3 gap-2 bg-[#F5F7F4] p-1 rounded-xl border border-[#E4EAE5]">
              {(['buyer', 'seller', 'courier'] as UserRole[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 text-xs font-bold rounded-lg capitalize transition-all ${
                    role === r
                      ? 'bg-[#103D32] text-[#B7F36B] shadow-sm'
                      : 'text-[#75817A] hover:text-[#17231F]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-[#17231F] mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Wanjiku Kamau"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4EAE5] text-xs focus:outline-none focus:ring-2 focus:ring-[#B7F36B] focus:border-transparent font-medium"
                />
              </div>
            </div>

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
                  placeholder="wanjiku@domain.co.ke"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4EAE5] text-xs focus:outline-none focus:ring-2 focus:ring-[#B7F36B] focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231F] mb-1">
                M-Pesa Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX or +2547XXXXXXXX"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4EAE5] text-xs focus:outline-none focus:ring-2 focus:ring-[#B7F36B] focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231F] mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4EAE5] text-xs focus:outline-none focus:ring-2 focus:ring-[#B7F36B] focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#103D32] focus:ring-[#B7F36B]"
              />
              <label htmlFor="terms" className="text-[11px] text-[#75817A] leading-tight">
                I agree to the BridgeEscrow Terms of Service, 3-Day Inspection Standard, and Custody Holding Agreement.
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          <div className="text-center text-xs text-[#75817A] pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#218653] hover:underline">
              Log in
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
