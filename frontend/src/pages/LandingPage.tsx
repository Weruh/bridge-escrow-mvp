import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Smartphone,
  Truck,
  CheckCircle2,
  ChevronDown,
  Layers,
  Car,
  Briefcase,
  FileCode,
  Package,
  BadgeCheck,
  RefreshCcw,
  Zap,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const categories = [
    {
      title: 'Goods & Electronics',
      desc: 'Smartphones, MacBooks, gaming consoles, cameras, and audio gear.',
      icon: Smartphone,
    },
    {
      title: 'Parcels & Courier Delivery',
      desc: 'Nationwide dispatch with dual-code pickup and handover confirmation.',
      icon: Truck,
    },
    {
      title: 'Vehicles & Spare Parts',
      desc: 'Automotive purchases, OEM parts, and certified mechanic inspection windows.',
      icon: Car,
    },
    {
      title: 'Freelance & Professional Services',
      desc: 'Software development, design sprints, legal retainers, and milestone contracts.',
      icon: Briefcase,
    },
    {
      title: 'Digital Products & Software',
      desc: 'Domain transfers, source code licenses, and downloadable assets.',
      icon: FileCode,
    },
    {
      title: 'Wholesale & Merchant Orders',
      desc: 'Bulk inventory shipments, importer settlements, and merchant B2B agreements.',
      icon: Package,
    },
  ];

  const faqs = [
    {
      q: 'How does BridgeEscrow protect buyers in Kenya?',
      a: 'When you purchase through BridgeEscrow, your M-Pesa deposit is held securely in our protected Escrow Vault. The seller is only paid after the item has been delivered and you have personally inspected it during your agreed inspection period (typically 3 days). If items are damaged or misrepresented, your money is 100% safeguarded.',
    },
    {
      q: 'How does BridgeEscrow protect sellers against non-payment?',
      a: 'Sellers are guaranteed full payment before dispatching goods. BridgeEscrow verifies that 100% of the funds are locked in the escrow vault before advising you to pack or send. Once the buyer completes inspection, funds are released to your ledger instantly without chargeback risk.',
    },
    {
      q: 'What is the Dual-Code Courier Verification system?',
      a: 'BridgeEscrow generates two separate 6-digit cryptographic PINs: (1) A Pickup Code given by the seller to the courier at collection, and (2) A Handover Code given by the buyer to the courier upon physical receipt. Neither code is interchangeable, and courier handover does NOT automatically release funds—it simply starts the buyer inspection countdown.',
    },
    {
      q: 'What are the platform fees?',
      a: 'We believe in 100% transparent pricing. BridgeEscrow charges a flat 2.5% platform fee (minimum KES 50) per completed transaction. There are no hidden subscription charges or setup fees.',
    },
    {
      q: 'What happens if there is a dispute during inspection?',
      a: 'Either buyer or seller can raise a dispute with a single click before the inspection period ends. Opening a dispute strictly locks the funds in the escrow vault, preventing any automated release. A dedicated BridgeEscrow dispute investigator reviews documentation, courier tracking, and photo evidence to deliver an impartial binding ruling.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7F4] flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBFDD6] border border-[#B7F36B] text-xs font-bold text-[#103D32]">
                <ShieldCheck className="w-4 h-4 text-[#218653]" />
                <span>Kenya's Premier Digital Escrow Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#103D32] tracking-tight leading-[1.1]">
                Trade with confidence. <br />
                <span className="text-[#218653]">Every deal protected.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#75817A] max-w-xl leading-relaxed">
                Eliminate marketplace fraud across Kenya. BridgeEscrow secures buyer payments in an encrypted vault via Safaricom M-Pesa and guarantees seller settlement upon verified delivery and inspection.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/register')}
                  icon={<ShieldCheck className="w-5 h-5" />}
                >
                  Create a Protected Deal
                </Button>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    How Escrow Works
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-[#E4EAE5] grid grid-cols-3 gap-4 text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-[#103D32]">KES 0</p>
                  <p className="text-xs text-[#75817A]">Fraud Loss Guarantee</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-[#103D32]">2.5%</p>
                  <p className="text-xs text-[#75817A]">Flat Transparent Fee</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-[#103D32]">100%</p>
                  <p className="text-xs text-[#75817A]">Daraja M-Pesa Integrated</p>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Escrow Card Preview */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-3xl p-6 shadow-2xl border border-[#E4EAE5] relative overflow-hidden">
                {/* Decorative Pill Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#F0F4F1]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[11px] font-bold text-[#103D32] bg-[#EBFDD6] px-2.5 py-0.5 rounded-full">
                    VAULT LOCKED
                  </span>
                </div>

                {/* Deal Snapshot */}
                <div className="pt-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#75817A]">Active Deal</span>
                      <h4 className="text-base font-bold text-[#17231F]">Apple iPhone 15 Pro Max 256GB</h4>
                      <p className="text-xs text-[#75817A]">Between Wanjiku (Buyer) & Juma (Seller)</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-400">BE-2610-IPHONE</span>
                  </div>

                  {/* Financial summary banner */}
                  <div className="p-4 rounded-2xl bg-[#092B24] text-white flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-emerald-300 uppercase font-semibold">Protected Escrow Total</p>
                      <p className="text-2xl font-extrabold text-white">KES 190,375</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#103D32] flex items-center justify-center text-[#B7F36B]">
                      <Lock className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Dual Code Tracker Pill */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="flex items-center gap-2 text-[#17231F] font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-[#218653]" />
                        Pickup PIN Verified (Seller)
                      </span>
                      <span className="font-mono text-xs font-bold text-[#218653]">VERIFIED</span>
                    </div>

                    <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                      <span className="flex items-center gap-2 text-[#103D32] font-semibold">
                        <Truck className="w-4 h-4 text-[#103D32] animate-bounce" />
                        Handover Code in Transit
                      </span>
                      <span className="font-mono text-xs font-bold text-[#103D32]">EN ROUTE</span>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <p className="text-[11px] text-[#75817A]">
                      🔒 Funds will only be settled after buyer completes 72hr inspection.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How Escrow Works */}
      <section id="how-it-works" className="py-20 bg-white border-y border-[#E4EAE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#218653]">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#103D32]">
              How BridgeEscrow Works
            </h2>
            <p className="text-sm text-[#75817A]">
              We protect both sides of the transaction from initiation to final acceptance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#F5F7F4] border border-[#E4EAE5] space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#103D32] text-[#B7F36B] font-bold flex items-center justify-center text-sm shadow-sm">
                1
              </div>
              <h3 className="font-bold text-base text-[#103D32]">Agree on Deal Terms</h3>
              <p className="text-xs text-[#75817A] leading-relaxed">
                Buyer and seller specify item price, courier delivery method, and agreed inspection timeframe (e.g. 3 days).
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#F5F7F4] border border-[#E4EAE5] space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#103D32] text-[#B7F36B] font-bold flex items-center justify-center text-sm shadow-sm">
                2
              </div>
              <h3 className="font-bold text-base text-[#103D32]">Deposit into Escrow</h3>
              <p className="text-xs text-[#75817A] leading-relaxed">
                Buyer deposits funds securely via M-Pesa STK Push. Money is held safely in our custody vault. Seller is notified to dispatch.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#F5F7F4] border border-[#E4EAE5] space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#103D32] text-[#B7F36B] font-bold flex items-center justify-center text-sm shadow-sm">
                3
              </div>
              <h3 className="font-bold text-base text-[#103D32]">Dual-Code Delivery</h3>
              <p className="text-xs text-[#75817A] leading-relaxed">
                Seller provides pickup PIN to courier. Buyer provides separate handover PIN at doorstep drop-off to start inspection.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-[#F5F7F4] border border-[#E4EAE5] space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#B7F36B] text-[#092B24] font-bold flex items-center justify-center text-sm shadow-sm">
                4
              </div>
              <h3 className="font-bold text-base text-[#103D32]">Inspect & Release</h3>
              <p className="text-xs text-[#75817A] leading-relaxed">
                Buyer checks goods. Once approved, funds are settled into the seller's verified ledger instantly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Transaction Categories */}
      <section id="categories" className="py-20 bg-[#F5F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#218653]">Versatile Protection</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#103D32]">
              Every Deal Protected
            </h2>
            <p className="text-sm text-[#75817A]">
              From high-value electronics and motor vehicles to freelance contracts and wholesale orders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl border border-[#E4EAE5] hover:shadow-card hover:border-[#B7F36B] transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#103D32] flex items-center justify-center mb-4 group-hover:bg-[#103D32] group-hover:text-[#B7F36B] transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-[#17231F] mb-1.5">{cat.title}</h3>
                  <p className="text-xs text-[#75817A] leading-relaxed">{cat.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Buyer & Seller Protection Section */}
      <section id="protection" className="py-20 bg-[#103D32] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Buyer Protection */}
            <div className="bg-[#092B24] p-8 rounded-3xl border border-[#144C3F] space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#103D32] text-xs font-bold text-[#B7F36B]">
                <ShieldCheck className="w-4 h-4" />
                <span>Buyer Safeguards</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Never pay for items you don't receive</h3>
              <ul className="space-y-3.5 text-xs text-gray-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B7F36B] shrink-0 mt-0.5" />
                  <span><strong>100% Refund Guarantee:</strong> If the seller fails to dispatch or items arrive defective, funds are refunded to your account.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B7F36B] shrink-0 mt-0.5" />
                  <span><strong>Mandatory Inspection Period:</strong> Receive 1 to 7 days to verify serial numbers, test electronics, or review deliverables.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B7F36B] shrink-0 mt-0.5" />
                  <span><strong>Instant Dispute Lock:</strong> Raising an issue instantly freezes funds and engages our dispute arbitration team.</span>
                </li>
              </ul>
            </div>

            {/* Seller Protection */}
            <div className="bg-[#092B24] p-8 rounded-3xl border border-[#144C3F] space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#103D32] text-xs font-bold text-[#B7F36B]">
                <BadgeCheck className="w-4 h-4" />
                <span>Seller Guarantees</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Guaranteed payment before dispatch</h3>
              <ul className="space-y-3.5 text-xs text-gray-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B7F36B] shrink-0 mt-0.5" />
                  <span><strong>Zero Fake Payment SMS:</strong> No more fraudulent M-Pesa screenshot scams. We verify real bank/M-Pesa deposits in advance.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B7F36B] shrink-0 mt-0.5" />
                  <span><strong>Pickup Proof:</strong> Couriers must enter your authorized 6-digit pickup code before taking custody of merchandise.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B7F36B] shrink-0 mt-0.5" />
                  <span><strong>Automated Release:</strong> If the buyer accepts or uncontested inspection window lapses, settlement is deposited to your ledger.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white border-b border-[#E4EAE5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#218653]">Transparent Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#103D32]">
              Simple, Honest Fee Structure
            </h2>
            <p className="text-sm text-[#75817A]">
              No monthly subscriptions, no sign-up fees. Pay only when you close a deal.
            </p>
          </div>

          <div className="bg-[#F5F7F4] rounded-3xl p-8 border border-[#E4EAE5] max-w-md mx-auto space-y-6">
            <div className="space-y-1">
              <span className="text-5xl font-extrabold text-[#103D32]">2.5%</span>
              <p className="text-xs text-[#75817A]">Per completed transaction (min. KES 50)</p>
            </div>

            <ul className="text-left space-y-3 text-xs text-[#17231F] border-y border-[#E4EAE5] py-5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#218653]" />
                <span>Full Escrow Vault Custody Protection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#218653]" />
                <span>Dual-Code Courier Pickup & Handover Verification</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#218653]" />
                <span>Free Impartial Dispute Investigation & Resolution</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#218653]" />
                <span>Instant Safaricom Daraja M-Pesa STK Integration</span>
              </li>
            </ul>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/register')}
            >
              Start Free Today
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 bg-[#F5F7F4]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#218653]">Got Questions?</span>
            <h2 className="text-3xl font-extrabold text-[#103D32]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-[#E4EAE5] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#17231F] hover:bg-gray-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-[#103D32]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-[#75817A] leading-relaxed border-t border-gray-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to action banner */}
      <section className="bg-[#092B24] text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to trade without anxiety?
          </h2>
          <p className="text-sm text-gray-300 max-w-xl mx-auto">
            Join thousands of smart Kenyan buyers and sellers who never send or receive money unprotected.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}
            >
              Create Your First Deal
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
