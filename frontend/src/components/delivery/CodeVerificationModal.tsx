import React, { useState, useRef } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

interface CodeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionRef: string;
  codeType: 'pickup' | 'handover';
  onSuccess: () => void;
}

export const CodeVerificationModal: React.FC<CodeVerificationModalProps> = ({
  isOpen,
  onClose,
  transactionRef,
  codeType,
  onSuccess,
}) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { showToast } = useNotifications();

  const isPickup = codeType === 'pickup';
  const title = isPickup ? 'Verify Courier Pickup PIN' : 'Verify Handover Delivery PIN';
  const subtitle = isPickup
    ? `Obtain the 6-digit PIN from the seller at dispatch (${transactionRef})`
    : `Obtain the 6-digit PIN from the buyer at doorstep delivery (${transactionRef})`;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError(null);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);
    if (pasted.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the verification PIN.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = isPickup ? '/delivery/verify-pickup' : '/delivery/verify-handover';
      const res = await api.post<{ message: string; transaction_status: string }>(endpoint, {
        transaction_ref: transactionRef,
        code,
      });

      setSuccessMsg(res.message);
      showToast(res.message, 'success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle} maxWidth="md">
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-[#17231F]">{successMsg}</p>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="bg-[#F5F7F4] p-3.5 rounded-xl border border-[#E4EAE5] text-xs text-[#75817A] flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#103D32] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#17231F]">
                {isPickup ? 'Seller Pickup Authorization' : 'Buyer Handover Protection'}
              </p>
              <p className="text-[11px] mt-0.5">
                {isPickup
                  ? 'The seller must provide this unique single-use code to authorize package collection.'
                  : 'The buyer must provide this code at physical delivery. Handover initiates the buyer inspection countdown; funds remain secured in escrow.'}
              </p>
            </div>
          </div>

          {/* 6 Digit Input Boxes */}
          <div className="flex justify-center gap-2 sm:gap-3 py-2">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={el => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-mono font-bold rounded-xl border-2 border-[#E4EAE5] focus:border-[#103D32] focus:bg-[#EBFDD6]/20 focus:outline-none transition-all text-[#103D32]"
              />
            ))}
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
              Verify & Confirm
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default CodeVerificationModal;
