import React, { useCallback } from 'react';
import { useInvestmentState } from './hooks/useInvestmentState';
import { useMarketData } from './hooks/useMarketData';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { CapitalInputCard } from './components/dashboard/CapitalInputCard';
import { OverviewSummary } from './components/dashboard/OverviewSummary';
import { AllocationCharts } from './components/dashboard/AllocationCharts';
import { GoldBuyCard } from './components/calculation/GoldBuyCard';
import { CryptoBuyTable } from './components/calculation/CryptoBuyTable';
import { QuickActions } from './components/calculation/QuickActions';
import { MarketInstrumentsView } from './components/market/MarketInstrumentsView';
import { HoldingsManager } from './components/holdings/HoldingsManager';
import { PercentagesConfig } from './components/settings/PercentagesConfig';
import { BackupRestore } from './components/settings/BackupRestore';
import { TransactionHistory } from './components/history/TransactionHistory';
import { CheckCircle, Info, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  const {
    totalGoldMarketValueTomans,
    totalMarketValueTomans,
    instruments,
    quotes,
    addUnitsToGoldInstrument,
  } = useMarketData();

  // Handler to automatically add purchased TSETMC Gold units to user holdings
  const handleApplyGoldPurchase = useCallback(
    (goldBuyAmountTomans: number) => {
      // Find user gold instrument or default to Ayar
      const primaryGold = instruments.find((i) => i.symbol === 'عیار') || instruments[0];
      const symbol = primaryGold?.symbol || 'عیار';
      const quote = primaryGold ? quotes[primaryGold.id] : undefined;
      const unitPrice = quote && quote.lastPriceTomans > 0 ? quote.lastPriceTomans : 35000;
      const unitsToBuy = Math.floor(goldBuyAmountTomans / unitPrice);

      if (unitsToBuy > 0) {
        addUnitsToGoldInstrument(symbol, unitsToBuy, unitPrice);
      }
    },
    [instruments, quotes, addUnitsToGoldInstrument]
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

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-dark-bg text-slate-100 selection:bg-gold-500/30 selection:text-gold-200 pb-24 transition-colors">
      
      {/* Top Header */}
      <Header
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        
        {/* TAB 1: CALCULATOR & DASHBOARD */}
        {activeTab === 'calculator' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Overview Summary */}
            <OverviewSummary
              cryptoAssets={cryptoAssets}
              goldHolding={goldHolding}
              marketValueTomans={totalMarketValueTomans}
            />

            {/* Capital Input Card */}
            <CapitalInputCard
              inputAmount={inputAmount}
              setInputAmount={setInputAmount}
              settings={settings}
              updateSettings={updateSettings}
              totalSavingsAmount={calculationResult.totalSavingsAmount}
              goldBuyAmount={calculationResult.goldBuyAmount}
              cryptoBuyAmount={calculationResult.cryptoBuyAmount}
            />

            {/* Calculations Breakdown (Only when input is provided) */}
            {calculationResult.totalSavingsAmount > 0 ? (
              <>
                {/* Gold Purchase Card (TSETMC Gold ETF powered) */}
                <GoldBuyCard
                  goldBuyAmount={calculationResult.goldBuyAmount}
                  goldPercent={settings.goldPercent}
                />

                {/* Crypto Purchase Table (Matching photo layout) */}
                <CryptoBuyTable
                  cryptoBuys={calculationResult.cryptoBuys}
                  totalCryptoBuySuggested={calculationResult.totalCryptoBuySuggested}
                />

                {/* Visual Allocation Donut Chart */}
                <AllocationCharts
                  cryptoBuys={calculationResult.cryptoBuys}
                  cryptoAssets={cryptoAssets}
                  goldBuyAmount={calculationResult.goldBuyAmount}
                  cryptoBuyAmount={calculationResult.cryptoBuyAmount}
                />

                {/* Apply Purchases CTA */}
                <QuickActions
                  calculationResult={calculationResult}
                  onApplyPurchases={applyPurchasesToHoldings}
                  onNavigateToHoldings={() => setActiveTab('holdings')}
                />
              </>
            ) : (
              <div className="p-8 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                <div className="text-2xl mb-1">💡</div>
                <h3 className="text-sm font-bold text-slate-300">
                  برای مشاهده جدول خریدهای پیشنهادی، مبلغ سرمایه ورودی را در بالا وارد کنید
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  برنامه به صورت خودکار ۳۰٪ پس‌انداز، ۸۰٪ صندوق طلای بورس و ۲۰٪ رمزارزها را با توازن موجودی قبلی شما محاسبه خواهد کرد.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TSETMC MARKET & GOLD INSTRUMENTS */}
        {activeTab === 'market' && (
          <div className="animate-fadeIn">
            <MarketInstrumentsView />
          </div>
        )}

        {/* TAB 3: HOLDINGS MANAGEMENT */}
        {activeTab === 'holdings' && (
          <div className="animate-fadeIn">
            <HoldingsManager
              cryptoAssets={cryptoAssets}
              updateCryptoAssets={updateCryptoAssets}
              addCryptoAsset={addCryptoAsset}
              editCryptoAsset={editCryptoAsset}
              removeCryptoAsset={removeCryptoAsset}
              onNavigateToCalculator={() => setActiveTab('calculator')}
              onNavigateToMarket={() => setActiveTab('market')}
              onNotify={showNotification}
            />
          </div>
        )}

        {/* TAB 4: SETTINGS & CUSTOMIZATION */}
        {activeTab === 'settings' && (
          <div className="space-y-5 animate-fadeIn">
            <PercentagesConfig
              settings={settings}
              updateSettings={updateSettings}
              cryptoAssets={cryptoAssets}
              updateCryptoAssets={updateCryptoAssets}
              onNotify={showNotification}
            />

            <BackupRestore
              onExport={handleExportBackup}
              onImport={handleImportBackup}
              onResetToDefaults={resetToFactoryDefaults}
            />
          </div>
        )}

        {/* TAB 5: TRANSACTION HISTORY */}
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
