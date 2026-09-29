import React, { useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, Info, Loader2, X } from 'lucide-react';

/**
 * Accessible confirmation dialog for destructive or high-impact actions.
 * Replaces native confirm() and alert() calls throughout the app.
 */
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  isSubmitting = false
}) => {
  const confirmButtonRef = useRef(null);

  // Close on Escape key and trap basic focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus confirmation button when opened
    setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen) return null;

  let icon = <AlertTriangle className="w-6 h-6 text-rose-600" />;
  let iconBg = 'bg-rose-50 border-rose-200';
  let confirmBtnClass = 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20';

  if (variant === 'warning') {
    icon = <AlertCircle className="w-6 h-6 text-amber-600" />;
    iconBg = 'bg-amber-50 border-amber-200';
    confirmBtnClass = 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20';
  } else if (variant === 'primary') {
    icon = <Info className="w-6 h-6 text-[#1769C2]" />;
    iconBg = 'bg-[#E8F2FF] border-[#BFDBFE]';
    confirmBtnClass = 'bg-[#1769C2] hover:bg-[#1257A0] text-white shadow-blue-500/20';
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B1F3A]/60 backdrop-blur-xs transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white border border-[#D9E2EC] rounded-3xl p-6 sm:p-7 shadow-2xl z-10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border shrink-0 ${iconBg}`}>
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            <h2 id="confirm-dialog-title" className="text-base sm:text-lg font-bold text-[#0F172A]">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] bg-slate-100 hover:bg-slate-200 border border-[#D9E2EC] rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer shadow-md disabled:opacity-50 ${confirmBtnClass}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
