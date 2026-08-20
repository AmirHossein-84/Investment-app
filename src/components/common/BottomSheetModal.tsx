import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface BottomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'max-w-lg',
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef(0);
  const currentTranslateYRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      triggerHaptic('light');
      onClose();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartYRef.current;
    if (diff > 0 && sheetRef.current) {
      // Dragging downward
      currentTranslateYRef.current = diff;
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (currentTranslateYRef.current > 120) {
      triggerHaptic('medium');
      onClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0px)';
    }
    currentTranslateYRef.current = 0;
  };

  const modalContent = (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidth} bg-slate-950 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] max-h-[88dvh] flex flex-col transition-transform duration-200 ease-out`}
      >
        {/* Mobile Drag Handle */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full flex flex-col items-center pt-3 pb-1 cursor-grab active:cursor-grabbing sm:hidden shrink-0"
        >
          <div className="w-12 h-1.5 rounded-full bg-slate-700/80" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div className="w-8 h-8 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-100 truncate">{title}</h3>
              {subtitle && (
                <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all touch-target"
            title="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto overscroll-contain flex-1 space-y-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
