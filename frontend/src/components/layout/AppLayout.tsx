import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#103D32] border-t-[#B7F36B] rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-[#75817A]">Securing BridgeEscrow session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#F5F7F4] overflow-hidden">
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-xs flex-1 z-10">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onOpenMobileMenu={() => setMobileSidebarOpen(true)} />
        <div role="status" className="bg-[#F0F9E8] border-b border-[#CBE4B9] px-4 py-2 text-center text-xs font-semibold text-[#103D32]">
          Demo environment — payments are simulated; wallet balances are not cash.
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default AppLayout;
