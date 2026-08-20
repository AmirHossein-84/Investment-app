import React, { useState } from 'react';
import {
  TrendingUp,
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  ChevronLeft,
} from 'lucide-react';
import {
  CryptoAsset,
  CalculationResult,
  AppSettings,
  CalculatedCryptoBuy,
} from '../../types/investment';
import { PortfolioDonutChart, DonutChartItem } from '../common/PortfolioDonutChart';
import { PullToRefreshContainer } from '../common/PullToRefreshContainer';
import { CapitalInputCard } from './CapitalInputCard';
import { GoldBuyCard } from '../calculation/GoldBuyCard';
import { formatToman, formatPercent, toPersianDigits } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';

interface DashboardViewProps {
  totalInputAmount: number;
  setTotalInputAmount: (val: number) => void;
  calculationResult: CalculationResult;
  cryptoAssets: CryptoAsset[];
  goldHoldingValue: number;
  totalCryptoValue: number;
  totalPortfolioValue: number;
  tomanCashBalance: number;
  activeGoldFund: string;
  setActiveGoldFund: (fund: string) => void;
  goldEtfUnitPrice: number;
  goldEtfUnitChange: number;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  isRefreshing: boolean;
  onRefreshAll: () => Promise<void>;
  onApplyPurchases: () => void;
  onNavigateToTab: (tab: any) => void;
  onNotify?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  totalInputAmount,
  setTotalInputAmount,
  calculationResult,
  cryptoAssets,
  goldHoldingValue,
  totalCryptoValue,
  totalPortfolioValue,
  tomanCashBalance,
  activeGoldFund,
  setActiveGoldFund,
  goldEtfUnitPrice,
  goldEtfUnitChange,
  settings,
  updateSettings,
  isRefreshing,
  onRefreshAll,
  onApplyPurchases,
  onNavigateToTab,
  onNotify,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const goldPercentActual = totalPortfolioValue > 0 ? (goldHoldingValue / totalPortfolioValue) * 100 : 0;
  const cryptoPercentActual = totalPortfolioValue > 0 ? (totalCryptoValue / totalPortfolioValue) * 100 : 0;
  const cashPercentActual = totalPortfolioValue > 0 ? (tomanCashBalance / totalPortfolioValue) * 100 : 0;

  // Donut chart items
  const chartItems: DonutChartItem[] = [
    {
      id: 'gold',
      label: 'طلا و صندوق‌های بورسی',
      value: goldHoldingValue,
      color: '#D4AF37',
      sublabel: `هدف: ${toPersianDigits(settings.goldPercent)}%`,
      targetPercent: settings.goldPercent,
    },
    {
      id: 'crypto',
      label: 'ارزهای دیجیتال',
      value: totalCryptoValue,
      color: '#6366F1',
      sublabel: `هدف: ${toPersianDigits(settings.cryptoPercent)}%`,
      targetPercent: settings.cryptoPercent,
    },
  ];

  if (tomanCashBalance > 0) {
    chartItems.push({
      id: 'cash',
      label: 'موجودی نقدی نوبیتکس',
      value: tomanCashBalance,
      color: '#10B981',
      sublabel: 'نقد ریالی',
    });
  }

  const handleCopy = (id: string, text: string, msg: string) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify?.(msg, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Check balance health
  const isGoldUnderweight = goldPercentActual < settings.goldPercent - 2;
  const isCryptoUnderweight = cryptoPercentActual < settings.cryptoPercent - 2;

  return (
    <PullToRefreshContainer onRefresh={onRefreshAll} isRefreshing={isRefreshing} className="space-y-5 pb-24">
      
      {/* 1. HERO NET WORTH CARD */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-700/80 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-lg border border-gold-500/30">
              💎
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">ارزش کل دارایی‌ها (سبد سرمایه)</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-0.5">
                {formatToman(totalPortfolioValue + tomanCashBalance)} <span className="text-xs text-slate-400 font-normal">تومان</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onRefreshAll}
            disabled={isRefreshing}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-gold-300 border border-slate-700 transition-all touch-target"
            title="به‌روزرسانی قیمت‌ها و دارایی‌ها"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-gold-400' : ''}`} />
          </button>
        </div>

        {/* Breakdown chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80">
          
          {/* Gold Chip */}
          <div
            onClick={() => onNavigateToTab('gold')}
            className="p-3 rounded-2xl bg-slate-950/80 border border-gold-500/30 hover:border-gold-500/60 transition-all cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-bold text-gold-400">
                <Coins className="w-3.5 h-3.5" />
                <span>طلا ({toPersianDigits(settings.goldPercent)}%)</span>
              </span>
              <span className="text-gold-300 font-bold">{formatPercent(goldPercentActual)}</span>
            </div>
            <div className="text-sm font-black text-slate-100">
              {formatToman(goldHoldingValue)} <span className="text-[9px] text-slate-400 font-normal">ت</span>
            </div>
          </div>

          {/* Crypto Chip */}
          <div
            onClick={() => onNavigateToTab('crypto')}
            className="p-3 rounded-2xl bg-slate-950/80 border border-indigo-500/30 hover:border-indigo-500/60 transition-all cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-bold text-indigo-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>کریپتو ({toPersianDigits(settings.cryptoPercent)}%)</span>
              </span>
              <span className="text-indigo-300 font-bold">{formatPercent(cryptoPercentActual)}</span>
            </div>
            <div className="text-sm font-black text-slate-100">
              {formatToman(totalCryptoValue)} <span className="text-[9px] text-slate-400 font-normal">ت</span>
            </div>
          </div>

          {/* Nobitex Cash Chip */}
          {tomanCashBalance > 0 && (
            <div
              onClick={() => onNavigateToTab('crypto')}
              className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer space-y-1 col-span-2 sm:col-span-1"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>نقد نوبیتکس</span>
                </span>
                <span className="text-emerald-300 font-bold">{formatPercent(cashPercentActual)}</span>
              </div>
              <div className="text-sm font-black text-slate-100">
                {formatToman(tomanCashBalance)} <span className="text-[9px] text-slate-400 font-normal">ت</span>
              </div>
            </div>
          )}

        </div>

        {/* Balance Status Banner */}
        <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">وضعیت تعادل ۸۰ به ۲۰:</span>
            {isGoldUnderweight ? (
              <span className="text-gold-400 font-bold flex items-center gap-1">
                <span>⚠️ سهم طلا کمتر از هدف است (خرید طلا در اولویت است)</span>
              </span>
            ) : isCryptoUnderweight ? (
              <span className="text-indigo-400 font-bold flex items-center gap-1">
                <span>⚠️ سهم کریپتو کمتر از هدف است (خرید کریپتو در اولویت است)</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>سبد در تعادل ایده‌آل است</span>
              </span>
            )}
          </div>
        </div>

      </div>

      {/* 2. PORTFOLIO ALLOCATION DONUT CHART */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gold-500/10 text-gold-400 flex items-center justify-center font-bold text-sm">
              📊
            </div>
            <h3 className="text-sm font-black text-slate-100">
              ترکیب و سهم دارایی‌ها
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            طلا: {toPersianDigits(settings.goldPercent)}% • کریپتو: {toPersianDigits(settings.cryptoPercent)}%
          </span>
        </div>

        <PortfolioDonutChart
          items={chartItems}
          centerTitle="مجموع دارایی"
          centerSubtitle={`${toPersianDigits(chartItems.length)} بخش`}
          size={200}
          strokeWidth={22}
        />
      </div>

      {/* 3. CAPITAL INPUT & SAVINGS ALLOCATOR */}
      <CapitalInputCard
        inputAmount={totalInputAmount}
        setInputAmount={setTotalInputAmount}
        settings={settings}
        updateSettings={updateSettings}
        totalSavingsAmount={calculationResult.totalSavingsAmount}
        goldBuyAmount={calculationResult.goldBuyAmount}
        cryptoBuyAmount={calculationResult.cryptoBuyAmount}
      />

      {/* 4. SMART BUY RECOMMENDATIONS (GOLD & CRYPTO BREAKDOWN) */}
      {calculationResult.totalSavingsAmount > 0 && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Section Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400 animate-pulse" />
              <h3 className="text-sm font-black text-slate-100">
                دستور خرید هوشمند برای پس‌انداز این ماه
              </h3>
            </div>
            <span className="text-xs font-bold text-gold-400">
              {formatToman(calculationResult.totalSavingsAmount)} ت
            </span>
          </div>

          {/* Gold Buy Action Card */}
          <GoldBuyCard
            goldBuyAmount={calculationResult.goldBuyAmount}
            goldPercent={settings.goldPercent}
          />

          {/* Crypto Buy Breakdown Cards */}
          {calculationResult.cryptoBuys.length > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                    🪙
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-100">
                      خرید رمزارزها در صرافی (نوبیتکس)
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      مبلغ تخصیص‌یافته: {formatToman(calculationResult.cryptoBuyAmount)} تومان
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToTab('crypto')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5"
                >
                  <span>مشاهده بازار</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Coin Cards */}
              <div className="space-y-2 pt-1">
                {calculationResult.cryptoBuys.map((coin) => {
                  const asset = cryptoAssets.find((a) => a.symbol.toLowerCase() === coin.symbol.toLowerCase());
                  const unitPrice = asset?.unitPrice || 0;
                  const coinQtyToBuy = unitPrice > 0 ? (coin.suggestedBuy / unitPrice).toFixed(6) : '0';

                  return (
                    <div
                      key={coin.id}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: coin.color }}
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-200 block truncate">
                            {coin.name} ({coin.symbol})
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            سهم هدف: {toPersianDigits(coin.targetPercent)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-left space-y-0.5">
                          <span className="text-xs font-black text-indigo-400 block">
                            {formatToman(coin.suggestedBuy)} تومان
                          </span>
                          {unitPrice > 0 && (
                            <span className="text-[10px] text-slate-400 font-mono block dir-ltr">
                              ≈ {coinQtyToBuy} {coin.symbol}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() =>
                            handleCopy(
                              coin.id,
                              coin.suggestedBuy.toString(),
                              `مبلغ خرید ${coin.name} کپی شد!`
                            )
                          }
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-800 transition-all touch-target"
                          title="کپی مبلغ خرید"
                        >
                          {copiedId === coin.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* Apply Purchases Action Button */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-gold-500/15 via-indigo-500/15 to-gold-500/15 border border-gold-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="space-y-0.5 text-center sm:text-right">
              <span className="text-xs font-black text-slate-100 block">
                خریدها را در سبد دارایی اعمال کنم؟
              </span>
              <p className="text-[11px] text-slate-400">
                واحدهای طلای خریداری‌شده و ارزها به موجودی حساب شما افزوده می‌شوند.
              </p>
            </div>

            <button
              onClick={() => {
                triggerHaptic('success');
                onApplyPurchases();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all interactive-tap shadow-gold-glow touch-target"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>اعمال خریدها به موجودی</span>
            </button>
          </div>

        </div>
      )}

    </PullToRefreshContainer>
  );
};
