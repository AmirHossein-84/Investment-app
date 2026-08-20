import React from 'react';
import { Sun, Moon, Shield } from 'lucide-react';
import { getPersianFormattedDate } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDark, toggleTheme }) => {
  const todayPersian = getPersianFormattedDate(new Date()).split('ساعت')[0];

  const handleToggleTheme = () => {
    triggerHaptic('medium');
    toggleTheme();
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-2xl bg-slate-950/85 dark:bg-slate-950/85 light:bg-white/90 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-gold-400 to-yellow-300 p-[2px]">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-gold-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black tracking-tight text-slate-100 dark:text-slate-100 light:text-slate-900">
                مدیریت سبد <span className="gold-gradient-text">طلا و کریپتو</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">
              {todayPersian}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={handleToggleTheme}
            className="p-2.5 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-slate-300 hover:text-gold-400 transition-all interactive-tap touch-target"
            aria-label="تغییر تم"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
