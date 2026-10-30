import React from 'react';
import { Check, Clock, AlertTriangle, ShieldCheck, Package, Truck, UserCheck, Eye } from 'lucide-react';
import { Transaction, TransactionStatus } from '../../types';

interface TimelineProps {
  transaction: Transaction;
}

interface Step {
  id: string;
  label: string;
  desc: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isDisputed?: boolean;
}

export const TransactionTimeline: React.FC<TimelineProps> = ({ transaction }) => {
  const isPhysical = transaction.delivery_type !== 'digital_service';
  const status = transaction.status;

  // Compute completed status index
  const physicalOrder: TransactionStatus[] = [
    'draft',
    'pending_payment',
    'payment_held',
    'order_prepared',
    'in_transit',
    'in_inspection',
    'completed',
  ];

  const digitalOrder: TransactionStatus[] = [
    'draft',
    'pending_payment',
    'payment_held',
    'in_inspection',
    'completed',
  ];

  const order = isPhysical ? physicalOrder : digitalOrder;
  const isDisputed = status === 'disputed';
  const isRefunded = status === 'refunded';

  // Map steps
  const steps: Step[] = isPhysical
    ? [
        {
          id: 'draft',
          label: 'Deal Created',
          desc: 'Agreed terms initiated',
          isCompleted: status !== 'draft',
          isCurrent: status === 'draft',
        },
        {
          id: 'pending_payment',
          label: 'Terms Signed',
          desc: 'Both parties confirmed',
          isCompleted: !['draft', 'pending_payment'].includes(status),
          isCurrent: status === 'pending_payment',
        },
        {
          id: 'payment_held',
          label: 'Escrow Secured',
          desc: 'M-Pesa payment held in vault',
          isCompleted: !['draft', 'pending_payment', 'payment_held'].includes(status),
          isCurrent: status === 'payment_held',
        },
        {
          id: 'order_prepared',
          label: 'Order Prepared',
          desc: 'Seller ready for dispatch',
          isCompleted: !['draft', 'pending_payment', 'payment_held', 'order_prepared'].includes(status),
          isCurrent: status === 'order_prepared',
        },
        {
          id: 'in_transit',
          label: 'Pickup Verified',
          desc: 'Courier scanned seller PIN',
          isCompleted: ['delivered', 'in_inspection', 'completed'].includes(status),
          isCurrent: status === 'in_transit',
        },
        {
          id: 'in_inspection',
          label: 'Handover & Inspect',
          desc: `${transaction.inspection_period_days || 3}-day inspection window`,
          isCompleted: status === 'completed',
          isCurrent: status === 'in_inspection' || status === 'delivered',
        },
        {
          id: 'completed',
          label: 'Deal Completed',
          desc: 'Funds settled to seller',
          isCompleted: status === 'completed',
          isCurrent: status === 'completed',
        },
      ]
    : [
        {
          id: 'draft',
          label: 'Deal Created',
          desc: 'Contract terms established',
          isCompleted: status !== 'draft',
          isCurrent: status === 'draft',
        },
        {
          id: 'pending_payment',
          label: 'Terms Signed',
          desc: 'Conditions accepted',
          isCompleted: !['draft', 'pending_payment'].includes(status),
          isCurrent: status === 'pending_payment',
        },
        {
          id: 'payment_held',
          label: 'Escrow Secured',
          desc: 'Payment locked in vault',
          isCompleted: !['draft', 'pending_payment', 'payment_held'].includes(status),
          isCurrent: status === 'payment_held',
        },
        {
          id: 'in_inspection',
          label: 'Inspection Window',
          desc: 'Deliverable review active',
          isCompleted: status === 'completed',
          isCurrent: status === 'in_inspection',
        },
        {
          id: 'completed',
          label: 'Funds Released',
          desc: 'Settled to provider ledger',
          isCompleted: status === 'completed',
          isCurrent: status === 'completed',
        },
      ];

  return (
    <div className="w-full py-4">
      {/* Alert banner if disputed */}
      {isDisputed && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800 text-xs font-medium">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <span className="font-bold">Transaction Paused in Dispute:</span> Escrow funds are strictly frozen in the custody vault. An authorized administrator is reviewing evidence from both parties.
          </div>
        </div>
      )}

      {isRefunded && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs font-medium">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <span className="font-bold">Transaction Refunded:</span> Dispute ruling or mutual agreement concluded with full refund back to the buyer ledger.
          </div>
        </div>
      )}

      {/* Progress Timeline Bar */}
      <div className="relative">
        {/* Mobile vertical, Desktop horizontal */}
        <div className="hidden md:grid md:grid-cols-7 gap-2 relative">
          
          {/* Connector Line behind steps */}
          <div className="absolute top-5 left-4 right-4 h-1 bg-[#E4EAE5] -z-0" />

          {steps.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center text-center relative z-10">
              {/* Circle Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step.isCompleted
                    ? 'bg-[#103D32] text-[#B7F36B] shadow-sm'
                    : step.isCurrent
                    ? 'bg-[#B7F36B] text-[#092B24] ring-4 ring-[#EBFDD6] shadow animate-pulse'
                    : 'bg-white text-gray-400 border-2 border-[#E4EAE5]'
                }`}
              >
                {step.isCompleted ? (
                  <Check className="w-5 h-5 stroke-[3]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Label */}
              <p
                className={`text-xs mt-3 font-bold leading-tight ${
                  step.isCurrent
                    ? 'text-[#103D32]'
                    : step.isCompleted
                    ? 'text-[#17231F]'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </p>
              <p className="text-[10px] text-[#75817A] mt-0.5 max-w-[110px] leading-tight">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile Vertical View */}
        <div className="md:hidden space-y-4 relative border-l-2 border-[#E4EAE5] ml-4 pl-6">
          {steps.map((step, idx) => (
            <div key={step.id} className="relative">
              <div
                className={`absolute -left-[33px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step.isCompleted
                    ? 'bg-[#103D32] text-[#B7F36B]'
                    : step.isCurrent
                    ? 'bg-[#B7F36B] text-[#092B24] ring-2 ring-[#EBFDD6]'
                    : 'bg-white text-gray-400 border-2 border-[#E4EAE5]'
                }`}
              >
                {step.isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
              </div>
              <p
                className={`text-xs font-bold ${
                  step.isCurrent ? 'text-[#103D32]' : step.isCompleted ? 'text-[#17231F]' : 'text-gray-400'
                }`}
              >
                {step.label}
              </p>
              <p className="text-[11px] text-[#75817A]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionTimeline;
