import React, { useState } from 'react';
import {
  Coins,
  RefreshCw,
  Edit3,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { PhysicalGoldItem, PhysicalGoldType } from '../../types/investment';
import { formatToman, formatPercent, toPersianDigits } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';
import { EditPhysicalGoldModal } from './EditPhysicalGoldModal';

interface PhysicalGoldSectionProps {
  items: PhysicalGoldItem[];
  totalValueTomans: number;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  onUpdateQuantity: (id: PhysicalGoldType, quantity: number) => void;
  onUpdatePrice: (id: PhysicalGoldType, priceTomans: number, isCustom: boolean) => void;
  onNotify?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const PhysicalGoldSection: React.FC<PhysicalGoldSectionProps> = ({
  items,
  totalValueTomans,
  isRefreshing,
  onRefresh,
  onUpdateQuantity,
  onUpdatePrice,
  onNotify,
}) => {
  const [selectedItem, setSelectedItem] = useState<PhysicalGoldItem | null>(null);

  const handleRefresh = async () => {
    triggerHaptic('light');
    await onRefresh();
    onNotify?.('قیمت‌های لحظه‌ای طلا و سکه به‌روزرسانی شدند', 'success');
  };

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-gold-500/40 shadow-xl space-y-4">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-gold-400 flex items-center justify-center font-bold text-lg border border-gold-500/30">
            🥇
          </div>
          <div>
            <h3 className="text-base font-black text-slate-100">
              طلای فیزیکی و مسکوکات <span className="text-xs text-gold-400 font-bold">(نرخ زنده)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              ارزش کل: <span className="text-gold-300 font-black">{formatToman(totalValueTomans)}</span> تومان (محاسبه در سهم ۸۰٪ طلا)
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-gold-300 border border-slate-700/80 transition-all touch-target"
          title="به‌روزرسانی قیمت‌های طلا و سکه"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-gold-400' : ''}`} />
        </button>
      </div>

      {/* Grid of Gold & Coin Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => {
          const hasHolding = item.quantity > 0;
          const itemTotalVal = item.quantity * item.unitPriceTomans;
          const changePct = item.priceChangePercent || 0;
          const isPositive = changePct >= 0;

          return (
            <div
              key={item.id}
              onClick={() => {
                triggerHaptic('light');
                setSelectedItem(item);
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 interactive-tap ${
                hasHolding
                  ? 'bg-slate-950/90 border-gold-500/40 hover:border-gold-500/70 shadow-lg'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Card Header: Title + Price Change */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-100 flex items-center gap-1.5">
                    <span>{item.id.startsWith('coin_') ? '🪙' : '✨'}</span>
                    <span>{item.title}</span>
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    نرخ هر {item.unit}: <span className="font-bold text-slate-200">{formatToman(item.unitPriceTomans)}</span> ت
                  </div>
                </div>

                <div className="text-left shrink-0">
                  {changePct !== 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md inline-flex items-center gap-0.5 dir-ltr ${
                        isPositive
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      <span>{formatPercent(Math.abs(changePct))}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card Bottom: Quantity & Total Value */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">موجودی:</span>
                  <span className="font-black text-slate-200">
                    {hasHolding ? `${toPersianDigits(item.quantity)} ${item.unit}` : 'صفر'}
                  </span>
                </div>

                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block">ارزش کل:</span>
                  <span className="font-black text-gold-400">
                    {formatToman(itemTotalVal)} ت
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <EditPhysicalGoldModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onSaveQuantity={onUpdateQuantity}
        onSavePrice={onUpdatePrice}
      />

    </div>
  );
};
