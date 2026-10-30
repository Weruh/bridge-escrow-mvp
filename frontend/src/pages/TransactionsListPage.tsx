import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Plus, Filter, ArrowRight, Package, ShieldCheck, ArrowUpDown } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Transaction, TransactionStatus } from '../types';
import api from '../services/api';

export const TransactionsListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, activeRole } = useAuth();
  const { showToast } = useNotifications();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const roleFilter = searchParams.get('role') || activeRole;

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { role: roleFilter };
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await api.get<{ transactions: Transaction[] }>('/transactions', { params });
      setTransactions(res.transactions);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };

  const statusTabs = [
    { id: 'all', label: 'All Deals' },
    { id: 'pending_payment', label: 'Awaiting Payment' },
    { id: 'payment_held', label: 'Secured in Escrow' },
    { id: 'in_transit', label: 'In Transit' },
    { id: 'in_inspection', label: 'In Inspection' },
    { id: 'completed', label: 'Completed' },
    { id: 'disputed', label: 'Disputed' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#17231F]">Transactions Desk</h1>
          <p className="text-xs text-[#75817A] mt-1">
            Search and manage all escrow transactions across purchases, sales, and logistics.
          </p>
        </div>

        <Link to="/transactions/create">
          <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
            New Protected Deal
          </Button>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E4EAE5] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title, deal reference (e.g. BE-2610)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E4EAE5] text-xs focus:ring-2 focus:ring-[#B7F36B] focus:outline-none font-medium"
            />
          </form>

          {/* Quick Counter */}
          <div className="text-xs font-semibold text-[#75817A] shrink-0">
            Found <span className="text-[#103D32] font-bold">{transactions.length}</span> deals
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-gray-100">
          {statusTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#103D32] text-[#B7F36B] shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table / List Card */}
      <Card>
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#103D32] border-t-[#B7F36B] rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-[#75817A]">Loading deals...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Package className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="text-sm font-bold text-[#17231F]">No transactions match your query</h4>
            <p className="text-xs text-[#75817A]">Try adjusting filters or create a new protected deal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4EAE5] text-[#75817A] uppercase text-[10px] tracking-wider bg-gray-50/50">
                  <th className="py-3 px-4 font-bold">Deal Reference</th>
                  <th className="py-3 px-4 font-bold">Title & Description</th>
                  <th className="py-3 px-4 font-bold">Counterparties</th>
                  <th className="py-3 px-4 font-bold">Amount (KES)</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4EAE5]">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-[#103D32]">
                      <Link to={`/transactions/${tx.reference}`} className="hover:underline">
                        {tx.reference}
                      </Link>
                      <span className="block text-[10px] text-gray-400 font-sans font-normal">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <Link
                        to={`/transactions/${tx.reference}`}
                        className="font-bold text-[#17231F] hover:text-[#103D32] truncate block"
                      >
                        {tx.title}
                      </Link>
                      <p className="text-[11px] text-[#75817A] truncate mt-0.5">{tx.description}</p>
                    </td>

                    <td className="py-4 px-4 text-[11px]">
                      <div>
                        <span className="text-gray-400">Buyer:</span>{' '}
                        <span className="font-semibold text-[#17231F]">{tx.buyer?.full_name}</span>
                      </div>
                      <div className="mt-0.5">
                        <span className="text-gray-400">Seller:</span>{' '}
                        <span className="font-semibold text-[#17231F]">{tx.seller?.full_name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-extrabold text-[#17231F]">
                      KES {tx.total_amount.toLocaleString()}
                      <span className="block text-[10px] text-gray-400 font-normal">
                        Item: {tx.amount.toLocaleString()} + Fee: {tx.platform_fee.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <Badge status={tx.status} />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Link to={`/transactions/${tx.reference}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  );
};

export default TransactionsListPage;
