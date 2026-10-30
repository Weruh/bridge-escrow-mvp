import React, { useState } from 'react';
import { Smartphone, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, KeyRound } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

interface MpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionRef: string;
  amount: number;
  onPaymentSuccess: () => void;
}

export const MpesaModal: React.FC<MpesaModalProps> = ({
  isOpen,
  onClose,
  transactionRef,
  amount,
  onPaymentSuccess,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('0712345678');
  const [step, setStep] = useState<'input' | 'prompt_sent' | 'success'>('input');
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [pin, setPin] = useState('••••');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useNotifications();

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post<{ payment: any; message: string }>('/payments/initiate', {
        transaction_ref: transactionRef,
        phone_number: phoneNumber,
      });

      setCheckoutId(res.payment.checkout_request_id);
      setStep('prompt_sent');
      showToast('STK Push dispatched to phone. Enter M-Pesa PIN.', 'info');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch M-Pesa prompt.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePinConfirm = async () => {
    if (!checkoutId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.post<{ transaction_status: string; payment: any }>('/payments/simulate-confirm', {
        checkout_request_id: checkoutId,
      });

      setStep('success');
      showToast('Payment verified! Funds secured in Escrow Vault.', 'success');
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Payment confirmation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setCheckoutId(null);
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Safaricom Daraja M-Pesa Escrow Deposit"
      subtitle={`Secure escrow payment for ${transactionRef}`}
      maxWidth="md"
    >
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === 'input' && (
        <form onSubmit={handleInitiate} className="space-y-4">
          <div className="bg-[#F5F7F4] p-4 rounded-xl border border-[#E4EAE5]">
            <div className="flex items-center justify-between text-xs text-[#75817A] mb-1">
              <span>Total Payable to Escrow:</span>
              <span className="font-bold text-[#103D32] text-sm">KES {amount.toLocaleString()}</span>
            </div>
            <p className="text-[11px] text-[#75817A] leading-relaxed">
              Your money will be held safely in the <strong className="text-[#103D32]">BridgeEscrow Vault</strong>. Funds are NOT released to the seller until you receive and inspect your items.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17231F] mb-1.5">
              M-Pesa Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="07XXXXXXXX or +2547XXXXXXXX"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4EAE5] text-sm focus:outline-none focus:ring-2 focus:ring-[#B7F36B] focus:border-transparent font-medium"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Kenyan Safaricom mobile phone registered for Lipa na M-Pesa.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={<ShieldCheck className="w-4 h-4" />}
            >
              Send M-Pesa STK Push
            </Button>
          </div>
        </form>
      )}

      {step === 'prompt_sent' && (
        <div className="space-y-5 text-center">
          {/* Simulated phone screen popup */}
          <div className="max-w-xs mx-auto bg-gray-900 rounded-3xl p-5 text-left text-white shadow-xl border-4 border-gray-800">
            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-3 border-b border-gray-800 pb-2">
              <span className="font-bold text-emerald-400">SIM TOOLKIT</span>
              <span>M-PESA ONLINE</span>
            </div>
            
            <p className="text-xs text-gray-200 leading-snug mb-3">
              Do you want to pay <strong className="text-emerald-400">KES {amount.toLocaleString()}</strong> to <strong>BridgeEscrow Kenya</strong> for Account <strong>{transactionRef}</strong>?
            </p>

            <div className="bg-gray-800 rounded-xl p-3 mb-4 flex items-center justify-between border border-gray-700">
              <span className="text-[11px] text-gray-400">Enter M-Pesa PIN:</span>
              <span className="text-sm tracking-widest font-mono text-emerald-400 font-bold">••••</span>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={loading}
              onClick={handleSimulatePinConfirm}
              className="w-full text-xs font-bold"
              icon={<KeyRound className="w-3.5 h-3.5" />}
            >
              Confirm PIN & Pay KES {amount.toLocaleString()}
            </Button>
          </div>

          <div className="text-xs text-[#75817A] max-w-sm mx-auto">
            <p>Awaiting customer PIN confirmation via Safaricom Daraja gateway...</p>
            <p className="text-[10px] text-gray-400 mt-1">
              Sandbox simulated adapter: Click the button above to simulate entering your M-Pesa PIN and verify instantly.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
              Re-enter Phone
            </Button>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="py-6 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-[#17231F]">Payment Confirmed & Secured!</h4>
          <p className="text-xs text-[#75817A] max-w-xs mx-auto">
            KES {amount.toLocaleString()} has been safely locked in the BridgeEscrow Vault. The seller has been notified to prepare your order.
          </p>
        </div>
      )}
    </Modal>
  );
};

export default MpesaModal;
