import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Edit3,
  ArrowRight,
} from 'lucide-react';
import { CryptoAsset, GoldHolding } from '../../types/investment';
import { formatToman, formatWeight, parseNumberInput, toPersianDigits } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';
import { AddAssetModal } from './AddAssetModal';
import { EditAssetModal } from './EditAssetModal';

interface HoldingsManagerProps {
  cryptoAssets: CryptoAsset[];
  goldHolding: GoldHolding;
  updateGoldHolding: (gold: Partial<GoldHolding>) => void;
  addCryptoAsset: (asset: Omit<CryptoAsset, 'id'>) => void;
  editCryptoAsset: (id: string, updates: Partial<CryptoAsset>) => void;
  removeCryptoAsset: (id: string) => void;
  onNavigateToCalculator: () => void;
}

export const HoldingsManager: React.FC<HoldingsManagerProps> = ({
  cryptoAssets,
  goldHolding,
  updateGoldHolding,
  addCryptoAsset,
  editCryptoAsset,
  removeCryptoAsset,
  onNavigateToCalculator,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<CryptoAsset | null>(null);

  // Gold state handlers
  const [goldInputMode, setGoldInputMode] = useState<'toman' | 'grams'>('toman');
  const [goldTomanStr, setGoldTomanStr] = useState(
    goldHolding.currentHoldingValue > 0 ? String(goldHolding.currentHoldingValue) : ''
  );
  const [goldGramsStr, setGoldGramsStr] = useState(
    goldHolding.currentGrams ? String(goldHolding.currentGrams) : ''
  );

  const handleGoldTomanChange = (val: string) => {
    setGoldTomanStr(val);
    const parsed = parseNumberInput(val);
    updateGoldHolding({ currentHoldingValue: parsed });
  };

  const handleGoldGramsChange = (val: string) => {
    setGoldGramsStr(val);
    const parsed = parseFloat(val) || 0;
    updateGoldHolding({ currentGrams: parsed });
  };

  const totalCryptoValue = cryptoAssets.reduce(
    (sum, a) => sum + (a.currentHoldingValue || 0),
    0
  );

  return (
    <div className="space-y-4">
      
      {/* Tab Header Banner */}
      <div className="glass-card p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <Wallet className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-slate-100">
              مدیریت دارایی‌های فعلی (Holdings)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            موجودی‌های قبلی خود را ثبت کنید تا محاسبات خرید دقیقاً بر اساس سبد واقعی شما تنظیم شوند.
          </p>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            onNavigateToCalculator();
          }}
          className="self-stretch sm:self-auto py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-gold-400 hover:text-gold-300 border border-gold-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all interactive-tap touch-target"
        >
          <span>مشاهده محاسبات خرید</span>
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
        </button>
      </div>

      {/* 1. GOLD SECTION */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-gold-500/40 shadow-gold-glow">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-gold-400 flex items-center justify-center font-bold text-lg">
              🥇
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">
                موجودی فعلی <span className="gold-gradient-text">طلا و آبشده</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                ارزش ثبت‌شده: {formatToman(goldHolding.currentHoldingValue || 0)} ت ({formatWeight(goldHolding.currentGrams || 0)})
              </p>
            </div>
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                triggerHaptic('light');
                setGoldInputMode('toman');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all interactive-tap ${
                goldInputMode === 'toman'
                  ? 'bg-amber-500/25 text-gold-300 border border-gold-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              به تومان
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setGoldInputMode('grams');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all interactive-tap ${
                goldInputMode === 'grams'
                  ? 'bg-amber-500/25 text-gold-300 border border-gold-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              به گرم
            </button>
          </div>
        </div>

        {/* Gold Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {goldInputMode === 'toman' ? (
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold">
                ارزش تومانی طلای موجود:
              </label>
              <input
                type="text"
                value={goldTomanStr}
                onChange={(e) => handleGoldTomanChange(e.target.value)}
                placeholder="مثلاً ۵۰,۰۰۰,۰۰۰"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-gold-400 dir-ltr font-black text-base"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold">
                وزن طلای موجود به گرم:
              </label>
              <input
                type="number"
                step="0.01"
                value={goldGramsStr}
                onChange={(e) => handleGoldGramsChange(e.target.value)}
                placeholder="مثلاً ۱۰.۵"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-gold-400 dir-ltr font-black text-base"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-bold">
              قیمت مبنای هر گرم طلای ۱۸ عیار (تومان):
            </label>
            <input
              type="text"
              value={goldHolding.pricePerGram ? new Intl.NumberFormat('en-US').format(goldHolding.pricePerGram) : ''}
              onChange={(e) => {
                const parsed = parseNumberInput(e.target.value);
                updateGoldHolding({ pricePerGram: parsed });
              }}
              placeholder="مثلاً ۵,۲۰۰,۰۰۰"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-gold-400 dir-ltr font-black text-base"
            />
          </div>
        </div>
      </div>

      {/* 2. CRYPTO SECTION */}
      <div className="glass-card p-4 sm:p-6 border border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-crypto-glow" />
              <h3 className="text-base font-black text-slate-100">
                موجودی فعلی ارزهای دیجیتال
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              مجموع ارزش کریپتو: {formatToman(totalCryptoValue)} تومان
            </p>
          </div>

          <button
            onClick={() => {
              triggerHaptic('medium');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black transition-all interactive-tap touch-target shadow-crypto-glow shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن ارز جدید</span>
          </button>
        </div>

        {/* Crypto Items Grid / List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {cryptoAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => {
                triggerHaptic('light');
                setEditingAsset(asset);
              }}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-indigo-500/50 transition-all flex items-center justify-between gap-3 interactive-tap"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: asset.color }}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-100 text-sm">{asset.symbol}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-900 border border-slate-700 text-slate-400 font-bold">
                      وزن هدف: {toPersianDigits(asset.targetPercent)}٪
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
                    {asset.name}
                  </div>
                </div>
              </div>

              {/* Balance & Edit Icon */}
              <div className="flex items-center gap-2">
                <div className="text-left">
                  <div className="text-xs font-black text-slate-200 dir-ltr">
                    {asset.currentHoldingValue > 0
                      ? `${formatToman(asset.currentHoldingValue)} ت`
                      : '۰ ت'}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900 text-slate-400">
                  <Edit3 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAsset={addCryptoAsset}
      />

      <EditAssetModal
        asset={editingAsset}
        isOpen={Boolean(editingAsset)}
        onClose={() => setEditingAsset(null)}
        onSave={editCryptoAsset}
        onDelete={removeCryptoAsset}
      />

    </div>
  );
};
