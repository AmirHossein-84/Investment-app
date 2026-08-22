import React, { useState, useEffect } from 'react';
import { X, Trash2, TrendingUp } from 'lucide-react';
import { CryptoAsset } from '../../types/investment';
import { parseNumberInput, formatToman } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';

interface EditAssetModalProps {
  asset: CryptoAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<CryptoAsset>) => void;
  onDelete: (id: string) => void;
}

export const EditAssetModal: React.FC<EditAssetModalProps> = ({
  asset,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [targetPercent, setTargetPercent] = useState('0');
  const [currentHoldingValue, setCurrentHoldingValue] = useState('');
  const [averageBuyPrice, setAverageBuyPrice] = useState('');

  useEffect(() => {
    if (asset) {
      setName(asset.name);
      setTargetPercent(String(asset.targetPercent));
      setCurrentHoldingValue(
        asset.currentHoldingValue > 0 ? String(asset.currentHoldingValue) : ''
      );
      setAverageBuyPrice(
        asset.averageBuyPrice && asset.averageBuyPrice > 0
          ? String(asset.averageBuyPrice)
          : ''
      );
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');

    const holdingVal = parseNumberInput(currentHoldingValue);
    const avgBuy = parseNumberInput(averageBuyPrice);
    const coinAmount = asset.currentAmount || (asset.unitPrice && asset.unitPrice > 0 ? holdingVal / asset.unitPrice : 0);
    const totalCost = avgBuy > 0 && coinAmount > 0 ? Math.round(coinAmount * avgBuy) : (avgBuy > 0 ? avgBuy : undefined);
    const profitTomans = totalCost !== undefined && totalCost > 0 ? holdingVal - totalCost : undefined;
    const profitPercent = totalCost !== undefined && totalCost > 0 ? ((holdingVal - totalCost) / totalCost) * 100 : undefined;

    onSave(asset.id, {
      name: name.trim() || asset.symbol,
      targetPercent: parseFloat(targetPercent) || 0,
      currentHoldingValue: holdingVal,
      averageBuyPrice: avgBuy > 0 ? avgBuy : undefined,
      totalCostTomans: totalCost,
      profitTomans,
      profitPercent,
    });
    onClose();
  };

  const handleDelete = () => {
    triggerHaptic('heavy');
    if (confirm(`آیا از حذف ارز ${asset.symbol} از سبد اطمینان دارید؟`)) {
      onDelete(asset.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border-t sm:border border-slate-700 rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl text-right overflow-hidden animate-slideUp">
        
        {/* Top Drag Indicator for mobile */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: asset.color }}
            />
            <h3 className="text-base font-black text-slate-100">
              ویرایش ارز {asset.symbol}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all interactive-tap touch-target"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Name */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              نام نمایشی
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Target Percentage */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                درصد هدف از سبد (٪)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={targetPercent}
                onChange={(e) => setTargetPercent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-slate-100 dir-ltr font-black text-sm"
              />
            </div>

            {/* Holding Value in Tomans */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                موجودی فعلی (تومان)
              </label>
              <input
                type="text"
                placeholder="مبلغ به تومان"
                value={currentHoldingValue}
                onChange={(e) => setCurrentHoldingValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-slate-100 dir-ltr font-bold text-sm"
              />
            </div>
          </div>

          {/* Average Purchase Price (Optional for Manual P&L) */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              میانگین قیمت خرید به تومان (اختیاری — جهت محاسبه سود/زیان)
            </label>
            <input
              type="text"
              placeholder="مثال: ۴,۲۰۰,۰۰۰,۰۰۰"
              value={averageBuyPrice}
              onChange={(e) => setAverageBuyPrice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-slate-100 dir-ltr font-bold text-sm"
            />
            {asset.unitPrice && asset.unitPrice > 0 && (
              <span className="text-[10px] text-slate-400 block mt-1">
                نرخ فعلی بازار: {formatToman(asset.unitPrice)} تومان
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDelete}
              className="p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all interactive-tap touch-target"
              title="حذف ارز"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="flex gap-2 flex-1 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all interactive-tap touch-target text-xs"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black transition-all interactive-tap touch-target text-xs shadow-crypto-glow"
              >
                ذخیره تغییرات
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
