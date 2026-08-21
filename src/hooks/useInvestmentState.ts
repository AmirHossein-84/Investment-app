import { useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  AppSettings,
  CryptoAsset,
  GoldHolding,
  TransactionRecord,
  ActiveTab,
} from '../types/investment';
import {
  DEFAULT_CRYPTO_ASSETS,
  DEFAULT_GOLD_HOLDING,
  DEFAULT_SETTINGS,
} from '../constants/defaultData';
import {
  calculatePortfolioAllocation,
} from '../utils/calculations';
import {
  loadSettings,
  saveSettings,
  loadCryptoAssets,
  saveCryptoAssets,
  loadGoldHolding,
  saveGoldHolding,
  loadTransactions,
  saveTransactions,
  loadLastInput,
  saveLastInput,
  resetAllDataToDefault,
  exportBackupData,
  importBackupData,
} from '../utils/storage';
import { getPersianFormattedDate } from '../utils/formatters';

interface UseInvestmentStateProps {
  externalGoldValueTomans?: number;
  onApplyGoldPurchase?: (goldBuyAmountTomans: number) => void;
}

export function useInvestmentState(props?: UseInvestmentStateProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [inputAmount, setInputAmountState] = useState<number>(() => loadLastInput());
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings());
  const [cryptoAssets, setCryptoAssetsState] = useState<CryptoAsset[]>(() => loadCryptoAssets());
  const [goldHolding, setGoldHoldingState] = useState<GoldHolding>(() => loadGoldHolding());
  const [transactions, setTransactionsState] = useState<TransactionRecord[]>(() => loadTransactions());
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  const setInputAmount = useCallback((val: number) => {
    setInputAmountState(val);
    saveLastInput(val);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
    showNotification('تنظیمات با موفقیت ذخیره شد');
  }, [showNotification]);

  const updateCryptoAssets = useCallback((newAssets: CryptoAsset[]) => {
    setCryptoAssetsState(newAssets);
    saveCryptoAssets(newAssets);
  }, []);

  const updateGoldHolding = useCallback((newGold: Partial<GoldHolding>) => {
    setGoldHoldingState((prev) => {
      const updated = { ...prev, ...newGold };
      saveGoldHolding(updated);
      return updated;
    });
    showNotification('دارایی طلا به‌روزرسانی شد');
  }, [showNotification]);

  const addCryptoAsset = useCallback((asset: Omit<CryptoAsset, 'id'>) => {
    const newAsset: CryptoAsset = {
      ...asset,
      id: `custom_${Date.now()}_${asset.symbol.toLowerCase()}`,
    };
    setCryptoAssetsState((prev) => {
      const updated = [...prev, newAsset];
      saveCryptoAssets(updated);
      return updated;
    });
    showNotification(`ارز ${newAsset.symbol} با موفقیت اضافه شد`);
  }, [showNotification]);

  const editCryptoAsset = useCallback((id: string, updates: Partial<CryptoAsset>) => {
    setCryptoAssetsState((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== id) return item;
        const edited = { ...item, ...updates };
        if (updates.currentAmount !== undefined && edited.unitPrice) {
          edited.currentHoldingValue = Math.round(updates.currentAmount * edited.unitPrice);
        } else if (updates.currentHoldingValue !== undefined && edited.unitPrice && edited.unitPrice > 0) {
          edited.currentAmount = Number((updates.currentHoldingValue / edited.unitPrice).toFixed(6));
        }
        return edited;
      });
      saveCryptoAssets(updated);
      return updated;
    });
    showNotification('ارز ویرایش شد');
  }, [showNotification]);

  const removeCryptoAsset = useCallback((id: string) => {
    setCryptoAssetsState((prev) => {
      const target = prev.find((a) => a.id === id);
      const updated = prev.filter((a) => a.id !== id);
      saveCryptoAssets(updated);
      showNotification(`ارز ${target?.symbol || ''} حذف شد`, 'info');
      return updated;
    });
  }, [showNotification]);

  // Use live TSETMC gold funds valuation as primary source, fallback to local holding if none
  const effectiveGoldHolding: GoldHolding = useMemo(() => {
    if (props?.externalGoldValueTomans !== undefined && props.externalGoldValueTomans > 0) {
      return {
        ...goldHolding,
        currentHoldingValue: props.externalGoldValueTomans,
      };
    }
    return goldHolding;
  }, [props?.externalGoldValueTomans, goldHolding]);

  // Main portfolio rebalancing calculation result
  const calculationResult = useMemo(() => {
    return calculatePortfolioAllocation(inputAmount, settings, cryptoAssets, effectiveGoldHolding);
  }, [inputAmount, settings, cryptoAssets, effectiveGoldHolding]);

  // Apply suggested purchases into current holdings
  const applyPurchasesToHoldings = useCallback(() => {
    if (calculationResult.totalSavingsAmount <= 0) {
      showNotification('مبلغ پس‌انداز صفر است. ابتدا مبلغ ورودی را تعیین کنید.', 'error');
      return;
    }

    // 1. Update Gold holding / Trigger TSETMC gold holding increment
    if (props?.onApplyGoldPurchase && calculationResult.goldBuyAmount > 0) {
      props.onApplyGoldPurchase(calculationResult.goldBuyAmount);
    } else {
      setGoldHoldingState((prevGold) => {
        const updatedGold: GoldHolding = {
          ...prevGold,
          currentHoldingValue: (prevGold.currentHoldingValue || 0) + calculationResult.goldBuyAmount,
        };
        saveGoldHolding(updatedGold);
        return updatedGold;
      });
    }

    // 2. Update Crypto assets holdings
    setCryptoAssetsState((prevAssets) => {
      const updatedAssets = prevAssets.map((asset) => {
        const buy = calculationResult.cryptoBuys.find((b) => b.id === asset.id)?.suggestedBuy || 0;
        const newVal = (asset.currentHoldingValue || 0) + buy;
        return {
          ...asset,
          currentHoldingValue: newVal,
          currentAmount: asset.unitPrice && asset.unitPrice > 0 ? Number((newVal / asset.unitPrice).toFixed(6)) : asset.currentAmount,
        };
      });
      saveCryptoAssets(updatedAssets);
      return updatedAssets;
    });

    // 3. Record transaction
    const newRecord: TransactionRecord = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString(),
      persianDate: getPersianFormattedDate(new Date()),
      totalInputAmount: calculationResult.totalInputAmount,
      totalSavingsAmount: calculationResult.totalSavingsAmount,
      goldBuyAmount: calculationResult.goldBuyAmount,
      cryptoBuyAmount: calculationResult.cryptoBuyAmount,
      cryptoBuys: calculationResult.cryptoBuys.map((b) => ({
        symbol: b.symbol,
        name: b.name,
        amount: b.suggestedBuy,
      })),
      appliedToHoldings: true,
    };

    setTransactionsState((prev) => {
      const updated = [newRecord, ...prev];
      saveTransactions(updated);
      return updated;
    });

    // Confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#627EEA', '#10B981', '#F7931A'],
      });
    } catch {
      // fallback
    }

    showNotification('خریدهای پیشنهادی با موفقیت به دارایی‌های شما اضافه شد!');
  }, [calculationResult, props, showNotification]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactionsState((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveTransactions(updated);
      return updated;
    });
    showNotification('تراکنش حذف شد', 'info');
  }, [showNotification]);

  const clearAllHistory = useCallback(() => {
    setTransactionsState([]);
    saveTransactions([]);
    showNotification('تمام تاریخچه پاک شد', 'info');
  }, [showNotification]);

  const resetToFactoryDefaults = useCallback(() => {
    resetAllDataToDefault();
    setSettingsState(DEFAULT_SETTINGS);
    setCryptoAssetsState(DEFAULT_CRYPTO_ASSETS);
    setGoldHoldingState(DEFAULT_GOLD_HOLDING);
    setTransactionsState([]);
    setInputAmountState(0);
    showNotification('تمام اطلاعات به حالت پیش‌فرض بازنشانی شد', 'info');
  }, [showNotification]);

  const handleExportBackup = useCallback(() => {
    const dataStr = exportBackupData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investment_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('فایل پشتیبان با موفقیت دانلود شد');
  }, [showNotification]);

  const handleImportBackup = useCallback((jsonString: string) => {
    const success = importBackupData(jsonString);
    if (success) {
      setSettingsState(loadSettings());
      setCryptoAssetsState(loadCryptoAssets());
      setGoldHoldingState(loadGoldHolding());
      setTransactionsState(loadTransactions());
      showNotification('پشتیبان با موفقیت بازیابی شد');
    } else {
      showNotification('خطا در فایل پشتیبان. فرمت نامعتبر است', 'error');
    }
  }, [showNotification]);

  return {
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
    goldHolding: effectiveGoldHolding,
    updateGoldHolding,
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
  };
}
