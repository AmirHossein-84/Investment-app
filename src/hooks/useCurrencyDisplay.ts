import { useState, useEffect, useCallback } from 'react';
import { nobitexService } from '../services/nobitex/NobitexService';
import { formatToman, toPersianDigits } from '../utils/formatters';

const STORAGE_KEY = 'investment_app_currency_mode_v1';
const DEFAULT_USDT_RATE_TOMANS = 93000;

export type CurrencyDisplayMode = 'toman' | 'usd';

export interface UseCurrencyDisplayReturn {
  currencyMode: CurrencyDisplayMode;
  usdtRateTomans: number;
  isFetchingRate: boolean;
  toggleCurrencyMode: () => void;
  setCurrencyMode: (mode: CurrencyDisplayMode) => void;
  formatCurrency: (amountInTomans: number, showUnit?: boolean) => string;
  toDisplayValue: (amountInTomans: number) => number;
  currencyUnitLabel: string;
  refreshUsdtRate: () => Promise<void>;
}

export function useCurrencyDisplay(): UseCurrencyDisplayReturn {
  const [currencyMode, setCurrencyModeState] = useState<CurrencyDisplayMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'usd' ? 'usd' : 'toman';
    } catch {
      return 'toman';
    }
  });

  const [usdtRateTomans, setUsdtRateTomans] = useState<number>(DEFAULT_USDT_RATE_TOMANS);
  const [isFetchingRate, setIsFetchingRate] = useState<boolean>(false);

  const refreshUsdtRate = useCallback(async () => {
    setIsFetchingRate(true);
    try {
      const stats = await nobitexService.getMarketStats([], 'rls');
      const usdtStat = stats['usdt-rls'];
      if (usdtStat && usdtStat.latest) {
        const rawRials = parseFloat(usdtStat.latest);
        if (!isNaN(rawRials) && rawRials > 0) {
          const rate = Math.round(rawRials / 10);
          setUsdtRateTomans(rate);
        }
      }
    } catch (e) {
      console.warn('[useCurrencyDisplay] Could not fetch live USDT rate:', e);
    } finally {
      setIsFetchingRate(false);
    }
  }, []);

  useEffect(() => {
    refreshUsdtRate();
  }, [refreshUsdtRate]);

  const setCurrencyMode = useCallback((mode: CurrencyDisplayMode) => {
    setCurrencyModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      console.error('Failed to save currency display mode:', e);
    }
  }, []);

  const toggleCurrencyMode = useCallback(() => {
    setCurrencyMode(currencyMode === 'toman' ? 'usd' : 'toman');
  }, [currencyMode, setCurrencyMode]);

  const toDisplayValue = useCallback(
    (amountInTomans: number): number => {
      if (currencyMode === 'usd') {
        const rate = usdtRateTomans > 0 ? usdtRateTomans : DEFAULT_USDT_RATE_TOMANS;
        return Number((amountInTomans / rate).toFixed(2));
      }
      return amountInTomans;
    },
    [currencyMode, usdtRateTomans]
  );

  const formatCurrency = useCallback(
    (amountInTomans: number, showUnit = true): string => {
      if (currencyMode === 'usd') {
        const rate = usdtRateTomans > 0 ? usdtRateTomans : DEFAULT_USDT_RATE_TOMANS;
        const usdValue = amountInTomans / rate;
        const formatted = usdValue.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return showUnit ? `$ ${formatted}` : formatted;
      }

      const tomanFormatted = formatToman(amountInTomans);
      return showUnit ? `${tomanFormatted} تومان` : tomanFormatted;
    },
    [currencyMode, usdtRateTomans]
  );

  const currencyUnitLabel = currencyMode === 'usd' ? '$ (تتر)' : 'تومان';

  return {
    currencyMode,
    usdtRateTomans,
    isFetchingRate,
    toggleCurrencyMode,
    setCurrencyMode,
    formatCurrency,
    toDisplayValue,
    currencyUnitLabel,
    refreshUsdtRate,
  };
}
