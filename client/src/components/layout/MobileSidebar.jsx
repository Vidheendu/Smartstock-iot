import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

export const MobileSidebar = ({ isOpen, onClose }) => {
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over container */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#0B1F3A] shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        <div className="absolute top-4 right-3 z-20">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-full overflow-hidden flex flex-col">
          <Sidebar onNavClick={onClose} />
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
