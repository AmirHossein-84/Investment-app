import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { CryptoAsset } from '../../types/investment';
import { parseNumberInput } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAsset: (asset: Omit<CryptoAsset, 'id'>) => void;
}

const PRESET_COLORS = [
  '#627EEA', '#F7931A', '#F3BA2F', '#0033AD', '#E6007A',
  '#EF0027', '#23292F', '#C2A633', '#8247E5', '#14F195',
  '#0098EA', '#F0B90B', '#2775CA', '#50AF95', '#E84142'
];

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  onAddAsset,
}) => {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [targetPercent, setTargetPercent] = useState('5');
  const [currentHoldingValue, setCurrentHoldingValue] = useState('');
  const [color, setColor] = useState('#14F195');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    triggerHaptic('success');
    onAddAsset({
      symbol: symbol.trim().toUpperCase(),
      name: name.trim() || symbol.trim().toUpperCase(),
      targetPercent: parseFloat(targetPercent) || 0,
      currentHoldingValue: parseNumberInput(currentHoldingValue),
      color,
      isDefault: false,
    });

    setSymbol('');
    setName('');
    setTargetPercent('5');
    setCurrentHoldingValue('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border-t sm:border border-slate-700 rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl text-right overflow-hidden animate-slideUp">
        
        {/* Top Drag Indicator for mobile */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-100">افزودن ارز دیجیتال جدید</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all interactive-tap touch-target"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Symbol */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              نماد ارز (Symbol) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثلاً SOL, TON, AVAX"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 uppercase dir-ltr font-black text-base"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              نام کامل ارز (اختیاری)
            </label>
            <input
              type="text"
              placeholder="مثلاً سولانا (Solana)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
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

            {/* Initial Holding Value */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                موجودی فعلی (تومان)
              </label>
              <input
                type="text"
                placeholder="مثلاً ۵۰۰,۰۰۰"
                value={currentHoldingValue}
                onChange={(e) => setCurrentHoldingValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-600 dir-ltr font-bold text-sm"
              />
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              رنگ شناسه ارز
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setColor(c);
                  }}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-125 ring-2 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black transition-all shadow-crypto-glow interactive-tap touch-target text-xs"
            >
              افزودن ارز به سبد
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all interactive-tap touch-target text-xs"
            >
              انصراف
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
