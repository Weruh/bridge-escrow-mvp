import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Truck,
  Car,
  Briefcase,
  FileCode,
  Package,
  Layers,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import MpesaModal from '../components/payments/MpesaModal';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { DealCategory, DeliveryType } from '../types';
import api from '../services/api';

export const CreateTransactionPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const creatingAsSeller = activeRole === 'seller';
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTx, setCreatedTx] = useState<any | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Deal Type
    category: 'goods_electronics' as DealCategory,
    // Step 2: Deal Details
    title: '',
    description: '',
    seller: '',
    buyer: '',
    amount: 50000,
    delivery_fee: 500,
    expected_days: 3,
    // Step 3: Terms
    inspection_period_days: 3,
    acceptance_conditions: 'Inspection confirms goods match listing description, functionality, and serial numbers.',
    refund_conditions: '100% full refund if items arrive defective, non-delivered, or substantively misrepresented.',
    release_requirements: 'Buyer digital acceptance after inspection.',
    // Step 4: Delivery
    delivery_type: 'courier' as DeliveryType,
    pickup_address: '',
    dropoff_address: '',
    recipient_name: '',
    recipient_phone: '',
  });

  const categories = [
    { id: 'goods_electronics', name: 'Goods & Electronics', icon: Smartphone, desc: 'Smartphones, laptops, cameras' },
    { id: 'parcels', name: 'Parcels & Freight', icon: Truck, desc: 'Courier packages & nationwide logistics' },
    { id: 'vehicles', name: 'Vehicles & Auto Parts', icon: Car, desc: 'Car sales, engines & mechanical parts' },
    { id: 'freelance_services', name: 'Freelance & Services', icon: Briefcase, desc: 'Web design, development, marketing' },
    { id: 'digital_products', name: 'Digital Products', icon: FileCode, desc: 'Software, domains, digital downloads' },
    { id: 'wholesale_orders', name: 'Wholesale & B2B', icon: Package, desc: 'Bulk merchant shipments & trade' },
    { id: 'milestone_work', name: 'Milestone Projects', icon: Layers, desc: 'Multi-stage contractor agreements' },
  ];

  const deliveryMethods = [
    { id: 'courier', name: 'Courier Delivery (Dual PIN)', desc: 'Courier enters seller pickup code & buyer handover code' },
    { id: 'in_person', name: 'In-Person Handover', desc: 'Face-to-face inspection with digital code confirmation' },
    { id: 'collection_point', name: 'Collection Point / Locker', desc: 'Secure pickup locker verification' },
    { id: 'digital_service', name: 'Digital / No Physical Delivery', desc: 'Direct online service delivery with inspection review' },
  ];

  // Fee calculation
  const platformFee = Math.max(50, Math.round(formData.amount * 0.025));
  const deliveryFee = formData.delivery_type === 'digital_service' ? 0 : Number(formData.delivery_fee);
  const totalPayable = Number(formData.amount) + platformFee + deliveryFee;

  // Validation
  const validateStep = (step: number) => {
    setError(null);
    if (step === 2) {
      if (!formData.title.trim()) {
        setError('Please enter a clear deal title.');
        return false;
      }
      if (!formData.description.trim()) {
        setError('Please provide a brief item or service description.');
        return false;
      }
      if (!(creatingAsSeller ? formData.buyer : formData.seller).trim()) {
        setError(`Please enter the ${creatingAsSeller ? 'buyer' : 'seller'} email or phone.`);
        return false;
      }
      if (Number(formData.amount) <= 0) {
        setError('Amount in KES must be greater than zero.');
        return false;
      }
    }
    if (step === 3) {
      if (formData.inspection_period_days < 1 || formData.inspection_period_days > 14) {
        setError('Inspection period must be between 1 and 14 days.');
        return false;
      }
    }
    if (step === 4) {
      if (formData.delivery_type !== 'digital_service') {
        if (!formData.pickup_address.trim() || !formData.dropoff_address.trim()) {
          setError('Pickup and drop-off addresses are required for physical delivery.');
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(6, prev + 1));
    }
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmitDeal = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post<{ transaction: any; message: string }>('/transactions', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        amount: Number(formData.amount),
        delivery_fee: deliveryFee,
        delivery_type: formData.delivery_type,
        creator_role: creatingAsSeller ? 'seller' : 'buyer',
        seller: formData.seller,
        buyer: formData.buyer,
        inspection_period_days: formData.inspection_period_days,
        acceptance_conditions: formData.acceptance_conditions,
        refund_conditions: formData.refund_conditions,
        release_requirements: formData.release_requirements,
        pickup_address: formData.pickup_address,
        dropoff_address: formData.dropoff_address,
        recipient_name: formData.recipient_name,
        recipient_phone: formData.recipient_phone,
      });

      setCreatedTx(res.transaction);
      showToast('Deal created successfully in Escrow!', 'success');
      setCurrentStep(6);
    } catch (err: any) {
      setError(err.message || 'Failed to submit deal.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepsHeader = [
    { num: 1, title: 'Category' },
    { num: 2, title: 'Deal Details' },
    { num: 3, title: 'Terms' },
    { num: 4, title: 'Delivery' },
    { num: 5, title: 'Review' },
    { num: 6, title: 'Invitation Sent' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Wizard Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231F]">
          Create a Protected Deal
        </h1>
        <p className="text-xs text-[#75817A]">
          Invite a specific {creatingAsSeller ? 'buyer' : 'seller'} to review this deal before payment.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E4EAE5] shadow-sm">
        <div className="grid grid-cols-6 gap-2">
          {stepsHeader.map(s => {
            const isCompleted = s.num < currentStep;
            const isCurrent = s.num === currentStep;
            return (
              <div key={s.num} className="text-center">
                <div
                  className={`h-1.5 rounded-full transition-all mb-2 ${
                    isCompleted
                      ? 'bg-[#103D32]'
                      : isCurrent
                      ? 'bg-[#B7F36B]'
                      : 'bg-[#E4EAE5]'
                  }`}
                />
                <span
                  className={`text-[10px] font-bold block truncate ${
                    isCurrent ? 'text-[#103D32]' : isCompleted ? 'text-[#17231F]' : 'text-gray-400'
                  }`}
                >
                  {s.num}. {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: DEAL CATEGORY */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <Card title="Step 1 — Choose Deal Type" subtitle="Select the category that best matches your trade.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-2">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isSelected = formData.category === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setFormData({ ...formData, category: cat.id as DealCategory })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-[#103D32] bg-[#EBFDD6]/30 ring-2 ring-[#B7F36B]'
                      : 'border-[#E4EAE5] hover:border-gray-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#103D32] text-[#B7F36B]' : 'bg-gray-100 text-[#103D32]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#17231F]">{cat.name}</h4>
                    <p className="text-[11px] text-[#75817A] mt-0.5">{cat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 flex justify-end">
            <Button variant="primary" size="md" onClick={handleNext}>
              Continue to Details
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: DEAL DETAILS */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <Card title="Step 2 — Deal Details & Pricing" subtitle="Specify title, counterparty, and amount in Kenyan Shillings.">
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-[#17231F] mb-1">Deal Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Sony A7 IV Camera Body + 28-70mm Lens"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E4EAE5] text-xs focus:ring-2 focus:ring-[#B7F36B] focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231F] mb-1">Item or Contract Description *</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Include serial numbers, cosmetic condition, accessories included, or deliverable scope..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E4EAE5] text-xs focus:ring-2 focus:ring-[#B7F36B] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#17231F] mb-1">{creatingAsSeller ? 'Buyer' : 'Seller'} email or phone *</label>
                <input
                  type="text"
                  value={creatingAsSeller ? formData.buyer : formData.seller}
                  onChange={e => setFormData({ ...formData, [creatingAsSeller ? 'buyer' : 'seller']: e.target.value })}
                  placeholder={creatingAsSeller ? 'buyer@example.com' : 'seller@example.com'}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4EAE5] text-xs focus:ring-2 focus:ring-[#B7F36B] focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  The other party must already have a BridgeEscrow account.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231F] mb-1">Deal Amount (KES) *</label>
                <input
                  type="number"
                  min={100}
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4EAE5] text-sm font-bold text-[#103D32] focus:ring-2 focus:ring-[#B7F36B] focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Net amount to be settled to seller upon acceptance.
                </span>
              </div>
            </div>

            <div className="bg-[#F5F7F4] p-3.5 rounded-xl border border-[#E4EAE5] flex items-center justify-between text-xs">
              <span className="text-[#75817A]">Estimated Escrow Protection Fee (2.5%):</span>
              <span className="font-bold text-[#103D32]">KES {platformFee.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between">
            <Button variant="outline" size="md" onClick={handleBack} icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="primary" size="md" onClick={handleNext}>
              Continue to Terms
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: TERMS & CONDITIONS */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <Card title="Step 3 — Agreed Terms & Inspection" subtitle="Set the inspection period and acceptance conditions.">
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-[#17231F] mb-1">
                Inspection Window (Days) *
              </label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 5, 7].map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setFormData({ ...formData, inspection_period_days: days })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.inspection_period_days === days
                        ? 'bg-[#103D32] text-[#B7F36B] border-[#103D32]'
                        : 'bg-white text-[#17231F] border-[#E4EAE5] hover:bg-gray-50'
                    }`}
                  >
                    {days} {days === 1 ? 'Day' : 'Days'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Buyer has this duration to inspect and test after receiving items. Release requires explicit buyer approval.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231F] mb-1">Acceptance Conditions</label>
              <input
                type="text"
                value={formData.acceptance_conditions}
                onChange={e => setFormData({ ...formData, acceptance_conditions: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-[#E4EAE5] text-xs focus:ring-2 focus:ring-[#B7F36B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231F] mb-1">Refund Conditions</label>
              <input
                type="text"
                value={formData.refund_conditions}
                onChange={e => setFormData({ ...formData, refund_conditions: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-[#E4EAE5] text-xs focus:ring-2 focus:ring-[#B7F36B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231F] mb-1">Release Requirements</label>
              <input
                type="text"
                value={formData.release_requirements}
                onChange={e => setFormData({ ...formData, release_requirements: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-[#E4EAE5] text-xs focus:ring-2 focus:ring-[#B7F36B] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between">
            <Button variant="outline" size="md" onClick={handleBack} icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="primary" size="md" onClick={handleNext}>
              Continue to Delivery
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: DELIVERY METHOD */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <Card title="Step 4 — Delivery Method & Verification" subtitle="Configure courier dispatch or digital delivery.">
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deliveryMethods.map(dm => {
                const isSelected = formData.delivery_type === dm.id;
                return (
                  <div
                    key={dm.id}
                    onClick={() => setFormData({ ...formData, delivery_type: dm.id as DeliveryType })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#103D32] bg-[#EBFDD6]/30 ring-2 ring-[#B7F36B]'
                        : 'border-[#E4EAE5] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <h5 className="font-bold text-xs text-[#17231F]">{dm.name}</h5>
                    <p className="text-[10px] text-[#75817A] mt-0.5">{dm.desc}</p>
                  </div>
                );
              })}
            </div>

            {formData.delivery_type !== 'digital_service' ? (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#17231F] mb-1">Pickup Address (Seller)</label>
                    <input
                      type="text"
                      value={formData.pickup_address}
                      onChange={e => setFormData({ ...formData, pickup_address: e.target.value })}
                      placeholder="Shop/Apartment, Street, City"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE5] text-xs focus:ring-2 focus:ring-[#B7F36B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17231F] mb-1">Drop-off Address (Buyer)</label>
                    <input
                      type="text"
                      value={formData.dropoff_address}
                      onChange={e => setFormData({ ...formData, dropoff_address: e.target.value })}
                      placeholder="Building, Road, Town"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE5] text-xs focus:ring-2 focus:ring-[#B7F36B] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#17231F] mb-1">Delivery Fee (KES)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.delivery_fee}
                      onChange={e => setFormData({ ...formData, delivery_fee: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE5] text-xs focus:ring-2 focus:ring-[#B7F36B] focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17231F] mb-1">Recipient Phone Number</label>
                    <input
                      type="text"
                      value={formData.recipient_phone}
                      onChange={e => setFormData({ ...formData, recipient_phone: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E4EAE5] text-xs focus:ring-2 focus:ring-[#B7F36B] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
                Digital transactions do not require courier tracking. After payment is held, the seller delivers files or service access directly, triggering the {formData.inspection_period_days}-day review window.
              </div>
            )}
          </div>

          <div className="pt-6 flex items-center justify-between">
            <Button variant="outline" size="md" onClick={handleBack} icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="primary" size="md" onClick={handleNext}>
              Review Deal Summary
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: REVIEW & SUMMARY */}
      {/* ========================================================================= */}
      {currentStep === 5 && (
        <Card title="Step 5 — Complete Deal Review" subtitle="Verify all agreed values and conditions before submitting.">
          <div className="space-y-6 py-2">
            
            {/* Overview Card */}
            <div className="bg-[#F5F7F4] p-5 rounded-2xl border border-[#E4EAE5] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-[#EBFDD6] px-2 py-0.5 rounded-full">
                    {formData.category.replace('_', ' ')}
                  </span>
                  <h3 className="text-lg font-bold text-[#17231F] mt-1">{formData.title}</h3>
                  <p className="text-xs text-[#75817A] mt-0.5">{formData.description}</p>
                </div>
                <Badge variant="lime">Draft Review</Badge>
              </div>

              <div className="pt-3 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">Seller</span>
                  <span className="font-semibold text-[#17231F] truncate block">{creatingAsSeller ? 'You' : formData.seller}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Inspection Window</span>
                  <span className="font-semibold text-[#17231F]">{formData.inspection_period_days} Days</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Delivery Mode</span>
                  <span className="font-semibold text-[#17231F] capitalize">{formData.delivery_type.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#75817A]">Financial Breakdown</h4>
              <div className="bg-white rounded-xl border border-[#E4EAE5] p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#75817A]">
                  <span>Item / Contract Price:</span>
                  <span className="font-semibold text-[#17231F]">KES {Number(formData.amount).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[#75817A]">
                  <span>BridgeEscrow Platform Fee (2.5%):</span>
                  <span className="font-semibold text-[#17231F]">KES {platformFee.toLocaleString()}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex items-center justify-between text-[#75817A]">
                    <span>Courier Delivery Fee:</span>
                    <span className="font-semibold text-[#17231F]">KES {deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-sm font-extrabold text-[#103D32]">
                  <span>Total Payable:</span>
                  <span>KES {totalPayable.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#218653] shrink-0" />
              <span>
                The other party will be notified to review and accept. The buyer can pay only after both parties agree.
              </span>
            </div>

          </div>

          <div className="pt-6 flex items-center justify-between">
            <Button variant="outline" size="md" onClick={handleBack} icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={submitting}
              onClick={handleSubmitDeal}
              icon={<ShieldCheck className="w-4 h-4" />}
            >
              Create Deal & Invite {creatingAsSeller ? 'Buyer' : 'Seller'}
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 6: DEAL CREATED & PAYMENT PROMPT */}
      {/* ========================================================================= */}
      {currentStep === 6 && createdTx && (
        <Card title="Step 6 — Deal Invitation Sent" className="text-center py-6">
          <div className="space-y-6 max-w-md mx-auto">
            <div className="w-16 h-16 bg-[#EBFDD6] text-[#103D32] rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-[#17231F]">{createdTx.title}</h3>
              <p className="text-xs text-[#75817A]">
                Reference: <strong className="font-mono text-[#103D32]">{createdTx.reference}</strong>
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#092B24] text-white space-y-2 text-left">
              <span className="text-[10px] uppercase font-bold text-emerald-300">Buyer Deposit After Acceptance</span>
              <p className="text-3xl font-extrabold text-white">KES {createdTx.total_amount.toLocaleString()}</p>
              <p className="text-[11px] text-gray-300">
                The buyer can initiate payment after both parties have accepted the terms.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <p className="text-xs text-[#75817A]">Waiting for the other party to accept the deal terms before payment.</p>

              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => navigate(`/transactions/${createdTx.reference}`)}
              >
                Go to Transaction Details
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* M-Pesa STK Push Payment Modal */}
      {showPayModal && createdTx && (
        <MpesaModal
          isOpen={true}
          onClose={() => setShowPayModal(false)}
          transactionRef={createdTx.reference}
          amount={createdTx.total_amount}
          onPaymentSuccess={() => {
            navigate(`/transactions/${createdTx.reference}`);
          }}
        />
      )}

    </div>
  );
};

export default CreateTransactionPage;
