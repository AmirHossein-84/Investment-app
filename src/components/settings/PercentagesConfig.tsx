import React from 'react';
import { Percent, Scale, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import { AppSettings, CryptoAsset } from '../../types/investment';
import { formatPercent, toPersianDigits } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';
import { NobitexIntegrationCard } from '../crypto/NobitexIntegrationCard';

interface PercentagesConfigProps {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  cryptoAssets: CryptoAsset[];
  updateCryptoAssets: (assets: CryptoAsset[]) => void;
  onNotify?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const PercentagesConfig: React.FC<PercentagesConfigProps> = ({
  settings,
  updateSettings,
  cryptoAssets,
  updateCryptoAssets,
  onNotify,
}) => {
  const totalCryptoTargetSum = cryptoAssets.reduce((sum, a) => sum + (a.targetPercent || 0), 0);
  const isCryptoSum100 = Math.abs(totalCryptoTargetSum - 100) < 0.1;

  const handleNormalizeCryptoPercents = () => {
    triggerHaptic('success');
    if (totalCryptoTargetSum <= 0) return;
    const factor = 100 / totalCryptoTargetSum;
    const updated = cryptoAssets.map((a) => ({
      ...a,
      targetPercent: Math.round(a.targetPercent * factor * 10) / 10,
    }));
    updateCryptoAssets(updated);
  };

  const handleCryptoPercentChange = (id: string, newPercent: number) => {
    const updated = cryptoAssets.map((a) =>
      a.id === id ? { ...a, targetPercent: Math.max(0, newPercent) } : a
    );
    updateCryptoAssets(updated);
  };

  const handleGoldSplitChange = (goldVal: number) => {
    const gold = Math.max(0, Math.min(100, goldVal));
    const crypto = 100 - gold;
    updateSettings({ goldPercent: gold, cryptoPercent: crypto });
  };

  return (
    <div className="space-y-4">
      
      {/* 1. TOP-LEVEL SAVINGS PERCENTAGE (30% DEFAULT) */}
      <div className="glass-card p-4 sm:p-6 border border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-100">
                درصد کل پس‌انداز از سرمایه ورودی
              </h3>
              <p className="text-[11px] text-slate-400">
                سهم کل پس‌انداز جهت سرمایه‌گذاری (پیش‌فرض: ۳۰٪)
              </p>
            </div>
          </div>
          <span className="text-xl font-black text-emerald-400">
            {formatPercent(settings.savingsPercent)}
          </span>
        </div>

        <div className="space-y-2 pt-1">
          <input
            type="range"
            min="5"
            max="100"
            step="1"
            value={settings.savingsPercent}
            onChange={(e) => updateSettings({ savingsPercent: parseInt(e.target.value) })}
            className="w-full h-3 bg-slate-950 rounded-xl appearance-none cursor-pointer accent-emerald-400 touch-target"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>۵٪ (حداقل)</span>
            <span className="text-emerald-400 font-bold">۳۰٪ (پیش‌فرض پیشنهادی)</span>
            <span>۱۰۰٪ (کل مبلغ)</span>
          </div>
        </div>
      </div>

      {/* 2. GOLD VS CRYPTO SPLIT (80% / 20% DEFAULT) */}
      <div className="glass-card p-4 sm:p-6 border border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-gold-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-100">
                نسبت تقسیم پس‌انداز بین طلا و کریپتو
              </h3>
              <p className="text-[11px] text-slate-400">
                تقسیم مبلغ پس‌انداز (پیش‌فرض: ۸۰٪ طلا و ۲۰٪ رمزارزها)
              </p>
            </div>
          </div>
        </div>

        {/* Display badges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-gold-500/30 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-bold">سهم طلا:</span>
            <span className="text-base font-black text-gold-400">
              {formatPercent(settings.goldPercent)}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-bold">سهم رمزارزها:</span>
            <span className="text-base font-black text-indigo-400">
              {formatPercent(settings.cryptoPercent)}
            </span>
          </div>
        </div>

        {/* Linked Slider */}
        <div className="space-y-2 pt-1">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={settings.goldPercent}
            onChange={(e) => handleGoldSplitChange(parseInt(e.target.value))}
            className="w-full h-3 bg-slate-950 rounded-xl appearance-none cursor-pointer accent-gold-400 touch-target"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>۰٪ طلا / ۱۰۰٪ کریپتو</span>
            <span className="text-gold-400 font-bold">۸۰٪ طلا / ۲۰٪ کریپتو</span>
            <span>۱۰۰٪ طلا / ۰٪ کریپتو</span>
          </div>
        </div>
      </div>

      {/* 3. NOBITEX API AUTO-SYNC CARD */}
      <NobitexIntegrationCard
        cryptoAssets={cryptoAssets}
        onAssetsUpdated={updateCryptoAssets}
        onNotify={onNotify}
      />

      {/* 4. CALCULATION ENGINE MODE */}
      <div className="glass-card p-4 sm:p-6 border border-slate-800 space-y-3.5">
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-100 mb-1">
            الگوریتم و نحوه محاسبه خرید
          </h3>
          <p className="text-xs text-slate-400">
            انتخاب نحوه تخصیص سرمایه جدید بر اساس سبد فعلی شما
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Rebalance Mode */}
          <div
            onClick={() => {
              triggerHaptic('medium');
              updateSettings({ calculationMode: 'rebalance' });
            }}
            className={`p-4 rounded-3xl border transition-all interactive-tap ${
              settings.calculationMode === 'rebalance'
                ? 'bg-amber-500/15 border-gold-500/50'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-gold-400" />
                <span className="font-black text-xs sm:text-sm text-slate-100">
                  توازن هوشمند سبد (پیشنهادی)
                </span>
              </div>
              {settings.calculationMode === 'rebalance' && (
                <CheckCircle2 className="w-4 h-4 text-gold-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              مانند فرمول تصویر: خریدهای جدید طوری تقسیم می‌شوند که کل سبد (دارایی قبلی + خرید جدید) به درصدهای هدف برسد.
            </p>
          </div>

          {/* Direct Mode */}
          <div
            onClick={() => {
              triggerHaptic('medium');
              updateSettings({ calculationMode: 'direct' });
            }}
            className={`p-4 rounded-3xl border transition-all interactive-tap ${
              settings.calculationMode === 'direct'
                ? 'bg-indigo-500/15 border-indigo-500/50'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span className="font-black text-xs sm:text-sm text-slate-100">
                  تقسیم مستقیم درصدی
                </span>
              </div>
              {settings.calculationMode === 'direct' && (
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              مبلغ پس‌انداز جدید مستقیماً بر اساس درصدها تقسیم می‌شود و تفاوت موجودی قبلی در تقسیم خرید جدید لحاظ نمی‌گردد.
            </p>
          </div>
        </div>
      </div>

      {/* 5. INDIVIDUAL CRYPTO WEIGHTS CONFIG */}
      <div className="glass-card p-4 sm:p-6 border border-slate-800 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-100">
              درصدهای هدف هر رمزارز
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              مجموع درصدهای ارزها باید برابر ۱۰۰٪ باشد.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1.5 rounded-2xl font-black border ${
                isCryptoSum100
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/40'
              }`}
            >
              مجموع: {toPersianDigits(totalCryptoTargetSum.toFixed(1))}٪
            </span>

            {!isCryptoSum100 && (
              <button
                onClick={handleNormalizeCryptoPercents}
                className="text-xs px-3 py-1.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-gold-300 border border-gold-500/40 font-bold transition-all interactive-tap touch-target"
                title="تنظیم خودکار درصدها برای رسیدن به ۱۰۰٪"
              >
                تراز ۱۰۰٪ خودکار
              </button>
            )}
          </div>
        </div>

        {/* Crypto items sliders list */}
        <div className="space-y-2.5">
          {cryptoAssets.map((asset) => (
            <div
              key={asset.id}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: asset.color }}
                  />
                  <span className="font-black text-slate-100 text-sm">{asset.symbol}</span>
                  <span className="text-[11px] text-slate-400">({asset.name})</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={asset.targetPercent}
                    onChange={(e) =>
                      handleCryptoPercentChange(asset.id, parseFloat(e.target.value) || 0)
                    }
                    className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-center dir-ltr text-xs font-black text-gold-400 focus:outline-none focus:border-gold-500"
                  />
                  <span className="text-slate-400 font-bold">٪</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={asset.targetPercent}
                onChange={(e) =>
                  handleCryptoPercentChange(asset.id, parseFloat(e.target.value) || 0)
                }
                className="w-full h-2.5 bg-slate-900 rounded-xl appearance-none cursor-pointer touch-target"
                style={{ accentColor: asset.color }}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
