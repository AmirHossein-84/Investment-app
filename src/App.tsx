import React, { useState, useCallback } from 'react';
import { useInvestmentState } from './hooks/useInvestmentState';
import { useMarketData } from './hooks/useMarketData';
import { useNobitex } from './hooks/useNobitex';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { CryptoMarketView } from './components/crypto/CryptoMarketView';
import { MarketInstrumentsView } from './components/market/MarketInstrumentsView';
import { HoldingsManager } from './components/holdings/HoldingsManager';
import { PercentagesConfig } from './components/settings/PercentagesConfig';
import { BackupRestore } from './components/settings/BackupRestore';
import { TransactionHistory } from './components/history/TransactionHistory';
import { CheckCircle, Info, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [activeGoldFund, setActiveGoldFund] = useState<string>('عیار');
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  const {
    totalGoldMarketValueTomans,
    totalMarketValueTomans,
    instruments,
    quotes,
    addUnitsToGoldInstrument,
    refreshQuotes,
  } = useMarketData();

  const {
    isConfigured: isNobitexConfigured,
    tomanCashBalance,
    syncWithNobitex,
    refreshCryptoPrices,
  } = useNobitex();

  // Handler to automatically add purchased TSETMC Gold units to user holdings
  const handleApplyGoldPurchase = useCallback(
    (goldBuyAmountTomans: number) => {
      const targetInstrument =
        instruments.find((i) => i.symbol === activeGoldFund) ||
        instruments.find((i) => i.symbol === 'عیار') ||
        instruments[0];

      const symbol = targetInstrument?.symbol || 'عیار';
      const quote = targetInstrument ? quotes[targetInstrument.id] : undefined;
      const unitPrice = quote && quote.lastPriceTomans > 0 ? quote.lastPriceTomans : 35000;
      const unitsToBuy = Math.floor(goldBuyAmountTomans / unitPrice);

      if (unitsToBuy > 0) {
        addUnitsToGoldInstrument(symbol, unitsToBuy, unitPrice);
      }
    },
    [activeGoldFund, instruments, quotes, addUnitsToGoldInstrument]
  );

  const {
    activeTab,
    setActiveTab,
    inputAmount,
    setInputAmount,
    settings,
    updateSettings,
    cryptoAssets,
    updateCryptoAssets,
    addCryptoAsset,
    editCryptoAsset,
    removeCryptoAsset,
    goldHolding,
    transactions,
    deleteTransaction,
    clearAllHistory,
    calculationResult,
    applyPurchasesToHoldings,
    resetToFactoryDefaults,
    handleExportBackup,
    handleImportBackup,
    notification,
    showNotification,
  } = useInvestmentState({
    externalGoldValueTomans: totalGoldMarketValueTomans,
    onApplyGoldPurchase: handleApplyGoldPurchase,
  });

  // Calculate live Gold ETF unit price and 24h change
  const activeGoldInst = instruments.find((i) => i.symbol === activeGoldFund);
  const activeGoldQuote = activeGoldInst ? quotes[activeGoldInst.id] : undefined;
  const goldEtfUnitPrice = activeGoldQuote?.lastPriceTomans || 35000;
  const goldEtfUnitChange = activeGoldQuote?.priceChangePercent || 0;

  const totalCryptoValue = cryptoAssets.reduce((sum, a) => sum + (a.currentHoldingValue || 0), 0);
  const totalPortfolioValue = totalGoldMarketValueTomans + totalCryptoValue;

  // Unified pull-to-refresh handler across both TSETMC and Nobitex
  const handleRefreshAll = async () => {
    setIsRefreshingAll(true);
    try {
      await Promise.all([
        refreshQuotes(true),
        isNobitexConfigured
          ? syncWithNobitex(cryptoAssets, updateCryptoAssets)
          : refreshCryptoPrices(cryptoAssets, updateCryptoAssets),
      ]);
      showNotification('اطلاعات بورس، طلا و رمزارزها به‌روزرسانی شد', 'success');
    } catch (e) {
      console.warn('Refresh all error:', e);
    } finally {
      setIsRefreshingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-dark-bg text-slate-100 selection:bg-gold-500/30 selection:text-gold-200 pb-24 transition-colors">
      
      {/* Top Header */}
      <Header isDark={isDark} toggleTheme={toggleTheme} />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        
        {/* TAB 1: DASHBOARD (OVERVIEW, 80/20 DONUT & SMART BUY) */}
        {(activeTab === 'dashboard' || (activeTab as string) === 'calculator') && (
          <DashboardView
            totalInputAmount={inputAmount}
            setTotalInputAmount={setInputAmount}
            calculationResult={calculationResult}
            cryptoAssets={cryptoAssets}
            goldHoldingValue={totalGoldMarketValueTomans}
            totalCryptoValue={totalCryptoValue}
            totalPortfolioValue={totalPortfolioValue}
            tomanCashBalance={tomanCashBalance}
            activeGoldFund={activeGoldFund}
            setActiveGoldFund={setActiveGoldFund}
            goldEtfUnitPrice={goldEtfUnitPrice}
            goldEtfUnitChange={goldEtfUnitChange}
            settings={settings}
            updateSettings={updateSettings}
            isRefreshing={isRefreshingAll}
            onRefreshAll={handleRefreshAll}
            onApplyPurchases={applyPurchasesToHoldings}
            onNavigateToTab={setActiveTab}
            onNotify={showNotification}
          />
        )}

        {/* TAB 2: GOLD & STOCK MARKET (TSETMC) */}
        {(activeTab === 'gold' || (activeTab as string) === 'market') && (
          <div className="animate-fadeIn">
            <MarketInstrumentsView />
          </div>
        )}

        {/* TAB 3: CRYPTO MARKET (NOBITEX) */}
        {activeTab === 'crypto' && (
          <div className="animate-fadeIn">
            <CryptoMarketView
              cryptoAssets={cryptoAssets}
              onAssetsUpdated={updateCryptoAssets}
              onNotify={showNotification}
            />
          </div>
        )}

        {/* TAB 4: HOLDINGS MANAGEMENT */}
        {activeTab === 'holdings' && (
          <div className="animate-fadeIn">
            <HoldingsManager
              cryptoAssets={cryptoAssets}
              updateCryptoAssets={updateCryptoAssets}
              addCryptoAsset={addCryptoAsset}
              editCryptoAsset={editCryptoAsset}
              removeCryptoAsset={removeCryptoAsset}
              onNavigateToCalculator={() => setActiveTab('dashboard')}
              onNavigateToMarket={() => setActiveTab('gold')}
              onNotify={showNotification}
            />
          </div>
        )}

        {/* TAB 5: SETTINGS & HISTORY */}
        {activeTab === 'settings' && (
          <div className="space-y-5 animate-fadeIn">
            <PercentagesConfig
              settings={settings}
              updateSettings={updateSettings}
              cryptoAssets={cryptoAssets}
              updateCryptoAssets={updateCryptoAssets}
              onNotify={showNotification}
            />

            <TransactionHistory
              transactions={transactions}
              onDeleteTransaction={deleteTransaction}
              onClearAll={clearAllHistory}
            />

            <BackupRestore
              onExport={handleExportBackup}
              onImport={handleImportBackup}
              onResetToDefaults={resetToFactoryDefaults}
            />
          </div>
        )}

        {/* TAB 6: HISTORY (IF ACCESSED DIRECTLY) */}
        {activeTab === 'history' && (
          <div className="animate-fadeIn">
            <TransactionHistory
              transactions={transactions}
              onDeleteTransaction={deleteTransaction}
              onClearAll={clearAllHistory}
            />
          </div>
        )}

      </main>

      {/* Floating Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Toast Notification Snackbar */}
      {notification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce duration-300">
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-2 text-xs font-bold text-slate-100 ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                : notification.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-300'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {notification.type === 'info' && <Info className="w-4 h-4 text-indigo-400" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
