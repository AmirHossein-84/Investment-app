import React, { useState, useRef } from 'react';
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
} from 'lucide-react';
import { useMarketData, CombinedMarketItem } from '../../hooks/useMarketData';
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

  // Pull to refresh touch state
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartYRef = useRef(0);
  const isPullingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPullingRef.current) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartYRef.current;
    if (diff > 0) {
      // Damped pull distance
      setPullDistance(Math.min(diff * 0.4, 80));
    }
  };

  const handleTouchEnd = () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;
    if (pullDistance > 50) {
      triggerHaptic('medium');
      refreshQuotes(true);
    }
    setPullDistance(0);
  };

  const handleManualRefresh = () => {
    triggerHaptic('light');
    refreshQuotes(true);
  };

  const totalProfitTomans = totalMarketCostTomans > 0 ? totalMarketValueTomans - totalMarketCostTomans : undefined;
  const totalProfitPct = totalMarketCostTomans > 0 ? (totalProfitTomans! / totalMarketCostTomans) * 100 : undefined;

  const refreshTimeStr = new Date(lastRefreshedAt).toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      className="space-y-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-To-Refresh Indicator */}
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center transition-all duration-100 overflow-hidden text-gold-400"
          style={{ height: `${pullDistance}px` }}
        >
          <div className="flex items-center gap-2 text-xs font-bold bg-slate-900/90 px-4 py-2 rounded-2xl border border-gold-500/30">
            <RefreshCw
              className={`w-4 h-4 ${pullDistance > 50 ? 'animate-spin text-gold-300' : ''}`}
            />
            <span>{pullDistance > 50 ? 'رها کنید تا به‌روزرسانی شود' : 'برای به‌روزرسانی بکشید'}</span>
          </div>
        </div>
      )}

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
                  marketStatus?.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span>{marketStatus?.isOpen ? 'بازار باز است' : 'بازار بسته است'}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing || isLoading}
              className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-gold-400 border border-slate-800 transition-all interactive-tap touch-target"
              title="به‌روزرسانی قیمت‌ها از بورس تهران"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-gold-400' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Portfolio Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Total Value */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block mb-1">
              ارزش روز دارایی‌های بورسی
            </span>
            <div className="text-lg sm:text-xl font-black text-gold-400 dir-ltr">
              {formatToman(totalMarketValueTomans)}{' '}
              <span className="text-xs font-bold text-slate-400">تومان</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5 dir-ltr">
              معادل {new Intl.NumberFormat('en-US').format(totalMarketValueTomans * 10)} ریال
            </span>
          </div>

          {/* Holdings Count */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block mb-1">
              تعداد نمادهای فعال در سبد
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-100">
              {toPersianDigits(combinedItems.length)} نماد
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              به‌روزرسانی: ساعت {refreshTimeStr}
            </span>
          </div>

          {/* Profit / Loss */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block mb-1">
              سود / زیان کل (بر اساس قیمت خرید)
            </span>
            {totalProfitTomans !== undefined ? (
              <div
                className={`text-lg sm:text-xl font-black dir-ltr flex items-center gap-1 ${
                  totalProfitTomans >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <span>
                  {totalProfitTomans >= 0 ? '+' : ''}
                  {formatToman(totalProfitTomans)} ت
                </span>
                <span className="text-xs font-bold">
                  ({totalProfitPct !== undefined ? formatPercent(totalProfitPct) : ''})
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 block mt-1 font-medium">
                قیمت خرید ثبت نشده است
              </span>
            )}
          </div>

        </div>

        {/* Add Instrument CTA */}
        <button
          onClick={() => {
            triggerHaptic('medium');
            setIsAddModalOpen(true);
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-gold-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all interactive-tap touch-target shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن نماد یا صندوق طلای جدید به سبد</span>
        </button>

      </div>

      {/* 2. Holdings List */}
      {combinedItems.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/60 text-gold-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">
            هنوز دارایی بورسی یا صندوق طلایی اضافه نکرده‌اید
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            می‌توانید هر صندوق طلای بورسی (مثل <strong className="text-gold-400">عیار</strong>، <strong className="text-gold-400">طلا</strong>، <strong className="text-gold-400">کهربا</strong>، <strong className="text-gold-400">زر</strong>) یا هر سهم و صندوق دیگری را جستجو کرده و به سبد دارایی‌های خود بیفزایید.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                triggerHaptic('light');
                setIsAddModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-gold-400 hover:text-gold-300 border border-gold-500/30 font-bold text-xs transition-all interactive-tap inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>جستجو و افزودن نماد</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {combinedItems.map((item) => {
            const quote = item.quote;
            const hasQuote = Boolean(quote && quote.lastPriceTomans > 0);
            const isUp = quote ? quote.priceChangePercent >= 0 : true;

            return (
              <div
                key={item.holding.id}
                className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg"
              >
                {/* Top: Symbol + Asset Type + Edit button */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-gold-500/30 flex items-center justify-center font-black text-sm text-gold-400">
                      {item.instrument.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-100 text-base">
                          {item.instrument.symbol}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold border border-slate-700/60">
                          {item.instrument.assetType === 'etf' ? 'صندوق طلا / ETF' : 'سهم بورسی'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[220px] sm:max-w-md">
                        {item.instrument.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block">تعداد دارایی:</span>
                      <span className="text-xs font-black text-slate-200 dir-ltr">
                        {toPersianDigits(new Intl.NumberFormat('en-US').format(item.holding.quantity))} واحد
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        setEditingItem(item);
                      }}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all interactive-tap touch-target"
                      title="ویرایش تعداد یا حذف"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Pricing & Valuation Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  
                  {/* Latest Traded Price */}
                  <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>آخرین معامله:</span>
                      {hasQuote && (
                        <span
                          className={`font-black flex items-center ${
                            isUp ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {formatPercent(quote!.priceChangePercent)}
                        </span>
                      )}
                    </div>
                    <div className="font-black text-slate-100 text-sm dir-ltr">
                      {hasQuote ? `${formatToman(quote!.lastPriceTomans)} ت` : 'در حال بارگذاری...'}
                    </div>
                    {hasQuote && (
                      <span className="text-[10px] text-slate-500 block dir-ltr mt-0.5">
                        {new Intl.NumberFormat('en-US').format(quote!.lastPriceRials)} ریال
                      </span>
                    )}
                  </div>

                  {/* Closing Price (قیمت پایانی) */}
                  <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1">
                      قیمت پایانی:
                    </span>
                    <div className="font-black text-slate-300 text-sm dir-ltr">
                      {hasQuote ? `${formatToman(quote!.closingPriceTomans)} ت` : '—'}
                    </div>
                    {hasQuote && quote?.tradeTime && (
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        زمان: {toPersianDigits(quote.tradeTime)}
                      </span>
                    )}
                  </div>

                  {/* Current Total Value */}
                  <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-amber-500/10 border border-gold-500/30">
                    <span className="text-[11px] text-gold-400 block mb-1 font-bold">
                      ارزش روز کل دارایی:
                    </span>
                    <div className="font-black text-gold-300 text-sm sm:text-base dir-ltr">
                      {formatToman(item.currentValueTomans)} تومان
                    </div>
                    {item.profitTomans !== undefined && (
                      <span
                        className={`text-[10px] font-bold block mt-0.5 dir-ltr ${
                          item.profitTomans >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        سود: {item.profitTomans >= 0 ? '+' : ''}{formatToman(item.profitTomans)} ت ({formatPercent(item.profitPercent || 0)})
                      </span>
                    )}
                  </div>

                </div>

                {/* Stale / Off-session Warning Notice if data is stale */}
                {quote?.isStale && (
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <Info className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>آخرین قیمت ذخیره‌شده (بازار بسته است یا داده‌های لحظه‌ای در دسترس نیستند).</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddMarketInstrumentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addInstrumentAndHolding}
      />

      <EditMarketHoldingModal
        item={editingItem}
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        onSave={updateHolding}
        onDelete={removeHolding}
      />
    </div>
  );
};
