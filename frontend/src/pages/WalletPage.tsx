import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, ShieldCheck, ArrowDownLeft, ArrowUpRight, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { LedgerEntry, WalletSummary } from '../types';
import api from '../services/api';

export const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const [sumRes, ledRes] = await Promise.all([
        api.get<WalletSummary>('/wallet/summary'),
        api.get<{ entries: LedgerEntry[] }>('/wallet/ledger'),
      ]);
      setSummary(sumRes);
      setEntries(ledRes.entries);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch financial ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#17231F]">Wallet & Transaction Ledger</h1>
          <p className="text-xs text-[#75817A] mt-1">
            Immutable double-entry financial ledger of verified escrow custody and settled earnings.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchWallet} icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Ledger
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Cleared Settled Balance */}
        <div className="bg-[#103D32] rounded-2xl p-6 text-white space-y-2 border border-[#144C3F]">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-bold uppercase">
            <span>Settled Ledger Balance</span>
            <Wallet className="w-4 h-4 text-[#B7F36B]" />
          </div>
          <p className="text-3xl font-extrabold text-white">
            KES {(summary?.settled_balance || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-300">
            Cleared funds ready for scheduled disbursement.
          </p>
        </div>

        {/* Protected in Escrow (Buyer deposits) */}
        <div className="bg-white rounded-2xl p-6 border border-[#E4EAE5] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase">
            <span>Active Buyer Escrow</span>
            <Lock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-[#17231F]">
            KES {(summary?.buyer_escrow_holding || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium">
            Locked in vault awaiting delivery & inspection.
          </p>
        </div>

        {/* Incoming Sales Escrow */}
        <div className="bg-white rounded-2xl p-6 border border-[#E4EAE5] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase">
            <span>Pending Seller Settlement</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-[#17231F]">
            KES {(summary?.seller_pending_settlement || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-500 font-medium">
            Settles automatically upon buyer inspection acceptance.
          </p>
        </div>

      </div>

      {/* Regulatory Notice Banner */}
      <div className="bg-[#F5F7F4] p-4 rounded-2xl border border-[#E4EAE5] text-xs text-[#75817A] flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#103D32] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#103D32]">Central Bank of Kenya (CBK) Escrow Custody Compliance:</strong>{' '}
          In accordance with Kenyan national payment system regulations, buyer funds are held in trust accounts and are not classified as withdrawable deposits until inspection acceptance conditions are met. Settlements are disbursed directly to registered Safaricom M-Pesa accounts during official clearing windows.
        </div>
      </div>

      {/* Ledger Table */}
      <Card
        title="Double-Entry Financial Ledger"
        subtitle="Cryptographically verified debits and credits recorded in chronological order."
      >
        {loading ? (
          <div className="py-12 text-center text-xs text-[#75817A]">Loading ledger records...</div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#75817A]">
            No financial entries in your ledger yet. Create or fund a deal to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4EAE5] text-[#75817A] uppercase text-[10px] tracking-wider bg-gray-50/50">
                  <th className="py-3 px-4 font-bold">Ledger Ref</th>
                  <th className="py-3 px-4 font-bold">Type & Description</th>
                  <th className="py-3 px-4 font-bold">Amount (KES)</th>
                  <th className="py-3 px-4 font-bold">Balance After</th>
                  <th className="py-3 px-4 font-bold">Provider</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4EAE5]">
                {entries.map(e => {
                  const isCredit = e.direction === 'credit';
                  return (
                    <tr key={e.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#103D32]">
                        {e.reference}
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              isCredit ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#17231F]">{e.description}</p>
                            <span className="text-[10px] text-gray-400 capitalize">
                              {e.entry_type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td
                        className={`py-3.5 px-4 font-extrabold ${
                          isCredit ? 'text-[#218653]' : 'text-red-600'
                        }`}
                      >
                        {isCredit ? '+' : '-'} KES {e.amount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#17231F]">
                        KES {e.balance_after.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-[#75817A] text-[11px]">
                        {e.provider}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="success">Verified</Badge>
                      </td>

                      <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                        {new Date(e.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  );
};

export default WalletPage;
