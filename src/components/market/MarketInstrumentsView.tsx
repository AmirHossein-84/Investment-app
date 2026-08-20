import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  RefreshCw,
  Edit3,
  Scale,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import { useMarketData, CombinedMarketItem } from '../../hooks/useMarketData';
import { PortfolioDonutChart, DonutChartItem } from '../common/PortfolioDonutChart';
import { PullToRefreshContainer } from '../common/PullToRefreshContainer';
import { CardSkeleton } from '../common/SkeletonLoader';
import { formatToman, formatPercent, toPersianDigits, getPersianFormattedDate } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';
import { AddMarketInstrumentModal } from './AddMarketInstrumentModal';
import { EditMarketHoldingModal } from './EditMarketHoldingModal';

export const MarketInstrumentsView: React.FC = () => {
  const {
    combinedItems,
    marketStatus,
    isLoading,
    isRefreshing,
    lastRefreshedAt,
    totalMarketValueTomans,
    totalMarketCostTomans,
    addInstrumentAndHolding,
    updateHolding,
    removeHolding,
    refreshQuotes,
  } = useMarketData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CombinedMarketItem | null>(null);

  const handleManualRefresh = async () => {
    triggerHaptic('light');
    await refreshQuotes(true);
  };

  const totalProfitTomans = totalMarketCostTomans > 0 ? totalMarketValueTomans - totalMarketCostTomans : undefined;
  const totalProfitPct = totalMarketCostTomans > 0 ? (totalProfitTomans! / totalMarketCostTomans) * 100 : undefined;

  const refreshTimeStr = new Date(lastRefreshedAt).toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Donut chart items from user gold holdings
  const donutItems: DonutChartItem[] = combinedItems
    .filter((item) => (item.currentValueTomans || 0) > 0)
    .map((item, idx) => {
      const colors = ['#D4AF37', '#EAB308', '#F59E0B', '#D97706', '#B45309', '#FBBF24'];
      return {
        id: item.instrument.symbol,
        label: item.instrument.name,
        value: item.currentValueTomans || 0,
        color: colors[idx % colors.length],
        sublabel: `${item.holding ? toPersianDigits(item.holding.quantity) + ' واحد' : ''}`,
      };
    });

  return (
    <PullToRefreshContainer onRefresh={handleManualRefresh} isRefreshing={isRefreshing} className="space-y-4 pb-24">
      
      {/* 1. Header & Market Status Card */}
      <div className="glass-card p-4 sm:p-5 border border-slate-800 space-y-4">
        
        {/* Top bar: Title + Market Status Pill + Refresh button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-100">
                  بازار بورس و صندوق‌های طلا (TSETMC)
                </h2>
                <p className="text-[11px] text-slate-400">
                  قیمت‌های لحظه‌ای، ارزیابی سبد و مدیریت دارایی‌ها
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Market Session Status Badge */}
            <div
              className={`px-3 py-1.5 rounded-2xl text-[11px] font-bold border flex items-center gap-1.5 ${
                marketStatus?.isOpen
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-700/80'
              }`}
              title={marketStatus?.message}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  marketStatus?.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              <span>{marketStatus?.isOpen ? 'بازار باز است' : 'بازار بسته است'}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-gold-300 border border-slate-700/80 transition-all touch-target"
              title="به‌روزرسانی قیمت‌ها"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-gold-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Portfolio Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 font-medium block">
              ارزش کل سبد طلا
            </span>
            <div className="text-sm sm:text-base font-black text-gold-400">
              {formatToman(totalMarketValueTomans)} <span className="text-[10px] text-slate-400 font-normal">ت</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 font-medium block">
              سود / زیان کل
            </span>
            {totalProfitTomans !== undefined ? (
              <div
                className={`text-sm sm:text-base font-black flex items-center gap-1 ${
                  totalProfitTomans >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <span>{formatToman(Math.abs(totalProfitTomans))} ت</span>
                <span className="text-[10px] font-bold">
                  ({totalProfitPct !== undefined ? formatPercent(totalProfitPct) : '۰٪'})
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 font-medium block">ثبت نشده</span>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 font-medium block">
              آخرین دریافت نرخ
            </span>
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{refreshTimeStr}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. GOLD HOLDINGS DONUT CHART */}
      {donutItems.length > 0 && (
        <div className="glass-card p-5 border border-gold-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-sm">
                <Coins className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-100">
                ترکیب صندوق‌های طلا در سبد
              </h3>
            </div>
            <span className="text-xs font-black text-gold-400">
              {formatToman(totalMarketValueTomans)} تومان
            </span>
          </div>

          <PortfolioDonutChart
            items={donutItems}
            centerTitle="مجموع طلا"
            centerSubtitle={`${toPersianDigits(donutItems.length)} نماد`}
            size={200}
            strokeWidth={22}
          />
        </div>
      )}

      {/* 3. Instruments Section Header + Add Button */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h3 className="text-sm font-black text-slate-100">
            صندوق‌ها و دارایی‌های تحت نظر
          </h3>
          <p className="text-[11px] text-slate-400">
            برای ویرایش یا حذف، روی هر کارت ضربه بزنید
          </p>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-gold-500 hover:from-amber-300 hover:to-gold-400 text-slate-950 font-black text-xs transition-all interactive-tap shadow-gold-glow touch-target"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>افزودن نماد</span>
        </button>
      </div>

      {/* 4. Instruments Grid or Skeleton */}
      {isLoading && combinedItems.length === 0 ? (
        <CardSkeleton count={4} />
      ) : combinedItems.length === 0 ? (
        <div className="text-center py-10 px-4 glass-card border border-slate-800 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Coins className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-200">هنوز دارایی طلا ثبت نشده است</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            با زدن دکمه «افزودن نماد»، صندوق‌های طلای بورس (مانند عیار، طلا، کهربا) را به سبد خود بیفزایید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {combinedItems.map((item) => {
            const { instrument, holding, quote, currentValueTomans, profitTomans, profitPercent } = item;
            const priceTomans = quote?.lastPriceTomans || 0;
            const priceChangePct = quote?.priceChangePercent || 0;
            const isPositive = priceChangePct >= 0;

            return (
              <div
                key={instrument.id || instrument.providerInstrumentId || instrument.symbol}
                onClick={() => {
                  triggerHaptic('light');
                  setEditingItem(item);
                }}
                className="group relative p-4 rounded-3xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-gold-500/40 transition-all cursor-pointer shadow-lg space-y-3 interactive-tap"
              >
                {/* Card Top: Symbol + Price + Change Chip */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-100">
                        {instrument.symbol}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 font-bold">
                        صندوق طلا
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                      {instrument.name}
                    </span>
                  </div>

                  <div className="text-left shrink-0 space-y-0.5">
                    <div className="text-sm font-black text-slate-100">
                      {priceTomans > 0 ? (
                        <span>{formatToman(priceTomans)} <span className="text-[10px] text-slate-400 font-normal">ت</span></span>
                      ) : (
                        <span className="text-xs text-slate-500">در حال دریافت...</span>
                      )}
                    </div>

                    {quote && (
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
                        <span>{formatPercent(Math.abs(priceChangePct))}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Bottom: User Holdings Valuation */}
                {holding ? (
                  <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">موجودی شما:</span>
                      <span className="font-black text-slate-200">
                        {toPersianDigits(holding.quantity)} واحد
                      </span>
                    </div>

                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block">ارزش فعلی:</span>
                      <span className="font-black text-gold-400">
                        {formatToman(currentValueTomans || 0)} ت
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 pt-1">
                    بدون ثبت موجودی (فقط پایش قیمت)
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Add Instrument Modal */}
      <AddMarketInstrumentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(inst, qty, avgPrice) => {
          addInstrumentAndHolding(inst, qty, avgPrice);
        }}
      />

      {/* Edit Holding Modal */}
      <EditMarketHoldingModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={(holdingId, qty, avgPrice) => {
          updateHolding(holdingId, qty, avgPrice);
        }}
        onDelete={(holdingId) => {
          removeHolding(holdingId);
        }}
      />

    </PullToRefreshContainer>
  );
};
