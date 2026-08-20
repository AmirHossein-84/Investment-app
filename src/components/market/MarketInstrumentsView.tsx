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
} from 'lucide-react';
import { useMarketData, CombinedMarketItem } from '../../hooks/useMarketData';
import { PortfolioDonutChart, DonutChartItem } from '../common/PortfolioDonutChart';
import { PullToRefreshContainer } from '../common/PullToRefreshContainer';
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
                👑
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
            {toPersianDigits(combinedItems.length)} نماد با اطلاعات لحظه‌ای TSETMC
          </p>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            setIsAddModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-2xl bg-gold-500 hover:bg-gold-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all interactive-tap shadow-gold-glow touch-target"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن نماد جدید</span>
        </button>
      </div>

      {/* 4. Instruments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {combinedItems.map((item) => {
          const { instrument, quote, holding, currentValueTomans, profitTomans, profitPercent } = item;
          const isPositive = (quote?.priceChangePercent ?? 0) >= 0;

          return (
            <div
              key={instrument.symbol}
              className="glass-card p-4 border border-slate-800 hover:border-gold-500/40 transition-all space-y-3 relative group"
            >
              {/* Card Top: Symbol Name, Badge, Edit button */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-100">
                      {instrument.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-gold-400 font-bold border border-slate-700 font-mono">
                      {instrument.symbol}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {instrument.assetType === 'etf'
                      ? 'صندوق طلای بورس'
                      : instrument.assetType === 'commodity'
                      ? 'سکه و طلای فیزیکی'
                      : 'سهم و اوراق'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setEditingItem(item);
                    }}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-gold-300 border border-slate-800 transition-all touch-target"
                    title="ویرایش موجودی دارایی"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Price & Change Row */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">آخرین قیمت (واحد)</span>
                  <span className="text-sm font-black text-slate-100">
                    {quote?.lastPriceTomans ? `${formatToman(quote.lastPriceTomans)} ت` : 'در حال دریافت...'}
                  </span>
                </div>

                {quote?.priceChangePercent !== undefined && (
                  <div
                    className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 dir-ltr ${
                      isPositive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    <span>{formatPercent(Math.abs(quote.priceChangePercent))}</span>
                  </div>
                )}
              </div>

              {/* Holding Details (If user holds units) */}
              {holding && holding.quantity > 0 ? (
                <div className="p-2.5 rounded-2xl bg-gold-500/5 border border-gold-500/20 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">موجودی شما:</span>
                    <span className="font-bold font-mono">
                      {toPersianDigits(holding.quantity)} واحد
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-100">
                    <span className="text-slate-400">ارزش کل دارایی:</span>
                    <span className="font-black text-gold-400">
                      {formatToman(currentValueTomans || 0)} تومان
                    </span>
                  </div>

                  {profitTomans !== undefined && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-400">سود/زیان دارایی:</span>
                      <span
                        className={`text-[11px] font-bold ${
                          profitTomans >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatToman(profitTomans)} ت ({profitPercent !== undefined ? formatPercent(profitPercent) : ''})
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2.5 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>موجودی ثبت نشده است</span>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setEditingItem(item);
                    }}
                    className="text-gold-400 hover:text-gold-300 font-bold"
                  >
                    + ثبت موجودی
                  </button>
                </div>
              )}

              {/* Today range if available */}
              {quote?.maxPriceRials && quote?.minPriceRials && (
                <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 pt-1 border-t border-slate-800/60">
                  <span>کف روز: {formatToman(Math.round(quote.minPriceRials / 10))} ت</span>
                  <span>سقف روز: {formatToman(Math.round(quote.maxPriceRials / 10))} ت</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <AddMarketInstrumentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addInstrumentAndHolding}
      />

      <EditMarketHoldingModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={updateHolding}
        onDelete={removeHolding}
      />

    </PullToRefreshContainer>
  );
};
