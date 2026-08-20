import React, { useState, useEffect } from 'react';
import { X, Trash2, Edit3 } from 'lucide-react';
import { CombinedMarketItem } from '../../hooks/useMarketData';
import { parseNumberInput, formatToman } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';

interface EditMarketHoldingModalProps {
  item: CombinedMarketItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (holdingId: string, quantity: number, averageBuyPriceTomans?: number) => void;
  onDelete: (holdingId: string) => void;
}

export const EditMarketHoldingModal: React.FC<EditMarketHoldingModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [quantity, setQuantity] = useState('');
  const [averageBuyPrice, setAverageBuyPrice] = useState('');

  useEffect(() => {
    if (item) {
      setQuantity(String(item.holding.quantity));
      setAverageBuyPrice(
        item.holding.averageBuyPriceTomans
          ? String(item.holding.averageBuyPriceTomans)
          : ''
      );
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedQty = parseFloat(quantity) || 0;
    if (parsedQty <= 0) return;

    const parsedPrice = parseNumberInput(averageBuyPrice);

    triggerHaptic('success');
    onSave(item.holding.id, parsedQty, parsedPrice > 0 ? parsedPrice : undefined);
    onClose();
  };

  const handleDelete = () => {
    triggerHaptic('heavy');
    if (confirm(`آیا از حذف دارایی ${item.instrument.symbol} از سبد خود اطمینان دارید؟`)) {
      onDelete(item.holding.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border-t sm:border border-slate-700 rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-right overflow-hidden animate-slideUp">
        
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-gold-400 border border-gold-500/30 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">
                ویرایش دارایی {item.instrument.symbol}
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {item.instrument.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all interactive-tap touch-target"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Quantity */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              تعداد واحد / برگه دارایی <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="any"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-slate-100 font-black text-base dir-ltr focus:outline-none focus:border-gold-400"
            />
          </div>

          {/* Average Buy Price */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              میانگین قیمت خرید هر واحد (تومان)
            </label>
            <input
              type="text"
              value={averageBuyPrice}
              onChange={(e) => setAverageBuyPrice(e.target.value)}
              placeholder="مثلاً: ۳۵,۰۰۰"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-slate-100 font-bold text-sm dir-ltr focus:outline-none focus:border-gold-400"
            />
          </div>

          {/* Current quote preview */}
          {item.quote && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 flex justify-between items-center text-xs">
              <span>آخرین قیمت تابلو TSETMC:</span>
              <span className="font-black text-gold-400 dir-ltr">
                {formatToman(item.quote.lastPriceTomans)} تومان ({new Intl.NumberFormat('en-US').format(item.quote.lastPriceRials)} ریال)
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDelete}
              className="p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all interactive-tap touch-target"
              title="حذف دارایی"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="flex gap-2 flex-1 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs interactive-tap touch-target"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-gold-500 to-yellow-500 text-slate-950 font-black text-xs interactive-tap touch-target shadow-md"
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
