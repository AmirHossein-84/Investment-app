import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Coins,
  Sparkles,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { CryptoAsset } from '../../types/investment';
import { useNobitex } from '../../hooks/useNobitex';
import { NobitexMarketStat } from '../../services/nobitex/types';
import { nobitexService } from '../../services/nobitex';
import { PortfolioDonutChart, DonutChartItem } from '../common/PortfolioDonutChart';
import { PullToRefreshContainer } from '../common/PullToRefreshContainer';
import { NobitexIntegrationCard } from './NobitexIntegrationCard';
import { formatToman, formatPercent, toPersianDigits, getPersianFormattedDate } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';

interface CryptoMarketViewProps {
  cryptoAssets: CryptoAsset[];
  onAssetsUpdated: (assets: CryptoAsset[]) => void;
  onNotify?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const POPULAR_TICKERS = [
  { symbol: 'btc', name: 'بیت‌کوین', enName: 'Bitcoin', color: '#F7931A' },
  { symbol: 'eth', name: 'اتریوم', enName: 'Ethereum', color: '#627EEA' },
  { symbol: 'sol', name: 'سولانا', enName: 'Solana', color: '#14F195' },
  { symbol: 'ton', name: 'تون‌کوین', enName: 'Toncoin', color: '#0088CC' },
  { symbol: 'usdt', name: 'تتر', enName: 'Tether USD', color: '#26A17B' },
  { symbol: 'bnb', name: 'بایننس‌کوین', enName: 'BNB', color: '#F3BA2F' },
  { symbol: 'doge', name: 'دوج‌کوین', enName: 'Dogecoin', color: '#C2A633' },
  { symbol: 'trx', name: 'ترون', enName: 'TRON', color: '#FF0013' },
  { symbol: 'ada', name: 'کاردانو', enName: 'Cardano', color: '#0033AD' },
  { symbol: 'pol', name: 'پالیگان', enName: 'Polygon', color: '#8247E5' },
  { symbol: 'avax', name: 'آوالانچ', enName: 'Avalanche', color: '#E84142' },
  { symbol: 'sui', name: 'سویی', enName: 'Sui', color: '#2A82E4' },
  { symbol: 'near', name: 'نیر پروتکل', enName: 'NEAR Protocol', color: '#000000' },
  { symbol: 'link', name: 'چین‌لینک', enName: 'Chainlink', color: '#375BD2' },
];

export const CryptoMarketView: React.FC<CryptoMarketViewProps> = ({
  cryptoAssets,
  onAssetsUpdated,
  onNotify,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [marketStats, setMarketStats] = useState<Record<string, NobitexMarketStat>>({});
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { isConfigured, isSyncing, syncWithNobitex, tomanCashBalance } = useNobitex();

  // Fetch live market stats for popular tickers + user coins
  const fetchMarketStats = async () => {
    setIsLoadingStats(true);
    try {
      const symbols = new Set<string>();
      POPULAR_TICKERS.forEach((t) => symbols.add(t.symbol));
      cryptoAssets.forEach((a) => symbols.add(a.symbol.toLowerCase()));

      const stats = await nobitexService.getMarketStats(Array.from(symbols), 'rls');
      setMarketStats(stats);
      setLastUpdated(new Date());

      // Also update unit prices of existing crypto assets
      const updatedAssets = cryptoAssets.map((asset) => {
        const sym = asset.symbol.toLowerCase();
        const stat = stats[`${sym}-rls`];
        if (stat && stat.latest) {
          const priceTomans = Math.round(parseFloat(stat.latest) / 10);
          const holdingVal =
            asset.currentAmount !== undefined
              ? Math.round(asset.currentAmount * priceTomans)
              : asset.currentHoldingValue;

          return {
            ...asset,
            unitPrice: priceTomans,
            currentHoldingValue: holdingVal,
          };
        }
        return asset;
      });

      onAssetsUpdated(updatedAssets);
    } catch (e: any) {
      console.warn('Failed to fetch Nobitex market stats:', e);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchMarketStats();
  }, []);

  const handleRefresh = async () => {
    triggerHaptic('light');
    await fetchMarketStats();
    if (isConfigured) {
      await syncWithNobitex(cryptoAssets, onAssetsUpdated);
    }
    onNotify?.('نرخ‌های بازار ارز دیجیتال به‌روزرسانی شدند', 'info');
  };

  // Donut chart items from user crypto holdings
  const totalCryptoValue = cryptoAssets.reduce((sum, a) => sum + (a.currentHoldingValue || 0), 0);
  const donutItems: DonutChartItem[] = cryptoAssets
    .filter((a) => (a.currentHoldingValue || 0) > 0)
    .map((a) => ({
      id: a.id,
      label: a.name,
      value: a.currentHoldingValue,
      color: a.color,
      sublabel: `${a.symbol} • ${formatToman(a.unitPrice || 0)} ت`,
      targetPercent: a.targetPercent,
    }));

  // Filter ticker list
  const filteredTickers = POPULAR_TICKERS.filter((ticker) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      ticker.name.toLowerCase().includes(q) ||
      ticker.symbol.toLowerCase().includes(q) ||
      ticker.enName.toLowerCase().includes(q)
    );
  });

  return (
    <PullToRefreshContainer onRefresh={handleRefresh} isRefreshing={isLoadingStats || isSyncing} className="space-y-5 pb-24">
      
      {/* 1. NOBITEX INTEGRATION HERO */}
      <NobitexIntegrationCard
        cryptoAssets={cryptoAssets}
        onAssetsUpdated={onAssetsUpdated}
        onNotify={onNotify}
      />

      {/* 2. CRYPTO PORTFOLIO DONUT CHART */}
      {donutItems.length > 0 && (
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-indigo-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                🪙
              </div>
              <h3 className="text-sm font-black text-slate-100">
                ترکیب دارایی‌های کریپتو
              </h3>
            </div>
            <span className="text-xs font-black text-indigo-400">
              مجموع: {formatToman(totalCryptoValue)} ت
            </span>
          </div>

          <PortfolioDonutChart
            items={donutItems}
            centerTitle="مجموع رمزارزها"
            centerSubtitle={`${toPersianDigits(donutItems.length)} رمزارز`}
            size={200}
            strokeWidth={22}
          />
        </div>
      )}

      {/* 3. LIVE MARKET TICKERS & WATCHLIST */}
      <div className="space-y-3">
        
        {/* Search & Filter */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-black text-slate-100">
              قیمت لحظه‌ای بازار نوبیتکس
            </h3>
          </div>

          {lastUpdated && (
            <span className="text-[10px] text-slate-500">
              بروزرسانی: {getPersianFormattedDate(lastUpdated)}
            </span>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام یا نماد رمزارز (بیت‌کوین، ETH, SOL...)"
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 pl-10"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Tickers List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredTickers.map((ticker) => {
            const statKey = `${ticker.symbol}-rls`;
            const stat = marketStats[statKey];
            const priceTomans = stat?.latest ? Math.round(parseFloat(stat.latest) / 10) : 0;
            const dayChange = stat?.dayChange ? parseFloat(stat.dayChange) : 0;
            const isPositive = dayChange >= 0;

            // Check if user owns this coin
            const userAsset = cryptoAssets.find((a) => a.symbol.toLowerCase() === ticker.symbol);
            const userHoldingVal = userAsset?.currentHoldingValue || 0;
            const userCoinAmount = userAsset?.currentAmount || 0;

            return (
              <div
                key={ticker.symbol}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                      style={{ backgroundColor: `${ticker.color}25`, color: ticker.color }}
                    >
                      {ticker.symbol.toUpperCase().slice(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200 block truncate">
                          {ticker.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {ticker.symbol.toUpperCase()}
                        </span>
                      </div>
                      {userCoinAmount > 0 && (
                        <span className="text-[10px] text-emerald-400 font-bold block">
                          موجودی شما: {userCoinAmount} {ticker.symbol.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-left space-y-0.5 shrink-0">
                    <span className="text-xs font-black text-slate-100 block">
                      {priceTomans > 0 ? `${formatToman(priceTomans)} ت` : 'در حال دریافت...'}
                    </span>
                    {stat?.dayChange !== undefined && (
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
                        <span>{formatPercent(Math.abs(dayChange))}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Additional 24h high/low stats if available */}
                {stat && stat.dayHigh && stat.dayLow && (
                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      کف ۲۴ ساعته: <strong className="text-slate-300">{formatToman(Math.round(parseFloat(stat.dayLow) / 10))}</strong>
                    </span>
                    <span>
                      سقف ۲۴ ساعته: <strong className="text-slate-300">{formatToman(Math.round(parseFloat(stat.dayHigh) / 10))}</strong>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

    </PullToRefreshContainer>
  );
};
