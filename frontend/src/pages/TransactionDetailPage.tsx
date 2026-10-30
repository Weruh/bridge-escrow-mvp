import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  KeyRound,
  ArrowLeft,
  FileText,
  User,
  Share2,
  Check,
  Lock,
  MessageSquare,
  Send,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import TransactionTimeline from '../components/transactions/TransactionTimeline';
import MpesaModal from '../components/payments/MpesaModal';
import CodeVerificationModal from '../components/delivery/CodeVerificationModal';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Transaction } from '../types';
import api from '../services/api';

export const TransactionDetailPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showPayModal, setShowPayModal] = useState(false);
  const [codeModalType, setCodeModalType] = useState<'pickup' | 'handover' | null>(null);
  const [viewCodeData, setViewCodeData] = useState<{ title: string; code: string; type: string } | null>(null);
  
  // Dispute modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('damaged_goods');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [messageBody, setMessageBody] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const fetchDetail = async () => {
    if (!reference) return;
    try {
      setLoading(true);
      const res = await api.get<{ transaction: Transaction }>(`/transactions/${reference}`);
      setTransaction(res.transaction);
    } catch (err: any) {
      showToast(err.message || 'Failed to load transaction details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [reference]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#103D32] border-t-[#B7F36B] rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-[#75817A]">Loading transaction details...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-[#17231F]">Transaction Not Found</h3>
        <p className="text-xs text-[#75817A]">
          The transaction reference could not be verified or you do not have permission to view it.
        </p>
        <Button variant="outline" size="md" onClick={() => navigate('/transactions')}>
          Back to Transactions
        </Button>
      </div>
    );
  }

  const perms = transaction.permissions || {
    can_accept_terms: false,
    can_pay: false,
    can_mark_ready: false,
    can_view_pickup_code: false,
    can_view_handover_code: false,
    can_accept_and_release: false,
    can_raise_dispute: false,
    is_buyer: false,
    is_seller: false,
    is_courier: false,
    is_admin: false,
  };

  const handleAcceptTerms = async () => {
    try {
      await api.post(`/transactions/${transaction.reference}/accept-terms`);
      showToast('Deal terms accepted successfully.', 'success');
      fetchDetail();
    } catch (err: any) {
      showToast(err.message || 'Failed to accept terms', 'error');
    }
  };

  const handleMarkReady = async () => {
    try {
      await api.post(`/transactions/${transaction.reference}/mark-ready`);
      showToast('Order marked prepared and ready for dispatch.', 'success');
      fetchDetail();
    } catch (err: any) {
      showToast(err.message || 'Failed to mark ready', 'error');
    }
  };

  const handleGetPickupCode = async () => {
    try {
      const res = await api.get<{ code: string; message: string }>(`/transactions/${transaction.reference}/pickup-code`);
      setViewCodeData({
        title: 'Seller Pickup Verification PIN',
        code: res.code,
        type: 'Provide this 6-digit PIN to the courier upon parcel collection.',
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to get pickup code', 'error');
    }
  };

  const handleGetHandoverCode = async () => {
    try {
      const res = await api.get<{ code: string; message: string }>(`/transactions/${transaction.reference}/handover-code`);
      setViewCodeData({
        title: 'Buyer Doorstep Handover PIN',
        code: res.code,
        type: 'Give this 6-digit PIN to the courier upon physical receipt. This starts your inspection window.',
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to get handover code', 'error');
    }
  };

  const handleAcceptAndRelease = async () => {
    if (!window.confirm('Confirm that you have inspected the items and authorize immediate release of funds to the seller?')) {
      return;
    }
    try {
      await api.post(`/transactions/${transaction.reference}/accept-and-release`);
      showToast('Inspection accepted. Seller proceeds recorded in the internal ledger.', 'success');
      fetchDetail();
    } catch (err: any) {
      showToast(err.message || 'Failed to release funds', 'error');
    }
  };

  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeDesc.trim()) {
      showToast('Please provide a detailed dispute description.', 'error');
      return;
    }
    setSubmittingDispute(true);
    try {
      await api.post(`/transactions/${transaction.reference}/dispute`, {
        reason: disputeReason,
        description: disputeDesc,
      });
      showToast('Dispute opened. Funds are locked pending admin arbitration.', 'info');
      setShowDisputeModal(false);
      fetchDetail();
    } catch (err: any) {
      showToast(err.message || 'Failed to open dispute', 'error');
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageBody.trim() || !transaction) return;
    setSendingMessage(true);
    try {
      await api.post(`/transactions/${transaction.reference}/messages`, { body: messageBody.trim() });
      setMessageBody('');
      await fetchDetail();
    } catch (err: any) {
      showToast(err.message || 'Could not send message.', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/transactions')}
            className="inline-flex items-center gap-1.5 text-xs text-[#75817A] hover:text-[#103D32] font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Transactions
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#17231F]">{transaction.title}</h1>
            <Badge status={transaction.status} />
          </div>
          <p className="text-xs text-[#75817A] mt-1 font-mono">
            Deal Reference: <strong>{transaction.reference}</strong> • Created{' '}
            {new Date(transaction.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Action Pill Summary */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showToast('Transaction link copied to clipboard.', 'info');
            }}
            icon={<Share2 className="w-3.5 h-3.5" />}
          >
            Share
          </Button>
        </div>
      </div>

      {/* Visual Transaction Timeline */}
      <Card>
        <TransactionTimeline transaction={transaction} />
      </Card>

      {/* Authorized Action Ribbon */}
      <div className="bg-[#103D32] text-white p-5 rounded-2xl border border-[#144C3F] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-300">Authorized Next Steps</span>
          <p className="text-sm font-bold text-white mt-0.5">
            {transaction.status === 'draft' && 'Review terms and sign acceptance to advance deal.'}
            {transaction.status === 'pending_payment' && 'Buyer must deposit funds into Escrow Vault to initiate seller dispatch.'}
            {transaction.status === 'payment_held' && 'Payment secured in Escrow Vault. Seller must pack and mark order ready.'}
            {transaction.status === 'order_prepared' && 'Courier collection in progress. Seller must show Pickup PIN to courier.'}
            {transaction.status === 'in_transit' && 'Package is en route. Buyer will provide Handover PIN upon doorstep delivery.'}
            {transaction.status === 'in_inspection' && `Item delivered! Buyer has ${transaction.inspection_period_days} days to inspect and release funds.`}
            {transaction.status === 'completed' && 'Transaction closed and seller proceeds recorded in the internal ledger.'}
            {transaction.status === 'disputed' && 'Dispute under investigation. Funds are frozen in custody vault.'}
          </p>
        </div>

        {/* Dynamic Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {perms.can_accept_terms && (
            <Button
              variant="primary"
              size="md"
              onClick={handleAcceptTerms}
              icon={<Check className="w-4 h-4" />}
            >
              Accept Agreed Terms
            </Button>
          )}

          {perms.can_pay && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowPayModal(true)}
              icon={<CreditCard className="w-4 h-4" />}
            >
              Deposit KES {transaction.total_amount.toLocaleString()} (M-Pesa)
            </Button>
          )}

          {perms.can_mark_ready && (
            <Button
              variant="primary"
              size="md"
              onClick={handleMarkReady}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Mark Order Ready for Dispatch
            </Button>
          )}

          {perms.can_view_pickup_code && (
            <Button
              variant="primary"
              size="md"
              onClick={handleGetPickupCode}
              icon={<KeyRound className="w-4 h-4" />}
            >
              View Courier Pickup PIN
            </Button>
          )}

          {perms.can_view_handover_code && (
            <Button
              variant="primary"
              size="md"
              onClick={handleGetHandoverCode}
              icon={<KeyRound className="w-4 h-4" />}
            >
              View Doorstep Handover PIN
            </Button>
          )}

          {perms.can_accept_and_release && (
            <Button
              variant="success"
              size="md"
              onClick={handleAcceptAndRelease}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Accept Goods & Release Funds
            </Button>
          )}

          {/* Courier direct verification buttons if user is viewing in courier role */}
          {user?.role === 'courier' && ['payment_held', 'order_prepared'].includes(transaction.status) && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setCodeModalType('pickup')}
              icon={<KeyRound className="w-4 h-4" />}
            >
              Enter Pickup PIN
            </Button>
          )}

          {user?.role === 'courier' && transaction.status === 'in_transit' && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setCodeModalType('handover')}
              icon={<KeyRound className="w-4 h-4" />}
            >
              Enter Handover PIN
            </Button>
          )}

          {perms.can_raise_dispute && (
            <Button
              variant="outline"
              size="md"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => setShowDisputeModal(true)}
              icon={<AlertTriangle className="w-4 h-4 text-amber-300" />}
            >
              Raise Dispute
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Details & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Deal Terms & Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Description & Specification */}
          <Card title="Deal Scope & Specifications">
            <div className="space-y-4">
              <p className="text-xs text-[#17231F] leading-relaxed whitespace-pre-line">
                {transaction.description}
              </p>

              <div className="pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Category</span>
                  <p className="font-semibold text-[#17231F] capitalize mt-0.5">
                    {transaction.category.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Delivery Mode</span>
                  <p className="font-semibold text-[#17231F] capitalize mt-0.5">
                    {transaction.delivery_type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Inspection Period</span>
                  <p className="font-semibold text-[#17231F] mt-0.5">
                    {transaction.inspection_period_days} Days
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Agreed Contract Terms */}
          {transaction.terms && (
            <Card title="Agreed Terms & Conditions" subtitle="Ratified escrow conditions binding both parties.">
              <div className="space-y-4 text-xs">
                <div className="bg-[#F5F7F4] p-3.5 rounded-xl border border-[#E4EAE5]">
                  <span className="font-bold text-[#103D32] block mb-1">Acceptance Requirements</span>
                  <p className="text-[#75817A] leading-relaxed">
                    {transaction.terms.acceptance_conditions}
                  </p>
                </div>

                <div className="bg-[#F5F7F4] p-3.5 rounded-xl border border-[#E4EAE5]">
                  <span className="font-bold text-[#103D32] block mb-1">Refund & Return Policy</span>
                  <p className="text-[#75817A] leading-relaxed">
                    {transaction.terms.refund_conditions}
                  </p>
                </div>

                <div className="bg-[#F5F7F4] p-3.5 rounded-xl border border-[#E4EAE5]">
                  <span className="font-bold text-[#103D32] block mb-1">Release Requirements</span>
                  <p className="text-[#75817A] leading-relaxed">
                    {transaction.terms.release_requirements}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-[#75817A]">
                  <span>Buyer Confirmed: {transaction.terms.buyer_accepted ? 'Yes' : 'Pending'}</span>
                  <span>Seller Confirmed: {transaction.terms.seller_accepted ? 'Yes' : 'Pending'}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Delivery Assignment Details if physical */}
          {transaction.delivery_assignment && (
            <Card title="Courier Dispatch & Delivery Addresses">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Pickup Location</span>
                  <p className="font-semibold text-[#17231F]">{transaction.delivery_assignment.pickup_address}</p>
                  <p className="text-[11px] text-gray-500 mt-1">Sender: {transaction.seller?.full_name}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Drop-off Destination</span>
                  <p className="font-semibold text-[#17231F]">{transaction.delivery_assignment.dropoff_address}</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Recipient: {transaction.delivery_assignment.recipient_name} ({transaction.delivery_assignment.recipient_phone})
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Audit & Event Log */}
          {(perms.is_buyer || perms.is_seller) && (
            <Card title="Deal conversation" subtitle="Keep questions and delivery details with this transaction.">
              <div className="space-y-4">
                <div className="max-h-80 overflow-y-auto space-y-3" aria-live="polite">
                  {transaction.messages?.length ? transaction.messages.map(message => (
                    <div key={message.id} className={`rounded-xl border p-3 text-xs ${message.sender_id === user?.id ? 'ml-5 border-[#A8D77A] bg-[#F0F9E8]' : 'mr-5 border-[#E4EAE5] bg-[#F5F7F4]'}`}>
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <strong className="text-[#103D32]">{message.sender_id === user?.id ? 'You' : message.sender_name}</strong>
                        <time className="text-[#75817A]" dateTime={message.created_at}>{new Date(message.created_at).toLocaleString()}</time>
                      </div>
                      <p className="text-[#17231F] whitespace-pre-wrap break-words">{message.body}</p>
                    </div>
                  )) : <p className="text-xs text-[#75817A] flex items-center gap-2"><MessageSquare className="w-4 h-4" aria-hidden="true" /> No messages yet. Start the conversation.</p>}
                </div>
                {!['cancelled', 'refunded', 'completed'].includes(transaction.status) && (
                  <form onSubmit={handleSendMessage} className="space-y-2">
                    <label htmlFor="deal-message" className="text-xs font-bold text-[#17231F]">Message the {perms.is_buyer ? 'seller' : 'buyer'}</label>
                    <textarea id="deal-message" value={messageBody} onChange={e => setMessageBody(e.target.value)} maxLength={2000} rows={3} placeholder="Ask about the item, terms, or delivery…" className="w-full rounded-xl border border-[#CAD5CC] bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#103D32]" />
                    <Button type="submit" variant="primary" size="sm" loading={sendingMessage} disabled={!messageBody.trim()} icon={<Send className="w-4 h-4" aria-hidden="true" />}>Send message</Button>
                  </form>
                )}
              </div>
            </Card>
          )}

          <Card title="Timeline Event History" subtitle="Recorded actions on this transaction.">
            <div className="space-y-3">
              {transaction.events && transaction.events.length > 0 ? (
                transaction.events.map(ev => (
                  <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#F5F7F4] border border-[#E4EAE5] text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#103D32] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-[#17231F]">{ev.description}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Actor: {ev.actor_name} • {new Date(ev.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No events logged yet.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Financial Breakdown & Counterparty Info */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Price & Escrow Fee Card */}
          <Card title="Financial Summary">
            <div className="space-y-4">
              <div className="bg-[#092B24] p-4 rounded-2xl text-white">
                <span className="text-[10px] uppercase font-bold text-emerald-300">Total Escrow Value</span>
                <p className="text-2xl font-extrabold text-white mt-0.5">
                  KES {transaction.total_amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-300 mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#B7F36B]" />
                  Status:{' '}
                  <span className="capitalize font-bold text-[#B7F36B]">{transaction.status.replace('_', ' ')}</span>
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-[#75817A] pt-2">
                <div className="flex justify-between">
                  <span>Item Value:</span>
                  <span className="font-semibold text-[#17231F]">KES {transaction.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Escrow Fee (2.5%):</span>
                  <span className="font-semibold text-[#17231F]">KES {transaction.platform_fee.toLocaleString()}</span>
                </div>
                {transaction.delivery_fee > 0 && (
                  <div className="flex justify-between">
                    <span>Courier Delivery Fee:</span>
                    <span className="font-semibold text-[#17231F]">KES {transaction.delivery_fee.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between font-extrabold text-sm text-[#103D32]">
                  <span>Total Payable:</span>
                  <span>KES {transaction.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Counterparties Card */}
          <Card title="Parties to Transaction">
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Buyer (Depositor)</span>
                <p className="font-bold text-[#17231F]">{transaction.buyer?.full_name}</p>
                <p className="text-gray-500 text-[11px]">{transaction.buyer?.phone_number}</p>
                <p className="text-gray-500 text-[11px]">{transaction.buyer?.email}</p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Seller (Payee)</span>
                <p className="font-bold text-[#17231F]">{transaction.seller?.full_name}</p>
                <p className="text-gray-500 text-[11px]">{transaction.seller?.phone_number}</p>
                <p className="text-gray-500 text-[11px]">{transaction.seller?.email}</p>
              </div>

              {transaction.courier && (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Assigned Courier</span>
                  <p className="font-bold text-[#17231F]">{transaction.courier.full_name}</p>
                  <p className="text-gray-500 text-[11px]">{transaction.courier.phone_number}</p>
                </div>
              )}
            </div>
          </Card>

        </div>

      </div>

      {/* Code Display Modal */}
      {viewCodeData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-[#E4EAE5]">
            <div className="w-12 h-12 rounded-full bg-[#EBFDD6] text-[#103D32] flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#17231F]">{viewCodeData.title}</h3>
            <p className="text-xs text-[#75817A]">{viewCodeData.type}</p>
            
            <div className="py-4 px-6 bg-[#092B24] rounded-2xl text-center">
              <span className="font-mono text-3xl font-extrabold tracking-widest text-[#B7F36B]">
                {viewCodeData.code}
              </span>
            </div>

            <p className="text-[10px] text-gray-400">
              Single-use PIN. Hashed with SHA-256 in Escrow database. Expires in 48 hours.
            </p>

            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => setViewCodeData(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* M-Pesa Payment Modal */}
      {showPayModal && (
        <MpesaModal
          isOpen={true}
          onClose={() => setShowPayModal(false)}
          transactionRef={transaction.reference}
          amount={transaction.total_amount}
          onPaymentSuccess={fetchDetail}
        />
      )}

      {/* Courier Code Verification Modal */}
      {codeModalType && (
        <CodeVerificationModal
          isOpen={true}
          onClose={() => setCodeModalType(null)}
          transactionRef={transaction.reference}
          codeType={codeModalType}
          onSuccess={fetchDetail}
        />
      )}

      {/* Raise Dispute Modal */}
      {showDisputeModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowDisputeModal(false)}
          title="Open Escrow Dispute"
          subtitle={`Freezes funds for ${transaction.reference} pending administrative investigation`}
        >
          <form onSubmit={handleRaiseDispute} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#17231F] mb-1">
                Dispute Reason *
              </label>
              <select
                value={disputeReason}
                onChange={e => setDisputeReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EAE5] text-xs font-medium focus:ring-2 focus:ring-[#B7F36B] focus:outline-none"
              >
                <option value="damaged_goods">Damaged or Broken in Transit</option>
                <option value="not_as_described">Not as Described / Wrong Specifications</option>
                <option value="missing_items">Missing Items / Incomplete Shipment</option>
                <option value="non_delivery">Non-Delivery or Fake Courier Handoff</option>
                <option value="incomplete_service">Incomplete Freelance Deliverable</option>
                <option value="other">Other Violation of Agreed Terms</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231F] mb-1">
                Detailed Description & Evidence *
              </label>
              <textarea
                rows={4}
                required
                value={disputeDesc}
                onChange={e => setDisputeDesc(e.target.value)}
                placeholder="Explain the specific issue in detail and mention any photos, serial numbers, or diagnostic reports available..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EAE5] text-xs focus:ring-2 focus:ring-[#B7F36B] focus:outline-none"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              Raising a dispute blocks buyer release while an admin reviews the case and records a decision.
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" size="md" onClick={() => setShowDisputeModal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="md"
                loading={submittingDispute}
                icon={<AlertTriangle className="w-4 h-4" />}
              >
                Submit Dispute Claim
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default TransactionDetailPage;
