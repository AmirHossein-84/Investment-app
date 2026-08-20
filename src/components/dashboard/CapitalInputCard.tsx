import React, { useState } from 'react';
import { Coins, ArrowDownRight, RefreshCw, Layers, RotateCcw } from 'lucide-react';
import { AppSettings } from '../../types/investment';
import { formatToman, formatPercent, parseNumberInput, toPersianDigits } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';

interface CapitalInputCardProps {
  inputAmount: number;
  setInputAmount: (amount: number) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  totalSavingsAmount: number;
  goldBuyAmount: number;
  cryptoBuyAmount: number;
}

export const CapitalInputCard: React.FC<CapitalInputCardProps> = ({
  inputAmount,
  setInputAmount,
  settings,
  updateSettings,
  totalSavingsAmount,
  goldBuyAmount,
  cryptoBuyAmount,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(
    inputAmount > 0 ? new Intl.NumberFormat('en-US').format(inputAmount) : ''
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parseNumberInput(raw);
    setInputAmount(parsed);
    setDisplayValue(parsed > 0 ? new Intl.NumberFormat('en-US').format(parsed) : '');
  };

  const handleQuickAdd = (addAmount: number) => {
    triggerHaptic('light');
    const newVal = (inputAmount || 0) + addAmount;
    setInputAmount(newVal);
    setDisplayValue(new Intl.NumberFormat('en-US').format(newVal));
  };

  const handleSetExact = (val: number) => {
    triggerHaptic('light');
    setInputAmount(val);
    setDisplayValue(val > 0 ? new Intl.NumberFormat('en-US').format(val) : '');
  };

  const toggleCalculationMode = () => {
    triggerHaptic('medium');
    const nextMode = settings.calculationMode === 'rebalance' ? 'direct' : 'rebalance';
    updateSettings({ calculationMode: nextMode });
  };

  return (
    <div className="glass-card p-4 sm:p-6 border border-slate-800/90 relative overflow-hidden">

      {/* Card Header & Mode Switcher */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100 dark:text-slate-100">
              سرمایه یا درآمد جدید
            </h2>
            <p className="text-[11px] text-slate-400">
              محاسبه پس‌انداز {formatPercent(settings.savingsPercent)}
            </p>
          </div>
        </div>

        {/* Calculation Mode Badge / Switch */}
        <button
          onClick={toggleCalculationMode}
          className={`px-3 py-1.5 rounded-2xl text-[11px] font-bold flex items-center gap-1.5 transition-all interactive-tap touch-target border ${
            settings.calculationMode === 'rebalance'
              ? 'bg-amber-500/15 text-gold-300 border-gold-500/40'
              : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40'
          }`}
          title="تغییر حالت محاسبه"
        >
          {settings.calculationMode === 'rebalance' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-gold-400" />
              <span>توازن هوشمند سبد</span>
            </>
          ) : (
            <>
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>تقسیم مستقیم</span>
            </>
          )}
        </button>
      </div>

      {/* Main Input Field */}
      <div className="relative mb-3">
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleInputChange}
          placeholder="مثلاً ۳۰,۰۰۰,۰۰۰"
          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl px-4 py-3.5 sm:py-4 text-left dir-ltr text-xl sm:text-2xl font-black text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-gold-500/50 focus:border-gold-400 transition-all shadow-inner"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
          تومان
        </div>
      </div>

      {/* Quick Add & Preset Steppers */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <span className="text-[11px] text-slate-400 ml-1">افزودن سریع:</span>
        {[1000000, 5000000, 10000000, 20000000, 50000000].map((val) => (
          <button
            key={val}
            onClick={() => handleQuickAdd(val)}
            className="px-2.5 py-1.5 text-[11px] font-bold rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-all interactive-tap"
          >
            +{toPersianDigits(val / 1000000)} م
          </button>
        ))}
        {inputAmount > 0 && (
          <button
            onClick={() => handleSetExact(0)}
            className="px-2.5 py-1.5 text-[11px] font-bold rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all interactive-tap mr-auto flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>پاک کردن</span>
          </button>
        )}
      </div>

      {/* Calculated Savings Breakdown Cards */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-3">
        
        {/* Total Savings Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs sm:text-sm font-bold text-slate-200">
              کل پس‌انداز ({formatPercent(settings.savingsPercent)} سرمایه):
            </span>
          </div>
          <span className="text-base sm:text-lg font-black text-emerald-400 dir-ltr">
            {formatToman(totalSavingsAmount)} تومان
          </span>
        </div>

        {/* Sub-allocations: Gold vs Crypto */}
        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          
          {/* Gold Pill */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-gold-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gold-400 mb-1">
              <span className="text-[11px] font-bold">🥇 طلا ({formatPercent(settings.goldPercent)})</span>
              <ArrowDownRight className="w-3.5 h-3.5 opacity-75" />
            </div>
            <div className="text-xs sm:text-sm font-black text-gold-300 dir-ltr">
              {formatToman(goldBuyAmount)} ت
            </div>
          </div>

          {/* Crypto Pill */}
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-indigo-400 mb-1">
              <span className="text-[11px] font-bold">⚡ رمزارزها ({formatPercent(settings.cryptoPercent)})</span>
              <ArrowDownRight className="w-3.5 h-3.5 opacity-75" />
            </div>
            <div className="text-xs sm:text-sm font-black text-indigo-300 dir-ltr">
              {formatToman(cryptoBuyAmount)} ت
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
