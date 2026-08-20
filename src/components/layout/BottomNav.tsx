import React from 'react';
import { Calculator, Wallet, Sliders, History } from 'lucide-react';
import { ActiveTab } from '../../types/investment';
import { triggerHaptic } from '../../utils/haptics';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'calculator', label: 'محاسبه خرید', icon: Calculator },
    { id: 'holdings', label: 'دارایی‌ها', icon: Wallet },
    { id: 'settings', label: 'درصدها و تنظیمات', icon: Sliders },
    { id: 'history', label: 'سوابق', icon: History },
  ];

  const handleTabClick = (id: ActiveTab) => {
    triggerHaptic('light');
    setActiveTab(id);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
      <nav className="max-w-md mx-auto bg-slate-950/90 dark:bg-slate-950/95 light:bg-white/95 backdrop-blur-3xl border border-slate-800/90 dark:border-slate-800/90 light:border-slate-300 rounded-3xl shadow-2xl p-1.5 flex items-center justify-around pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 py-2 px-1 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all interactive-tap touch-target ${
                isActive
                  ? 'bg-gradient-to-b from-amber-500/25 to-gold-500/10 text-gold-300 font-bold border border-gold-500/40 shadow-gold-glow'
                  : 'text-slate-400 hover:text-slate-200 dark:hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-gold-400' : ''}`} />
              <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
