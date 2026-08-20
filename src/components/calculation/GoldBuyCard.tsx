import React, { useState } from 'react';
import { Sparkles, Copy, Check, Scale } from 'lucide-react';
import { GoldHolding } from '../../types/investment';
import { formatToman, toPersianDigits } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';

interface GoldBuyCardProps {
  goldBuyAmount: number;
  goldHolding: GoldHolding;
  goldPercent: number;
}

export const GoldBuyCard: React.FC<GoldBuyCardProps> = ({
  goldBuyAmount,
  goldHolding,
  goldPercent,
}) => {
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedWeight, setCopiedWeight] = useState(false);

  const pricePerGram = goldHolding.pricePerGram || 5200000;
  const calculatedGrams = pricePerGram > 0 ? goldBuyAmount / pricePerGram : 0;
  const calculatedSoots = Math.round(calculatedGrams * 1000);

  const handleCopyAmount = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(String(goldBuyAmount));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleCopyWeight = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(calculatedGrams.toFixed(3));
    setCopiedWeight(true);
    setTimeout(() => setCopiedWeight(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-gold-500/40 shadow-gold-glow relative overflow-hidden">
      
      {/* Decorative Gold Ingot Background glow */}
      <div className="absolute -left-8 -bottom-8 w-40 h-40 opacity-15 pointer-events-none text-gold-400">
        <Sparkles className="w-full h-full" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-gold-500 to-yellow-600 p-[2px] shadow-gold-glow">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl">
              🥇
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-100">
                خرید پیشنهادی <span className="gold-gradient-text">طلا و آبشده</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-gold-300 border border-gold-500/30 font-bold">
                {toPersianDigits(goldPercent)}٪ سهم پس‌انداز
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              مبنا: هر گرم ۱۸ عیار = {formatToman(pricePerGram)} تومان
            </p>
          </div>
        </div>
      </div>

      {/* Main Amounts Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3.5">
        
        {/* Toman Value Box */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 mb-1">
              مبلغ خرید به تومان
            </div>
            <div className="text-xl sm:text-2xl font-black text-gold-400 dir-ltr">
              {formatToman(goldBuyAmount)}{' '}
              <span className="text-xs font-bold text-slate-400">تومان</span>
            </div>
          </div>
          <button
            onClick={handleCopyAmount}
            className={`p-3 rounded-2xl border transition-all interactive-tap touch-target ${
              copiedAmount
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-glow'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-gold-400 border-slate-700/80'
            }`}
            title="کپی مبلغ به تومان"
          >
            {copiedAmount ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Grams & Soots Box */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-gold-400" />
              <span>وزن معادل تقریبی</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-100 dir-ltr">
              {toPersianDigits(calculatedGrams.toFixed(3))}{' '}
              <span className="text-xs font-bold text-slate-400">گرم ({toPersianDigits(calculatedSoots)} سوت)</span>
            </div>
          </div>
          <button
            onClick={handleCopyWeight}
            className={`p-3 rounded-2xl border transition-all interactive-tap touch-target ${
              copiedWeight
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-glow'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-gold-400 border-slate-700/80'
            }`}
            title="کپی وزن به گرم"
          >
            {copiedWeight ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

      </div>

      {/* Tip footer */}
      <div className="text-[11px] text-slate-300 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
        <span className="leading-relaxed">
          پیشنهاد: طلای آبشده کم‌اجرت یا سکه‌های پارسیان و گرمی جهت حفظ کامل ارزش دارایی و کاهش کارمزد.
        </span>
      </div>

    </div>
  );
};
