import React, { useState } from 'react';
import { User, Phone, Mail, Lock, ShieldCheck, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { UserRole } from '../types';

export const ProfileSettingsPage: React.FC = () => {
  const { user, updateProfile, activeRole, switchRole } = useAuth();
  const { showToast } = useNotifications();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data: any = {
        full_name: fullName,
        phone_number: phoneNumber,
      };
      if (password.trim()) {
        if (password.length < 6) {
          setError('New password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        data.password = password;
      }

      await updateProfile(data);
      showToast('Profile and settings updated successfully!', 'success');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#17231F]">Profile & Security Settings</h1>
        <p className="text-xs text-[#75817A] mt-1">
          Manage your verified contact details, M-Pesa integration phone, and account security.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KYC & Identity Status Card */}
      <div className="bg-[#103D32] text-white p-6 rounded-2xl border border-[#144C3F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#092B24] text-[#B7F36B] flex items-center justify-center font-bold text-lg">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{user?.full_name}</h3>
            <p className="text-xs text-gray-300 font-mono">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBFDD6] text-[#092B24] border border-[#B7F36B] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#218653]" />
            KYC Verified Trader
          </span>
        </div>
      </div>

      {/* Form Settings */}
      <Card title="Personal & Contact Information">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#17231F] mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4EAE5] text-xs focus:ring-2 focus:ring-[#B7F36B] focus:outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231F] mb-1">
                Safaricom M-Pesa Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="+2547XXXXXXXX"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4EAE5] text-xs focus:ring-2 focus:ring-[#B7F36B] focus:outline-none font-medium"
                />
              </div>
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Used for automated M-Pesa STK Push deposits and ledger disbursements.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17231F] mb-1">Registered Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4EAE5] text-xs bg-gray-50 text-gray-500 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#75817A] mb-3">
              Change Security Password
            </h4>
            <div>
              <label className="block text-xs font-bold text-[#17231F] mb-1">
                New Password (Leave blank to keep current)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E4EAE5] text-xs focus:ring-2 focus:ring-[#B7F36B] focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

    </div>
  );
};

export default ProfileSettingsPage;
