import React from 'react';
import { Wallet, Sparkles, TrendingUp } from 'lucide-react';
import { CryptoAsset, GoldHolding } from '../../types/investment';
import { formatToman, formatWeight, toPersianDigits } from '../../utils/formatters';

interface OverviewSummaryProps {
  cryptoAssets: CryptoAsset[];
  goldHolding: GoldHolding;
}

export const OverviewSummary: React.FC<OverviewSummaryProps> = ({
  cryptoAssets,
  goldHolding,
}) => {
  const currentGoldVal = goldHolding.currentHoldingValue || 0;
  const currentCryptoVal = cryptoAssets.reduce((sum, a) => sum + (a.currentHoldingValue || 0), 0);
  const totalHoldingsVal = currentGoldVal + currentCryptoVal;

  const goldPercentNum = totalHoldingsVal > 0 ? (currentGoldVal / totalHoldingsVal) * 100 : 0;
  const cryptoPercentNum = totalHoldingsVal > 0 ? (currentCryptoVal / totalHoldingsVal) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      
      {/* Total Portfolio Value Card */}
      <div className="sm:col-span-1 p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400">کل ثروت دارایی‌های فعلی</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shadow-emerald-glow">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-black text-slate-100 mb-1.5 dir-ltr">
            {formatToman(totalHoldingsVal)} <span className="text-xs font-bold text-slate-400">تومان</span>
          </div>

          {/* Mini split bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex mb-1.5">
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${goldPercentNum}%` }}
            />
            <div
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: `${cryptoPercentNum}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between font-medium">
            <span className="text-gold-400">طلا: {toPersianDigits(goldPercentNum.toFixed(1))}٪</span>
            <span className="text-indigo-400">کریپتو: {toPersianDigits(cryptoPercentNum.toFixed(1))}٪</span>
          </div>
        </div>
      </div>

      {/* Gold Summary Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/30 shadow-gold-glow relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-amber-300">موجودی فعلی طلا</span>
          <div className="p-2 rounded-xl bg-amber-500/15 text-gold-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-lg sm:text-xl font-black text-gold-400 mb-1 dir-ltr">
            {formatToman(currentGoldVal)} <span className="text-xs font-bold text-slate-400">تومان</span>
          </div>
          <div className="text-[11px] text-slate-300 font-medium">
            معادل تقریبی: {formatWeight(goldHolding.currentGrams || 0)}
          </div>
        </div>
      </div>

      {/* Crypto Summary Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-crypto-glow relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-indigo-300">موجودی فعلی رمزارزها</span>
          <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-lg sm:text-xl font-black text-indigo-400 mb-1 dir-ltr">
            {formatToman(currentCryptoVal)} <span className="text-xs font-bold text-slate-400">تومان</span>
          </div>
          <div className="text-[11px] text-slate-300 font-medium">
            شامل {toPersianDigits(cryptoAssets.length)} نوع رمزارز در سبد
          </div>
        </div>
      </div>

    </div>
  );
};
