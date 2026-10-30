import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#092B24] text-white border-t border-[#103D32] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#144C3F]">
          
          {/* Col 1: Logo & Summary */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#103D32] flex items-center justify-center text-[#B7F36B]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Bridge<span className="text-[#B7F36B]">Escrow</span>
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Kenya’s trusted fintech escrow infrastructure. Protecting online peer-to-peer commerce, freelance contracts, vehicle sales, and electronics delivery with Safaricom Daraja M-Pesa.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#103D32] border border-[#144C3F] text-[11px] font-medium text-[#B7F36B]">
                <span className="w-2 h-2 rounded-full bg-[#B7F36B] animate-pulse"></span>
                Official Daraja M-Pesa Integration
              </span>
            </div>
          </div>

          {/* Col 2: Solutions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#B7F36B] mb-4">
              Protected Deals
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><Link to="/register" className="hover:text-white transition-colors">Electronics & Gadgets</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Parcel & Courier Delivery</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Vehicle & Car Parts Escrow</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Freelance & Software Milestones</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Wholesale & Merchant Orders</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Digital Goods & Services</Link></li>
            </ul>
          </div>

          {/* Col 3: Escrow & Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#B7F36B] mb-4">
              Security & Rules
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Dual-Code Delivery Verification</a></li>
              <li><a href="#protection" className="hover:text-white transition-colors">3-Day Inspection Policy</a></li>
              <li><a href="#protection" className="hover:text-white transition-colors">Dispute Resolution Protocol</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">2.5% Flat Escrow Fee Schedule</a></li>
              <li><span className="text-gray-400">CBK Escrow Holding Standards</span></li>
              <li><span className="text-gray-400">Anti-Fraud & KYC Protocols</span></li>
            </ul>
          </div>

          {/* Col 4: Contact & Kenya Office */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#B7F36B] mb-4">
              Nairobi Operations
            </h4>
            <ul className="space-y-3 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#B7F36B] shrink-0 mt-0.5" />
                <span>The Mirage Tower 2, 7th Floor, Chiromo Road, Westlands, Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#B7F36B] shrink-0" />
                <span>+254 700 000 000 / +254 20 800 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#B7F36B] shrink-0" />
                <span>support@bridgeescrow.co.ke</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© 2026 BridgeEscrow Technologies Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Escrow Custody Agreement</span>
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Dispute Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
