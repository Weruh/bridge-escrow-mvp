import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Menu, X, Shield, Lock } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E4EAE5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#103D32] flex items-center justify-center text-[#B7F36B] shadow-sm group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#103D32]">
                Bridge<span className="text-[#218653]">Escrow</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-[#75817A] -mt-1">
                Kenya
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-[#75817A] hover:text-[#103D32] transition-colors">
              How Escrow Works
            </a>
            <a href="#categories" className="text-sm font-medium text-[#75817A] hover:text-[#103D32] transition-colors">
              Deal Categories
            </a>
            <a href="#protection" className="text-sm font-medium text-[#75817A] hover:text-[#103D32] transition-colors">
              Buyer & Seller Protection
            </a>
            <a href="#pricing" className="text-sm font-medium text-[#75817A] hover:text-[#103D32] transition-colors">
              Pricing & Fees
            </a>
            <a href="#faq" className="text-sm font-medium text-[#75817A] hover:text-[#103D32] transition-colors">
              FAQ
            </a>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="md">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="md">
                    Create Protected Deal
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E4EAE5] bg-white px-4 pt-2 pb-6 space-y-3">
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            How Escrow Works
          </a>
          <a
            href="#categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            Deal Categories
          </a>
          <a
            href="#protection"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            Buyer & Seller Protection
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            Pricing & Fees
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            FAQ
          </a>
          <div className="pt-4 flex flex-col gap-2">
            {user ? (
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Create Protected Deal
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
