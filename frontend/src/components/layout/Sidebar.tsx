import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  CreditCard,
  Wallet,
  Truck,
  AlertCircle,
  Bell,
  Settings,
  ShieldAlert,
  LogOut,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserRole } from '../../types';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, activeRole, switchRole, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Create Deal', path: '/transactions/create', icon: PlusCircle },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Wallet & Ledger', path: '/wallet', icon: Wallet },
    { name: 'Delivery Tracking', path: '/delivery', icon: Truck },
    { name: 'Disputes', path: '/disputes', icon: AlertCircle },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Portal', path: '/admin', icon: ShieldAlert });
  }

  const roles: { id: UserRole; label: string }[] = [
    { id: 'buyer', label: 'Buyer' },
    { id: 'seller', label: 'Seller' },
    { id: 'courier', label: 'Courier' },
  ];
  if (user?.role === 'admin') {
    roles.push({ id: 'admin', label: 'Admin' });
  }

  return (
    <aside className="w-64 bg-[#103D32] text-white flex flex-col h-full border-r border-[#144C3F] select-none">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-[#144C3F] flex items-center justify-between">
        <NavLink to="/dashboard" onClick={handleNavClick} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#092B24] flex items-center justify-center text-[#B7F36B] shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
              Bridge<span className="text-[#B7F36B]">Escrow</span>
            </div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-300">
              Kenya Fintech
            </span>
          </div>
        </NavLink>
      </div>

      {/* Role View Switcher */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-[#092B24] p-1 rounded-xl flex items-center border border-[#144C3F]">
          {roles.map(r => (
            <button
              key={r.id}
              onClick={() => switchRole(r.id)}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all text-center ${
                activeRole === r.id
                  ? 'bg-[#B7F36B] text-[#092B24] shadow-sm'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-emerald-400/80 mt-1.5 px-1 flex items-center justify-between">
          <span>Active Workspace:</span>
          <span className="capitalize font-semibold text-[#B7F36B]">{activeRole} Mode</span>
        </p>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#B7F36B] text-[#092B24] shadow-sm'
                    : 'text-gray-200 hover:bg-[#144C3F] hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.path === window.location.pathname
                      ? 'bg-[#092B24] text-[#B7F36B]'
                      : 'bg-[#B7F36B] text-[#092B24]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User Profile card & Logout */}
      <div className="p-4 border-t border-[#144C3F] bg-[#092B24]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#103D32] border border-[#B7F36B]/40 flex items-center justify-center text-[#B7F36B] font-bold text-xs shrink-0">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Fintech User'}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email || 'user@kenya.co.ke'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Log out"
            className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-[#103D32] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
