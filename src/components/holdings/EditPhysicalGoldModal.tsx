import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, AlertCircle, Coins, Sparkles } from 'lucide-react';
import { PhysicalGoldItem, PhysicalGoldType } from '../../types/investment';
import { formatToman, toPersianDigits } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';

interface EditPhysicalGoldModalProps {
  item: PhysicalGoldItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveQuantity: (id: PhysicalGoldType, quantity: number) => void;
  onSavePrice: (id: PhysicalGoldType, priceTomans: number, isCustom: boolean) => void;
}

export const EditPhysicalGoldModal: React.FC<EditPhysicalGoldModalProps> = ({
  item,
  isOpen,
  onClose,
  onSaveQuantity,
  onSavePrice,
}) => {
  const [quantity, setQuantity] = useState<string>('0');
  const [priceTomans, setPriceTomans] = useState<string>('0');
  const [isCustomPrice, setIsCustomPrice] = useState<boolean>(false);

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity ? String(item.quantity) : '');
      setPriceTomans(String(item.unitPriceTomans || ''));
      setIsCustomPrice(!!item.isCustomPrice);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const numQty = parseFloat(quantity) || 0;
  const numPrice = parseFloat(priceTomans) || 0;
  const totalVal = numQty * numPrice;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    onSaveQuantity(item.id, numQty);
    onSavePrice(item.id, numPrice, isCustomPrice);
    onClose();
  };

  const handleResetToLive = () => {
    triggerHaptic('light');
    setIsCustomPrice(false);
    onSavePrice(item.id, item.unitPriceTomans, false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-md bg-slate-900 border border-gold-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-lg border border-gold-500/30">
              🥇
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">{item.title}</h3>
              <span className="text-[11px] text-slate-400">
                واحد اندازه‌گیری: <span className="text-gold-400 font-bold">{item.unit}</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Quantity / Weight Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              مقدار موجودی ({item.unit})
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={`مثلاً ${item.unit === 'گرم' ? '۱۲.۵' : '۲'}`}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-gold-500/80 focus:ring-1 focus:ring-gold-500/80 text-slate-100 text-left dir-ltr font-bold text-base outline-none transition-all placeholder:text-slate-600"
                autoFocus
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold pointer-events-none">
                {item.unit}
              </span>
            </div>
          </div>

          {/* Unit Price Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 block">
                قیمت هر {item.unit} (تومان)
              </label>
              {isCustomPrice && (
                <button
                  type="button"
                  onClick={handleResetToLive}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>بازگشت به نرخ زنده بازار</span>
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="number"
                min="0"
                value={priceTomans}
                onChange={(e) => {
                  setPriceTomans(e.target.value);
                  setIsCustomPrice(true);
                }}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-gold-500/80 focus:ring-1 focus:ring-gold-500/80 text-slate-100 text-left dir-ltr font-bold text-base outline-none transition-all placeholder:text-slate-600"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold pointer-events-none">
                تومان
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              {isCustomPrice
                ? '⚠️ قیمت به صورت دستی تغییر کرده است.'
                : '✅ قیمت به صورت خودکار از شبکه اطلاع‌رسانی طلا دریافت می‌شود.'}
            </p>
          </div>

          {/* Value Preview Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-gold-500/30 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">ارزش کل این دارایی:</span>
            <div className="text-sm font-black text-gold-400">
              {formatToman(totalVal)} <span className="text-xs text-slate-400 font-normal">تومان</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-gold-500 hover:from-amber-300 hover:to-gold-400 text-slate-950 font-black text-xs transition-all shadow-gold-glow flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>ذخیره موجودی</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
