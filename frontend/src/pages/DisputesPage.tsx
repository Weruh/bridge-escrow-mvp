import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, CheckCircle2, Clock, FileText, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Dispute } from '../types';
import api from '../services/api';

export const DisputesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ disputes: Dispute[] }>('/disputes');
      setDisputes(res.disputes);
    } catch (err: any) {
      showToast(err.message || 'Failed to load disputes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#17231F]">Disputes & Claims Center</h1>
        <p className="text-xs text-[#75817A] mt-1">
          Impartial administrative arbitration for damaged goods, misrepresentation, or non-delivery.
        </p>
      </div>

      {/* Safety Notice */}
      <div className="bg-[#103D32] text-white p-5 rounded-2xl border border-[#144C3F] space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#B7F36B]" />
          <h3 className="font-bold text-sm text-white">Dispute Escrow Freezing Guarantee</h3>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed max-w-3xl">
          When a dispute is active, all associated escrow funds are strictly locked in the vault. Neither party can withdraw or auto-release funds until an authorized BridgeEscrow investigator evaluates evidence from buyer and seller.
        </p>
      </div>

      {/* Disputes List */}
      <Card
        title="Active & Historical Disputes"
        subtitle="Claims under review or resolved by platform administration."
      >
        {loading ? (
          <div className="py-12 text-center text-xs text-[#75817A]">Loading disputes...</div>
        ) : disputes.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-[#17231F]">Zero Active Disputes</h4>
            <p className="text-xs text-[#75817A]">All your protected transactions are in good standing.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map(disp => (
              <div
                key={disp.id}
                className="bg-white p-5 rounded-2xl border border-red-200/80 shadow-sm space-y-3 hover:border-red-400 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#17231F]">
                        Claim #{disp.id} — {disp.reason.replace('_', ' ').toUpperCase()}
                      </span>
                      <Badge
                        variant={
                          disp.status.startsWith('resolved')
                            ? 'success'
                            : disp.status === 'open'
                            ? 'error'
                            : 'warning'
                        }
                      >
                        {disp.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#75817A] mt-0.5">
                      Deal: <strong className="font-mono text-[#103D32]">{disp.transaction?.reference}</strong> ({disp.transaction?.title})
                    </p>
                  </div>

                  <Link to={`/transactions/${disp.transaction?.reference}`}>
                    <Button variant="outline" size="sm">
                      Inspect Transaction
                    </Button>
                  </Link>
                </div>

                {/* Claim details */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Claim Statement</span>
                    <p className="text-[#17231F] leading-relaxed mt-0.5">{disp.description}</p>
                  </div>

                  {disp.resolution_notes && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                      <span className="font-bold block text-[11px]">Administrator Ruling & Notes:</span>
                      <p className="mt-0.5 leading-relaxed">{disp.resolution_notes}</p>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100">
                    <span>Filed: {new Date(disp.created_at).toLocaleString()}</span>
                    <span>Initiated by: {disp.initiator_name || 'Counterparty'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
};

export default DisputesPage;
