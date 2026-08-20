import React, { useState, useEffect } from 'react';
import { Trash2, Edit3, Coins } from 'lucide-react';
import { CombinedMarketItem } from '../../hooks/useMarketData';
import { parseNumberInput, formatToman } from '../../utils/formatters';
import { numberToPersianWords } from '../../utils/numberToPersianWords';
import { triggerHaptic } from '../../utils/haptics';
import { BottomSheetModal } from '../common/BottomSheetModal';

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

  if (!item) return null;

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

  const avgPriceNumber = parseNumberInput(averageBuyPrice);
  const avgPriceWords = avgPriceNumber > 0 ? numberToPersianWords(avgPriceNumber, 'تومان') : '';

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title={`ویرایش دارایی: ${item.instrument.symbol}`}
      subtitle={item.instrument.name}
      icon={<Edit3 className="w-4 h-4 text-gold-400" />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Quantity */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-300 block">
            تعداد واحد / برگه دارایی <span className="text-rose-400">*</span>
          </label>
          <input
            type="number"
            min="1"
            step="any"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm font-black text-slate-100 focus:outline-none focus:border-gold-500 dir-ltr text-right font-mono"
          />
        </div>

        {/* Average Buy Price */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-300 block">
            میانگین قیمت خرید هر واحد به تومان (اختیاری)
          </label>
          <input
            type="text"
            value={averageBuyPrice}
            onChange={(e) => setAverageBuyPrice(e.target.value)}
            placeholder="مثال: ۳۵,۰۰۰"
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-gold-500 dir-ltr text-right font-mono"
          />
          {avgPriceWords && (
            <div className="px-3 py-1 rounded-xl bg-gold-500/10 text-[10px] font-bold text-gold-300">
              {avgPriceWords}
            </div>
          )}
        </div>

        {/* Live quote snippet */}
        {item.quote && (
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">آخرین قیمت تابلو TSETMC:</span>
            <span className="font-black text-gold-400 dir-ltr">
              {formatToman(item.quote.lastPriceTomans)} تومان
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleDelete}
            className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all interactive-tap touch-target"
            title="حذف دارایی"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all interactive-tap touch-target"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-gold-500 to-yellow-500 text-slate-950 font-black text-xs interactive-tap touch-target shadow-gold-glow"
            >
              ذخیره تغییرات
            </button>
          </div>
        </div>

      </form>
    </BottomSheetModal>
  );
};
