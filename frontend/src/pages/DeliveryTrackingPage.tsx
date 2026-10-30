import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Phone, KeyRound, CheckCircle2, Clock, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CodeVerificationModal from '../components/delivery/CodeVerificationModal';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Transaction } from '../types';
import api from '../services/api';

export const DeliveryTrackingPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const { showToast } = useNotifications();

  const [deliveries, setDeliveries] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [codeModalTx, setCodeModalTx] = useState<{ tx: Transaction; type: 'pickup' | 'handover' } | null>(null);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ deliveries: Transaction[] }>('/delivery/assigned');
      setDeliveries(res.deliveries);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch deliveries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#17231F]">Courier Delivery & Logistics Hub</h1>
          <p className="text-xs text-[#75817A] mt-1">
            Dual-code pickup and handover verification. Prevents delivery disputes and secures custody handoffs.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchDeliveries}>
          Refresh Routes
        </Button>
      </div>

      {/* Security Architecture Info Banner */}
      <div className="bg-[#103D32] text-white p-5 rounded-2xl border border-[#144C3F] space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#B7F36B]" />
          <h3 className="font-bold text-sm text-white">Cryptographic Dual-Code Security Protocol</h3>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed max-w-3xl">
          (1) <strong>Pickup Code:</strong> Given only by the authorized seller to courier upon collection.<br />
          (2) <strong>Handover Code:</strong> Given only by the buyer upon physical receipt at drop-off.<br />
          <span className="text-[#B7F36B] font-semibold">Important Fintech Rule:</span> Courier handover does NOT automatically release funds—it safely initiates the buyer's inspection period.
        </p>
      </div>

      {/* Deliveries List */}
      <Card
        title="Assigned Escrow Shipments"
        subtitle="Live delivery assignments requiring cryptographic PIN verification."
      >
        {loading ? (
          <div className="py-12 text-center text-xs text-[#75817A]">Loading assigned deliveries...</div>
        ) : deliveries.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Truck className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs text-[#75817A]">No active shipments currently awaiting courier action.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map(tx => {
              const assignment = tx.delivery_assignment;
              const isReadyForPickup = ['payment_held', 'order_prepared'].includes(tx.status);
              const isInTransit = tx.status === 'in_transit';

              return (
                <div
                  key={tx.id}
                  className="bg-white p-5 rounded-2xl border border-[#E4EAE5] shadow-sm hover:border-[#B7F36B] transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#103D32] flex items-center justify-center font-bold">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#17231F]">{tx.title}</h3>
                        <p className="text-[11px] font-mono text-[#75817A]">
                          Ref: <strong className="text-[#103D32]">{tx.reference}</strong> • Escrow Value: KES {tx.total_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge status={tx.status} />
                    </div>
                  </div>

                  {/* Route Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    {/* Pickup Address */}
                    <div className="bg-[#F5F7F4] p-3.5 rounded-xl border border-[#E4EAE5] space-y-1.5">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="text-[10px] uppercase font-bold">1. Pickup Address (Seller)</span>
                        <MapPin className="w-3.5 h-3.5 text-[#103D32]" />
                      </div>
                      <p className="font-bold text-[#17231F]">{assignment?.pickup_address || 'Seller Warehouse'}</p>
                      <p className="text-[11px] text-[#75817A]">
                        Seller: {tx.seller?.full_name} • Phone: {tx.seller?.phone_number}
                      </p>
                    </div>

                    {/* Dropoff Address */}
                    <div className="bg-[#F5F7F4] p-3.5 rounded-xl border border-[#E4EAE5] space-y-1.5">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="text-[10px] uppercase font-bold">2. Drop-off Destination (Buyer)</span>
                        <MapPin className="w-3.5 h-3.5 text-[#218653]" />
                      </div>
                      <p className="font-bold text-[#17231F]">{assignment?.dropoff_address || 'Buyer Address'}</p>
                      <p className="text-[11px] text-[#75817A]">
                        Recipient: {assignment?.recipient_name || tx.buyer?.full_name} • Phone: {assignment?.recipient_phone || tx.buyer?.phone_number}
                      </p>
                    </div>

                  </div>

                  {/* Verification Action Bar */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] text-gray-500">
                      {isReadyForPickup && 'Awaiting courier to arrive at seller pickup location.'}
                      {isInTransit && 'Courier collected parcel. En route to buyer drop-off.'}
                      {tx.status === 'in_inspection' && 'Package delivered! Buyer is in active inspection window.'}
                    </div>

                    <div className="flex items-center gap-2">
                      {isReadyForPickup && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setCodeModalTx({ tx, type: 'pickup' })}
                          icon={<KeyRound className="w-3.5 h-3.5" />}
                        >
                          Verify Pickup PIN
                        </Button>
                      )}

                      {isInTransit && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setCodeModalTx({ tx, type: 'handover' })}
                          icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#B7F36B]" />}
                        >
                          Verify Handover PIN
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`tel:${assignment?.recipient_phone || tx.buyer?.phone_number}`)}
                        icon={<Phone className="w-3.5 h-3.5" />}
                      >
                        Call Contact
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal */}
      {codeModalTx && (
        <CodeVerificationModal
          isOpen={true}
          onClose={() => setCodeModalTx(null)}
          transactionRef={codeModalTx.tx.reference}
          codeType={codeModalTx.type}
          onSuccess={fetchDeliveries}
        />
      )}

    </div>
  );
};

export default DeliveryTrackingPage;
