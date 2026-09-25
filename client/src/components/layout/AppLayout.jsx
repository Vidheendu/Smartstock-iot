import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import MobileSidebar from './MobileSidebar.jsx';
import Topbar from './Topbar.jsx';

export const AppLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F8FC] text-[#102A43] flex overflow-hidden">
      {/* Desktop Sidebar (visible on lg screens and up) */}
      <div className="hidden lg:flex lg:flex-shrink-0 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#F4F8FC]">
        {/* Topbar Header */}
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
