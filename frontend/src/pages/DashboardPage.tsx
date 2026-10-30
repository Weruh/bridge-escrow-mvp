import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Package,
  Layers,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import MpesaModal from '../components/payments/MpesaModal';
import CodeVerificationModal from '../components/delivery/CodeVerificationModal';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Transaction, WalletSummary } from '../types';
import api from '../services/api';

export const DashboardPage: React.FC = () => {
  const { user, activeRole, switchRole } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [payModalTx, setPayModalTx] = useState<Transaction | null>(null);
  const [codeModalTx, setCodeModalTx] = useState<{ tx: Transaction; type: 'pickup' | 'handover' } | null>(null);
  const [viewCodeData, setViewCodeData] = useState<{ title: string; code: string; type: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txRes, walletRes] = await Promise.all([
        api.get<{ transactions: Transaction[] }>(`/transactions?role=${activeRole}`),
        api.get<WalletSummary>('/wallet/summary'),
      ]);
      setTransactions(txRes.transactions);
      setWallet(walletRes);
    } catch (e: any) {
      showToast(e.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeRole]);

  // Buyer filtered transactions
  const buyerAwaitingPayment = transactions.filter(t => t.status === 'pending_payment');
  const buyerInTransit = transactions.filter(t => ['order_prepared', 'in_transit'].includes(t.status));
  const buyerInInspection = transactions.filter(t => t.status === 'in_inspection');
  const buyerCompleted = transactions.filter(t => t.status === 'completed');
  const activeDisputes = transactions.filter(t => t.status === 'disputed' || t.has_active_dispute);

  // Seller filtered transactions
  const sellerAwaitingTerms = transactions.filter(t => t.status === 'draft');
  const sellerNeedPrepare = transactions.filter(t => t.status === 'payment_held');
  const sellerReadyPickup = transactions.filter(t => t.status === 'order_prepared');
  const sellerInTransit = transactions.filter(t => t.status === 'in_transit');

  // Courier deliveries
  const courierDeliveries = transactions.filter(t =>
    ['payment_held', 'order_prepared', 'in_transit', 'in_inspection'].includes(t.status)
  );

  const handleMarkReady = async (ref: string) => {
    try {
      await api.post(`/transactions/${ref}/mark-ready`);
      showToast('Order marked prepared and ready for dispatch.', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to mark order ready', 'error');
    }
  };

  const handleViewPickupCode = async (ref: string) => {
    try {
      const res = await api.get<{ code: string; message: string }>(`/transactions/${ref}/pickup-code`);
      setViewCodeData({
        title: 'Authorized Courier Pickup PIN',
        code: res.code,
        type: 'Provide this code to the authorized courier to verify package pickup.',
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to retrieve pickup code', 'error');
    }
  };

  const handleViewHandoverCode = async (ref: string) => {
    try {
      const res = await api.get<{ code: string; message: string }>(`/transactions/${ref}/handover-code`);
      setViewCodeData({
        title: 'Doorstep Handover PIN',
        code: res.code,
        type: 'Give this 6-digit PIN to the courier upon physical receipt to begin your inspection.',
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to retrieve handover code', 'error');
    }
  };

  const handleAcceptAndRelease = async (ref: string) => {
    if (!window.confirm('Are you sure you want to approve this order and release funds to the seller? This action cannot be reversed.')) {
      return;
    }
    try {
      await api.post(`/transactions/${ref}/accept-and-release`);
      showToast('Order accepted! Funds released to seller.', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to release funds', 'error');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Greeting & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tracking-tight">
            Hello, {user?.full_name?.split(' ')[0] || 'Trader'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#75817A] mt-1">
            {activeRole === 'buyer' && 'Monitor your protected orders, active deliveries, and inspection periods.'}
            {activeRole === 'seller' && 'Manage your sales pipeline, courier pickups, and verified escrow releases.'}
            {activeRole === 'courier' && 'Verify order dispatches with dual cryptographic pickup and handover codes.'}
            {activeRole === 'admin' && 'Platform oversight, dispute rulings, and payment reconciliation.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/transactions/create')}
            icon={<Plus className="w-4 h-4" />}
          >
            Create Protected Deal
          </Button>
        </div>
      </div>

      {/* Role Switcher Banner */}
      <div className="bg-[#103D32] rounded-2xl p-4 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#144C3F]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#092B24] flex items-center justify-center text-[#B7F36B] shrink-0 font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Viewing as: <span className="text-[#B7F36B]">{activeRole.toUpperCase()}</span>
            </p>
            <p className="text-xs text-gray-200">
              Switch role view to test counterparty workflows (e.g. view seller pickup codes or courier code verification).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#092B24] p-1 rounded-xl border border-[#144C3F] self-stretch md:self-auto justify-center">
          {(['buyer', 'seller', 'courier'] as const).map(r => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                activeRole === r
                  ? 'bg-[#B7F36B] text-[#092B24] shadow-sm'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {r} Mode
            </button>
          ))}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Escrow Vault Holding */}
        <div className="bg-white rounded-2xl p-5 border border-[#E4EAE5] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#75817A]">
              {activeRole === 'seller' ? 'Secured in Escrow (Sales)' : 'Protected in Escrow (Buyer)'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#103D32] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#17231F]">
            KES {((activeRole === 'seller' ? wallet?.seller_pending_settlement : wallet?.buyer_escrow_holding) || 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Safely locked in Custody Vault</span>
          </div>
        </div>

        {/* Card 2: Settled Ledger */}
        <div className="bg-white rounded-2xl p-5 border border-[#E4EAE5] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#75817A]">Available Settled Balance</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#17231F]">
            KES {(wallet?.settled_balance || 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
            <span>Verified cleared ledger funds</span>
          </div>
        </div>

        {/* Card 3: In Transit / Active Orders */}
        <div className="bg-white rounded-2xl p-5 border border-[#E4EAE5] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#75817A]">Deliveries in Transit</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#17231F]">
            {transactions.filter(t => ['in_transit', 'order_prepared'].includes(t.status)).length}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700">
            <span>Couriers tracking with PIN codes</span>
          </div>
        </div>

        {/* Card 4: In Inspection Window */}
        <div className="bg-white rounded-2xl p-5 border border-[#E4EAE5] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#75817A]">Under Buyer Inspection</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#17231F]">
            {transactions.filter(t => t.status === 'in_inspection').length}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-purple-700">
            <span>3-Day window countdown active</span>
          </div>
        </div>

      </div>

      {/* Code Display Modal (If user requested their authorized pickup or handover PIN) */}
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
              Single-use cryptographic PIN. Expires in 48 hours. Max 3 attempts allowed.
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

      {/* ========================================================================= */}
      {/* BUYER WORKSPACE VIEW */}
      {/* ========================================================================= */}
      {activeRole === 'buyer' && (
        <div className="space-y-6">
          
          {/* Action Required: Orders Awaiting Inspection */}
          {buyerInInspection.length > 0 && (
            <Card
              title="⏳ Orders In Inspection Window (Your Action Required)"
              subtitle="Items have been handed over by the courier. Inspect them and click Accept to release funds, or Open Dispute if issues exist."
              className="border-purple-200 bg-purple-50/20"
            >
              <div className="space-y-3">
                {buyerInInspection.map(tx => (
                  <div
                    key={tx.id}
                    className="bg-white p-4 rounded-xl border border-purple-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#17231F]">{tx.title}</span>
                        <Badge status={tx.status} />
                      </div>
                      <p className="text-xs text-[#75817A] mt-1">
                        Seller: {tx.seller?.full_name} • KES {tx.amount.toLocaleString()} in escrow vault
                      </p>
                      <p className="text-[11px] font-semibold text-purple-700 mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Inspection window ends:{' '}
                        {tx.inspection_deadline
                          ? new Date(tx.inspection_deadline).toLocaleDateString()
                          : 'Within 72 hours'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleAcceptAndRelease(tx.reference)}
                        icon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Accept & Release Funds
                      </Button>
                      <Link to={`/transactions/${tx.reference}`}>
                        <Button variant="outline" size="sm">
                          Details / Dispute
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Action Required: Payments Awaiting Confirmation */}
          {buyerAwaitingPayment.length > 0 && (
            <Card
              title="💳 Payments Awaiting Escrow Deposit"
              subtitle="Terms have been accepted. Fund the escrow vault with M-Pesa to authorize dispatch."
              className="border-amber-200 bg-amber-50/20"
            >
              <div className="space-y-3">
                {buyerAwaitingPayment.map(tx => (
                  <div
                    key={tx.id}
                    className="bg-white p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#17231F]">{tx.title}</span>
                        <Badge status={tx.status} />
                      </div>
                      <p className="text-xs text-[#75817A] mt-1">
                        Total Payable: <strong>KES {tx.total_amount.toLocaleString()}</strong> (Amount KES {tx.amount.toLocaleString()} + Escrow Fee KES {tx.platform_fee.toLocaleString()})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setPayModalTx(tx)}
                        icon={<CreditCard className="w-4 h-4" />}
                      >
                        Deposit via M-Pesa
                      </Button>
                      <Link to={`/transactions/${tx.reference}`}>
                        <Button variant="outline" size="sm">
                          View Terms
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Active Purchases List */}
          <Card
            title="My Protected Purchases"
            subtitle="All active and historical purchases"
            action={
              <Link to="/transactions?role=buyer" className="text-xs font-bold text-[#218653] hover:underline">
                View All ({transactions.length})
              </Link>
            }
          >
            {transactions.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Package className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-xs text-[#75817A]">No active purchases found.</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/transactions/create')}
                >
                  Create Your First Protected Deal
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/transactions/${tx.reference}`}
                          className="font-bold text-sm text-[#17231F] hover:text-[#103D32] truncate"
                        >
                          {tx.title}
                        </Link>
                        <Badge status={tx.status} size="sm" />
                      </div>
                      <p className="text-xs text-[#75817A] mt-0.5">
                        Ref: <span className="font-mono">{tx.reference}</span> • Seller: {tx.seller?.full_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-[#17231F]">
                          KES {tx.total_amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {tx.delivery_type === 'digital_service' ? 'Digital' : 'Courier'}
                        </p>
                      </div>

                      {/* Authorized Handover PIN button if order is en route */}
                      {['order_prepared', 'in_transit'].includes(tx.status) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewHandoverCode(tx.reference)}
                          icon={<KeyRound className="w-3.5 h-3.5" />}
                        >
                          View Handover PIN
                        </Button>
                      )}

                      <Link to={`/transactions/${tx.reference}`}>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SELLER WORKSPACE VIEW */}
      {/* ========================================================================= */}
      {activeRole === 'seller' && (
        <div className="space-y-6">
          
          {/* Action Required: Orders Awaiting Preparation */}
          {sellerNeedPrepare.length > 0 && (
            <Card
              title="📦 Orders Paid & Awaiting Dispatch (Prepare Item)"
              subtitle="The buyer has secured 100% of the funds in the Escrow Vault. Pack the order and mark ready for courier pickup."
              className="border-emerald-200 bg-emerald-50/20"
            >
              <div className="space-y-3">
                {sellerNeedPrepare.map(tx => (
                  <div
                    key={tx.id}
                    className="bg-white p-4 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#17231F]">{tx.title}</span>
                        <Badge status={tx.status} />
                      </div>
                      <p className="text-xs text-[#75817A] mt-1">
                        Buyer: {tx.buyer?.full_name} ({tx.buyer?.phone_number}) • Net Sale:{' '}
                        <strong>KES {tx.amount.toLocaleString()}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleMarkReady(tx.reference)}
                        icon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Mark Ready for Dispatch
                      </Button>
                      <Link to={`/transactions/${tx.reference}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Orders Awaiting Courier Pickup (Show Pickup PIN to Courier) */}
          {sellerReadyPickup.length > 0 && (
            <Card
              title="🚚 Orders Awaiting Courier Pickup"
              subtitle="Show your authorized 6-digit pickup PIN to the courier upon parcel collection."
              className="border-blue-200 bg-blue-50/20"
            >
              <div className="space-y-3">
                {sellerReadyPickup.map(tx => (
                  <div
                    key={tx.id}
                    className="bg-white p-4 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#17231F]">{tx.title}</span>
                        <Badge status={tx.status} />
                      </div>
                      <p className="text-xs text-[#75817A] mt-1">
                        Ref: {tx.reference} • Courier Pickup Address:{' '}
                        {tx.delivery_assignment?.pickup_address || 'Registered Location'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewPickupCode(tx.reference)}
                        icon={<KeyRound className="w-4 h-4" />}
                      >
                        View Courier Pickup PIN
                      </Button>
                      <Link to={`/transactions/${tx.reference}`}>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Active Sales Pipeline */}
          <Card
            title="My Sales Pipeline"
            subtitle="All sales deals created or awaiting settlement"
            action={
              <Link to="/transactions?role=seller" className="text-xs font-bold text-[#218653] hover:underline">
                View All ({transactions.length})
              </Link>
            }
          >
            {transactions.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Package className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-xs text-[#75817A]">No active sales deals found.</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/transactions/create')}
                >
                  Create a Protected Deal
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/transactions/${tx.reference}`}
                          className="font-bold text-sm text-[#17231F] hover:text-[#103D32] truncate"
                        >
                          {tx.title}
                        </Link>
                        <Badge status={tx.status} size="sm" />
                      </div>
                      <p className="text-xs text-[#75817A] mt-0.5">
                        Ref: {tx.reference} • Buyer: {tx.buyer?.full_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-[#17231F]">
                          KES {tx.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {tx.status === 'completed' ? 'Cleared to Ledger' : 'Secured in Escrow'}
                        </p>
                      </div>

                      <Link to={`/transactions/${tx.reference}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COURIER WORKSPACE VIEW */}
      {/* ========================================================================= */}
      {activeRole === 'courier' && (
        <div className="space-y-6">
          <Card
            title="🚚 Courier Dispatch Desk & Code Verification"
            subtitle="Enter pickup code when collecting from seller; enter handover code when delivering to buyer."
          >
            {courierDeliveries.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Truck className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-xs text-[#75817A]">No active courier packages assigned.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {courierDeliveries.map(tx => {
                  const assignment = tx.delivery_assignment;
                  const isReadyForPickup = ['payment_held', 'order_prepared'].includes(tx.status);
                  const isInTransit = tx.status === 'in_transit';

                  return (
                    <div
                      key={tx.id}
                      className="bg-white p-5 rounded-2xl border border-[#E4EAE5] shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#17231F]">{tx.title}</h4>
                          <Badge status={tx.status} />
                          <span className="font-mono text-xs text-gray-400 font-semibold">{tx.reference}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#75817A] pt-1">
                          <div className="bg-[#F5F7F4] p-2.5 rounded-xl border border-[#E4EAE5]">
                            <span className="text-[10px] font-bold uppercase text-gray-400 block">Pickup from:</span>
                            <span className="font-semibold text-[#17231F]">
                              {assignment?.pickup_address || 'Seller Store / Sarit Centre'}
                            </span>
                            <p className="text-[11px] text-gray-500">Seller: {tx.seller?.full_name} ({tx.seller?.phone_number})</p>
                          </div>

                          <div className="bg-[#F5F7F4] p-2.5 rounded-xl border border-[#E4EAE5]">
                            <span className="text-[10px] font-bold uppercase text-gray-400 block">Deliver to:</span>
                            <span className="font-semibold text-[#17231F]">
                              {assignment?.dropoff_address || 'Buyer Residence'}
                            </span>
                            <p className="text-[11px] text-gray-500">Recipient: {assignment?.recipient_name} ({assignment?.recipient_phone})</p>
                          </div>
                        </div>
                      </div>

                      {/* Verification Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full lg:w-auto">
                        {isReadyForPickup && (
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => setCodeModalTx({ tx, type: 'pickup' })}
                            icon={<KeyRound className="w-4 h-4" />}
                          >
                            Enter Pickup PIN
                          </Button>
                        )}

                        {isInTransit && (
                          <Button
                            variant="secondary"
                            size="md"
                            onClick={() => setCodeModalTx({ tx, type: 'handover' })}
                            icon={<CheckCircle2 className="w-4 h-4 text-[#B7F36B]" />}
                          >
                            Enter Handover PIN
                          </Button>
                        )}

                        <Link to={`/transactions/${tx.reference}`}>
                          <Button variant="outline" size="md" className="w-full sm:w-auto">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* M-Pesa Payment Modal */}
      {payModalTx && (
        <MpesaModal
          isOpen={true}
          onClose={() => setPayModalTx(null)}
          transactionRef={payModalTx.reference}
          amount={payModalTx.total_amount}
          onPaymentSuccess={fetchData}
        />
      )}

      {/* Courier Code Verification Modal */}
      {codeModalTx && (
        <CodeVerificationModal
          isOpen={true}
          onClose={() => setCodeModalTx(null)}
          transactionRef={codeModalTx.tx.reference}
          codeType={codeModalTx.type}
          onSuccess={fetchData}
        />
      )}

    </div>
  );
};

export default DashboardPage;
