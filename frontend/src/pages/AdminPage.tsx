import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  ArrowLeftRight,
  AlertTriangle,
  CreditCard,
  History,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Search,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { AdminStats, Dispute, Transaction, User, Payment } from '../types';
import api from '../services/api';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'disputes' | 'audit'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [disputesList, setDisputesList] = useState<Dispute[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dispute Ruling Modal State
  const [resolvingDispute, setResolvingDispute] = useState<Dispute | null>(null);
  const [ruling, setRuling] = useState<'resolved_buyer_refund' | 'resolved_seller_payout' | 'resolved_split'>('resolved_buyer_refund');
  const [rulingNotes, setRulingNotes] = useState('');
  const [submittingRuling, setSubmittingRuling] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [stRes, uRes, txRes, dRes, aRes] = await Promise.all([
        api.get<{ stats: AdminStats }>('/admin/stats'),
        api.get<{ users: User[] }>('/admin/users'),
        api.get<{ transactions: Transaction[] }>('/admin/transactions'),
        api.get<{ disputes: Dispute[] }>('/admin/disputes'),
        api.get<{ audit_logs: any[] }>('/admin/audit-logs'),
      ]);

      setStats(stRes.stats);
      setUsersList(uRes.users);
      setTransactionsList(txRes.transactions);
      setDisputesList(dRes.disputes);
      setAuditLogs(aRes.audit_logs);
    } catch (err: any) {
      showToast(err.message || 'Failed to load admin management portal', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingDispute) return;
    if (!rulingNotes.trim()) {
      showToast('Please provide detailed administrative ruling notes.', 'error');
      return;
    }

    setSubmittingRuling(true);
    try {
      const res = await api.post<{ message: string }>(`/admin/disputes/${resolvingDispute.id}/resolve`, {
        resolution: ruling,
        notes: rulingNotes.trim(),
      });
      showToast(res.message, 'success');
      setResolvingDispute(null);
      setRulingNotes('');
      fetchAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit ruling', 'error');
    } finally {
      setSubmittingRuling(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-[#17231F]">Access Restricted</h2>
        <p className="text-xs text-[#75817A] max-w-sm mx-auto">
          The administration portal requires verified platform operator credentials.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-bold mb-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Root Admin Supervision Active</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#17231F]">Platform Administration Portal</h1>
          <p className="text-xs text-[#75817A]">
            Arbitrate marketplace disputes, monitor Safaricom Daraja settlement flows, and enforce KYC compliance.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchAdminData} icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Portal
        </Button>
      </div>

      {/* Admin KPI Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E4EAE5] shadow-sm">
            <span className="text-[11px] font-bold text-[#75817A] uppercase">Total Deal Volume</span>
            <p className="text-2xl font-extrabold text-[#103D32] mt-1">
              KES {stats.total_volume.toLocaleString()}
            </p>
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              Across {stats.total_transactions} transactions
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E4EAE5] shadow-sm">
            <span className="text-[11px] font-bold text-[#75817A] uppercase">Active Vault Holding</span>
            <p className="text-2xl font-extrabold text-[#218653] mt-1">
              KES {stats.active_escrow_holding.toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">
              100% Secured in Escrow
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E4EAE5] shadow-sm">
            <span className="text-[11px] font-bold text-[#75817A] uppercase">Open Disputes</span>
            <p className="text-2xl font-extrabold text-red-600 mt-1">
              {stats.open_disputes}
            </p>
            <span className="text-[10px] text-red-700 font-medium mt-0.5 block">
              {stats.dispute_rate}% platform dispute rate
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E4EAE5] shadow-sm">
            <span className="text-[11px] font-bold text-[#75817A] uppercase">Platform Revenue (2.5%)</span>
            <p className="text-2xl font-extrabold text-[#103D32] mt-1">
              KES {stats.platform_revenue.toLocaleString()}
            </p>
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              Reconciliation: {stats.reconciliation_rate}%
            </span>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4EAE5] pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Dispute Arbitration', count: disputesList.filter(d => d.status === 'open').length },
          { id: 'transactions', label: 'All Transactions', count: transactionsList.length },
          { id: 'users', label: 'Users & KYC', count: usersList.length },
          { id: 'audit', label: 'Security Audit Logs', count: auditLogs.length },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-[#103D32] text-[#B7F36B] shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-mono">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: DISPUTE ARBITRATION */}
      {activeTab === 'overview' && (
        <Card
          title="Disputes Requiring Administrative Rulings"
          subtitle="Investigate buyer and seller evidence and issue binding escrow settlement decisions."
        >
          {disputesList.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#75817A]">
              No active disputes in the queue.
            </div>
          ) : (
            <div className="space-y-4">
              {disputesList.map(disp => (
                <div
                  key={disp.id}
                  className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#17231F]">
                        Claim #{disp.id}: {disp.reason.replace('_', ' ').toUpperCase()}
                      </span>
                      <Badge status={disp.status} />
                      <span className="font-mono text-xs text-gray-500 font-bold">
                        Deal: {disp.transaction?.reference}
                      </span>
                    </div>

                    <p className="text-xs text-[#75817A] leading-relaxed">
                      {disp.description}
                    </p>

                    <div className="text-[11px] text-gray-400">
                      Initiated by: <strong className="text-gray-700">{disp.initiator_name}</strong> •{' '}
                      Escrow Vault Amount: <strong className="text-[#103D32]">KES {disp.transaction?.total_amount.toLocaleString()}</strong>
                    </div>

                    {disp.resolution_notes && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs mt-1">
                        <strong>Previous Ruling:</strong> {disp.resolution_notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {['open', 'under_review'].includes(disp.status) ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setResolvingDispute(disp);
                          setRulingNotes(`Administrative resolution for claim #${disp.id}.`);
                        }}
                      >
                        Issue Ruling
                      </Button>
                    ) : (
                      <span className="text-xs font-bold text-[#218653] bg-[#EBFDD6] px-3 py-1 rounded-full border border-[#B7F36B]">
                        Resolved
                      </span>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/transactions/${disp.transaction?.reference}`, '_blank')}
                    >
                      Inspect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: TRANSACTIONS LIST */}
      {activeTab === 'transactions' && (
        <Card title="Platform-Wide Transactions Monitor">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4EAE5] text-[#75817A] uppercase text-[10px] tracking-wider bg-gray-50/50">
                  <th className="py-3 px-4 font-bold">Ref</th>
                  <th className="py-3 px-4 font-bold">Title</th>
                  <th className="py-3 px-4 font-bold">Buyer</th>
                  <th className="py-3 px-4 font-bold">Seller</th>
                  <th className="py-3 px-4 font-bold">Amount (KES)</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4EAE5]">
                {transactionsList.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#103D32]">{tx.reference}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#17231F] truncate max-w-xs">{tx.title}</td>
                    <td className="py-3.5 px-4 text-gray-600">{tx.buyer?.full_name}</td>
                    <td className="py-3.5 px-4 text-gray-600">{tx.seller?.full_name}</td>
                    <td className="py-3.5 px-4 font-extrabold text-[#17231F]">
                      KES {tx.total_amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4"><Badge status={tx.status} size="sm" /></td>
                    <td className="py-3.5 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/transactions/${tx.reference}`, '_blank')}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: USERS & ROLES */}
      {activeTab === 'users' && (
        <Card title="Registered Traders & KYC Enforcement">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4EAE5] text-[#75817A] uppercase text-[10px] tracking-wider bg-gray-50/50">
                  <th className="py-3 px-4 font-bold">Name</th>
                  <th className="py-3 px-4 font-bold">Email</th>
                  <th className="py-3 px-4 font-bold">Phone Number</th>
                  <th className="py-3 px-4 font-bold">Role</th>
                  <th className="py-3 px-4 font-bold">KYC Status</th>
                  <th className="py-3 px-4 font-bold">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4EAE5]">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4 font-bold text-[#17231F]">{u.full_name}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{u.email}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{u.phone_number}</td>
                    <td className="py-3.5 px-4 capitalize font-semibold text-[#103D32]">{u.role}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={u.kyc_status === 'verified' ? 'success' : 'warning'} size="sm">
                        {u.kyc_status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <Card title="Platform Security & Regulatory Audit Logs" subtitle="Tamper-evident system activity trail.">
          <div className="space-y-3">
            {auditLogs.map(l => (
              <div key={l.id} className="p-3 rounded-xl bg-[#F5F7F4] border border-[#E4EAE5] text-xs flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-[#103D32]">{l.action}</span>
                  <span className="text-gray-400 mx-2">•</span>
                  <span className="text-gray-700">Target: {l.target_type} #{l.target_id || ''}</span>
                  <span className="text-gray-400 mx-2">•</span>
                  <span className="text-gray-500">Actor: {l.actor_name}</span>
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(l.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Dispute Ruling Modal */}
      {resolvingDispute && (
        <Modal
          isOpen={true}
          onClose={() => setResolvingDispute(null)}
          title={`Arbitrate Claim #${resolvingDispute.id}`}
          subtitle={`Deal Ref: ${resolvingDispute.transaction?.reference} (KES ${resolvingDispute.transaction?.total_amount.toLocaleString()})`}
        >
          <form onSubmit={handleResolveDispute} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#17231F] mb-1">
                Binding Administrative Ruling *
              </label>
              <select
                value={ruling}
                onChange={e => setRuling(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EAE5] text-xs font-semibold focus:ring-2 focus:ring-[#B7F36B] focus:outline-none"
              >
                <option value="resolved_buyer_refund">100% Refund to Buyer (Item Returned / Misrepresented)</option>
                <option value="resolved_seller_payout">100% Payout to Seller (Buyer Claim Rejected / Fraud Protection)</option>
                <option value="resolved_split">50/50 Split Settlement (Compromise Settlement)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231F] mb-1">
                Arbitration Notes & Justification *
              </label>
              <textarea
                rows={4}
                required
                value={rulingNotes}
                onChange={e => setRulingNotes(e.target.value)}
                placeholder="State the evidence evaluated (e.g. diagnostic report, courier tracking logs)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EAE5] text-xs focus:ring-2 focus:ring-[#B7F36B] focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" size="md" onClick={() => setResolvingDispute(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submittingRuling}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Issue & Execute Ruling
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default AdminPage;
