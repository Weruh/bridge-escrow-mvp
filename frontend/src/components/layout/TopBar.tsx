import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Bell, Plus, Shield, CheckCircle2, ChevronDown, Check } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserRole } from '../../types';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const { user, activeRole, switchRole } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const roles: { id: UserRole; label: string; desc: string }[] = [
    { id: 'buyer', label: 'Buyer', desc: 'Protected purchases, inspect & release' },
    { id: 'seller', label: 'Seller', desc: 'Secure sales, prepare order & pickup' },
    { id: 'courier', label: 'Courier', desc: 'Deliveries, pickup & handover codes' },
  ];
  if (user?.role === 'admin') {
    roles.push({ id: 'admin', label: 'Admin', desc: 'Full dispute ruling & platform oversight' });
  }

  return (
    <header className="h-16 bg-white border-b border-[#E4EAE5] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      
      {/* Left: Mobile hamburger & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="font-semibold text-[#17231F]">BridgeEscrow</span>
          <span className="text-gray-300">/</span>
          <span className="capitalize font-bold text-[#103D32] bg-[#EBFDD6] px-2.5 py-0.5 rounded-full border border-[#B7F36B]/60">
            {activeRole} Workspace
          </span>
        </div>
      </div>

      {/* Right: Environment badge, Notifications, Role Switcher, Quick Action */}
      <div className="flex items-center gap-3">
        
        {/* Environment Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Daraja M-Pesa Ready</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="p-2 rounded-xl text-gray-500 hover:text-[#103D32] hover:bg-gray-100 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#D94B4B] text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-dropdown border border-[#E4EAE5] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-[#E4EAE5] flex items-center justify-between">
                <span className="font-bold text-xs text-[#17231F]">Notifications ({unreadCount} new)</span>
                <Link
                  to="/notifications"
                  onClick={() => setNotifDropdownOpen(false)}
                  className="text-[11px] text-[#218653] font-semibold hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#75817A]">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.link) {
                          setNotifDropdownOpen(false);
                          navigate(n.link);
                        }
                      }}
                      className={`p-3.5 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !n.is_read ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-[#17231F]">{n.title}</p>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-[#218653] shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className="text-xs text-[#75817A] mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4EAE5] bg-gray-50 hover:bg-gray-100 text-xs font-bold text-[#17231F] transition-colors"
          >
            <span className="capitalize">{activeRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-dropdown border border-[#E4EAE5] py-2 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-400">
                Switch Perspective
              </div>
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    switchRole(r.id);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    activeRole === r.id ? 'bg-emerald-50/60 font-bold text-[#103D32]' : 'text-gray-700'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{r.label}</p>
                    <p className="text-[10px] text-gray-400">{r.desc}</p>
                  </div>
                  {activeRole === r.id && <Check className="w-4 h-4 text-[#218653]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Create Deal Action */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/transactions/create')}
          icon={<Plus className="w-4 h-4" />}
        >
          <span className="hidden sm:inline">New Deal</span>
        </Button>
      </div>
    </header>
  );
};

export default TopBar;
