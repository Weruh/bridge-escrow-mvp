import React from 'react';
import { TransactionStatus } from '../../types';

interface BadgeProps {
  status?: TransactionStatus | string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'lime';
  children?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, variant, children, size = 'md' }) => {
  let styleClasses = 'bg-gray-100 text-gray-700 border-gray-200';
  let label = children;

  if (status) {
    switch (status) {
      case 'draft':
        styleClasses = 'bg-slate-100 text-slate-700 border-slate-200';
        label = label || 'Draft';
        break;
      case 'pending_payment':
        styleClasses = 'bg-amber-50 text-amber-800 border-amber-200';
        label = label || 'Pending Payment';
        break;
      case 'payment_held':
        styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
        label = label || 'Escrow Secured';
        break;
      case 'order_prepared':
        styleClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        label = label || 'Ready for Pickup';
        break;
      case 'in_transit':
        styleClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        label = label || 'In Transit';
        break;
      case 'delivered':
        styleClasses = 'bg-teal-50 text-teal-800 border-teal-200';
        label = label || 'Delivered';
        break;
      case 'in_inspection':
        styleClasses = 'bg-purple-50 text-purple-800 border-purple-200 font-semibold animate-pulse';
        label = label || 'In Inspection';
        break;
      case 'completed':
        styleClasses = 'bg-[#EBFDD6] text-[#103D32] border-[#B7F36B] font-bold';
        label = label || 'Completed';
        break;
      case 'disputed':
        styleClasses = 'bg-red-50 text-red-700 border-red-200 font-bold';
        label = label || 'Disputed';
        break;
      case 'refunded':
        styleClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        label = label || 'Refunded';
        break;
      case 'cancelled':
        styleClasses = 'bg-gray-100 text-gray-600 border-gray-200';
        label = label || 'Cancelled';
        break;
      default:
        styleClasses = 'bg-gray-100 text-gray-700 border-gray-200';
        label = label || status;
    }
  } else if (variant) {
    switch (variant) {
      case 'success':
        styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        break;
      case 'warning':
        styleClasses = 'bg-amber-50 text-amber-800 border-amber-200';
        break;
      case 'error':
        styleClasses = 'bg-red-50 text-red-700 border-red-200';
        break;
      case 'info':
        styleClasses = 'bg-sky-50 text-sky-700 border-sky-200';
        break;
      case 'lime':
        styleClasses = 'bg-[#B7F36B] text-[#092B24] border-[#A5E853] font-bold';
        break;
      case 'neutral':
      default:
        styleClasses = 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${sizeClasses} font-medium ${styleClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {label}
    </span>
  );
};

export default Badge;
