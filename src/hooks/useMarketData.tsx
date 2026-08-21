import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  MarketInstrument,
  UserMarketHolding,
  MarketQuote,
  MarketStatus,
  SearchInstrumentResult,
} from '../services/marketData/types';
import { marketDataProvider } from '../services/marketData';
import {
  loadMarketInstruments,
  saveMarketInstruments,
  loadMarketHoldings,
  saveMarketHoldings,
} from '../utils/storage';

export interface CombinedMarketItem {
  instrument: MarketInstrument;
  holding: UserMarketHolding;
  quote?: MarketQuote;
  currentValueTomans: number;
  totalCostTomans?: number;
  profitTomans?: number;
  profitPercent?: number;
}

export interface MarketDataContextType {
  instruments: MarketInstrument[];
  holdings: UserMarketHolding[];
  quotes: Record<string, MarketQuote>;
  marketStatus: MarketStatus | null;
  isLoading: boolean;
  isRefreshing: boolean;
  lastRefreshedAt: number;
  combinedItems: CombinedMarketItem[];
  totalMarketValueTomans: number;
  totalGoldMarketValueTomans: number;
  totalMarketCostTomans: number;
  addInstrumentAndHolding: (
    searchResult: SearchInstrumentResult,
    quantity: number,
    averageBuyPriceTomans?: number
  ) => void;
  addUnitsToGoldInstrument: (
    symbol: string,
    unitsToAdd: number,
    priceTomans?: number
  ) => void;
  updateHolding: (
    holdingId: string,
    quantity: number,
    averageBuyPriceTomans?: number
  ) => void;
  removeHolding: (holdingId: string) => void;
  refreshQuotes: (isManual?: boolean) => Promise<void>;
}

const MarketDataContext = createContext<MarketDataContextType | null>(null);

export const MarketDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [instruments, setInstruments] = useState<MarketInstrument[]>(() => {
    const loaded = loadMarketInstruments();
    return loaded.map((inst) => {
      if (inst.symbol === 'عیار' && inst.providerInstrumentId !== '34144395039913458') {
        return {
          ...inst,
          providerInstrumentId: '34144395039913458',
          name: 'صندوق س. پشتوانه طلای لوتوس',
        };
      }
      return inst;
    });
  });
  const [holdings, setHoldings] = useState<UserMarketHolding[]>(() => loadMarketHoldings());
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({});
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number>(Date.now());

  // Ref to prevent overlapping fetches
  const isFetchingRef = useRef(false);

  // Sync instruments to local storage
  useEffect(() => {
    saveMarketInstruments(instruments);
  }, [instruments]);

  // Sync holdings to local storage
  useEffect(() => {
    saveMarketHoldings(holdings);
  }, [holdings]);

  // Fetch Quotes and Market Status
  const refreshQuotes = useCallback(async (isManual = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      // 1. Fetch Market Status
      const status = await marketDataProvider.getMarketStatus();
      setMarketStatus(status);

      // 2. Fetch Quotes for all user-created instruments
      if (instruments.length > 0) {
        const newQuotes = await marketDataProvider.getQuotes(instruments);
        setQuotes((prev) => ({ ...prev, ...newQuotes }));
      }

      setLastRefreshedAt(Date.now());
    } catch (error) {
      console.warn('[MarketDataHook] Refresh error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [instruments]);

  // Initial fetch on mount or when instruments change
  useEffect(() => {
    refreshQuotes(false);
  }, [instruments.length]);

  // Polling: Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (instruments.length > 0) {
        refreshQuotes(false);
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [instruments.length, refreshQuotes]);

  // Add a new Instrument and its initial user holding
  const addInstrumentAndHolding = useCallback(
    (
      searchResult: SearchInstrumentResult,
      quantity: number,
      averageBuyPriceTomans?: number
    ) => {
      const now = new Date().toISOString();
      const existingInst = instruments.find(
        (i) => i.providerInstrumentId === searchResult.insCode
      );

      let instrumentId = existingInst ? existingInst.id : `inst_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      if (!existingInst) {
        const newInst: MarketInstrument = {
          id: instrumentId,
          provider: 'tsetmc',
          providerInstrumentId: searchResult.insCode,
          symbol: searchResult.symbol,
          name: searchResult.name,
          assetType: searchResult.assetType,
          createdAt: now,
          updatedAt: now,
        };
        setInstruments((prev) => [...prev, newInst]);
      }

      // Check if holding already exists for this instrument
      const existingHolding = holdings.find((h) => h.instrumentId === instrumentId);

      if (existingHolding) {
        // Update existing holding quantity
        setHoldings((prev) =>
          prev.map((h) =>
            h.id === existingHolding.id
              ? {
                  ...h,
                  quantity: h.quantity + quantity,
                  averageBuyPriceTomans: averageBuyPriceTomans || h.averageBuyPriceTomans,
                  updatedAt: now,
                }
              : h
          )
        );
      } else {
        // Create new holding
        const newHolding: UserMarketHolding = {
          id: `hold_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          instrumentId,
          quantity: Math.max(0, quantity),
          averageBuyPriceTomans: averageBuyPriceTomans && averageBuyPriceTomans > 0 ? averageBuyPriceTomans : undefined,
          createdAt: now,
          updatedAt: now,
        };
        setHoldings((prev) => [...prev, newHolding]);
      }

      // Immediately fetch quote for the newly added instrument
      setTimeout(() => refreshQuotes(true), 100);
    },
    [instruments, holdings, refreshQuotes]
  );

  // Add units directly to an existing or default gold instrument (called when applying purchases)
  const addUnitsToGoldInstrument = useCallback(
    (symbol: string, unitsToAdd: number, priceTomans?: number) => {
      if (unitsToAdd <= 0) return;
      const now = new Date().toISOString();

      const existingInst = instruments.find((i) => i.symbol === symbol);

      if (existingInst) {
        const existingHolding = holdings.find((h) => h.instrumentId === existingInst.id);
        if (existingHolding) {
          setHoldings((prev) =>
            prev.map((h) =>
              h.id === existingHolding.id
                ? {
                    ...h,
                    quantity: h.quantity + unitsToAdd,
                    updatedAt: now,
                  }
                : h
            )
          );
        } else {
          const newHolding: UserMarketHolding = {
            id: `hold_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            instrumentId: existingInst.id,
            quantity: unitsToAdd,
            averageBuyPriceTomans: priceTomans,
            createdAt: now,
            updatedAt: now,
          };
          setHoldings((prev) => [...prev, newHolding]);
        }
      } else {
        // Create default instrument for Ayar / gold fund
        const newInstId = `inst_gold_${Date.now()}`;
        const newInst: MarketInstrument = {
          id: newInstId,
          provider: 'tsetmc',
          providerInstrumentId: symbol === 'عیار' ? '34144395039913458' : '26656708390708948',
          symbol,
          name: symbol === 'عیار' ? 'صندوق س. پشتوانه طلای لوتوس-ت' : `صندوق طلای ${symbol}`,
          assetType: 'etf',
          createdAt: now,
          updatedAt: now,
        };
        const newHolding: UserMarketHolding = {
          id: `hold_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          instrumentId: newInstId,
          quantity: unitsToAdd,
          averageBuyPriceTomans: priceTomans,
          createdAt: now,
          updatedAt: now,
        };
        setInstruments((prev) => [...prev, newInst]);
        setHoldings((prev) => [...prev, newHolding]);
      }
    },
    [instruments, holdings]
  );

  // Update existing user holding
  const updateHolding = useCallback(
    (holdingId: string, quantity: number, averageBuyPriceTomans?: number) => {
      const now = new Date().toISOString();
      setHoldings((prev) =>
        prev.map((h) =>
          h.id === holdingId
            ? {
                ...h,
                quantity: Math.max(0, quantity),
                averageBuyPriceTomans: averageBuyPriceTomans && averageBuyPriceTomans > 0 ? averageBuyPriceTomans : undefined,
                updatedAt: now,
              }
            : h
        )
      );
    },
    []
  );

  // Remove holding and clean up instrument if no holdings remain
  const removeHolding = useCallback(
    (holdingId: string) => {
      const holdingToRemove = holdings.find((h) => h.id === holdingId);
      if (!holdingToRemove) return;

      const instId = holdingToRemove.instrumentId;

      setHoldings((prev) => prev.filter((h) => h.id !== holdingId));

      // If no other holding references this instrument, remove the instrument
      const otherHoldingsWithInst = holdings.filter(
        (h) => h.id !== holdingId && h.instrumentId === instId
      );
      if (otherHoldingsWithInst.length === 0) {
        setInstruments((prev) => prev.filter((i) => i.id !== instId));
      }
    },
    [holdings]
  );

  // Compute combined items with live valuation
  const combinedItems: CombinedMarketItem[] = useMemo(() => {
    return holdings.map((holding) => {
      const instrument = instruments.find((i) => i.id === holding.instrumentId) || {
        id: holding.instrumentId,
        provider: 'tsetmc',
        providerInstrumentId: '',
        symbol: 'نامشخص',
        name: 'ابزار حذف‌شده',
        assetType: 'other',
        createdAt: holding.createdAt,
        updatedAt: holding.updatedAt,
      };

      const quote = quotes[instrument.id];
      const unitPriceTomans = quote?.lastPriceTomans || 0;
      const currentValueTomans = holding.quantity * unitPriceTomans;

      let totalCostTomans: number | undefined;
      let profitTomans: number | undefined;
      let profitPercent: number | undefined;

      if (holding.averageBuyPriceTomans && holding.averageBuyPriceTomans > 0) {
        totalCostTomans = holding.quantity * holding.averageBuyPriceTomans;
        profitTomans = currentValueTomans - totalCostTomans;
        profitPercent = totalCostTomans > 0 ? (profitTomans / totalCostTomans) * 100 : 0;
      }

      return {
        instrument,
        holding,
        quote,
        currentValueTomans,
        totalCostTomans,
        profitTomans,
        profitPercent,
      };
    });
  }, [holdings, instruments, quotes]);

  // Total valuation of all market instruments
  const totalMarketValueTomans = useMemo(() => {
    return combinedItems.reduce((sum, item) => sum + item.currentValueTomans, 0);
  }, [combinedItems]);

  // Total valuation of Gold specific market instruments (used for 80% Gold rebalancing)
  const totalGoldMarketValueTomans = useMemo(() => {
    return combinedItems
      .filter(
        (item) =>
          item.instrument.assetType === 'etf' ||
          item.instrument.symbol.includes('عیار') ||
          item.instrument.symbol.includes('طلا') ||
          item.instrument.symbol.includes('کهربا') ||
          item.instrument.symbol.includes('زر') ||
          item.instrument.symbol.includes('گوهر') ||
          item.instrument.symbol.includes('زرفام')
      )
      .reduce((sum, item) => sum + item.currentValueTomans, 0);
  }, [combinedItems]);

  const totalMarketCostTomans = useMemo(() => {
    return combinedItems.reduce((sum, item) => sum + (item.totalCostTomans || 0), 0);
  }, [combinedItems]);

  const contextValue = useMemo<MarketDataContextType>(
    () => ({
      instruments,
      holdings,
      quotes,
      marketStatus,
      isLoading,
      isRefreshing,
      lastRefreshedAt,
      combinedItems,
      totalMarketValueTomans,
      totalGoldMarketValueTomans,
      totalMarketCostTomans,
      addInstrumentAndHolding,
      addUnitsToGoldInstrument,
      updateHolding,
      removeHolding,
      refreshQuotes,
    }),
    [
      instruments,
      holdings,
      quotes,
      marketStatus,
      isLoading,
      isRefreshing,
      lastRefreshedAt,
      combinedItems,
      totalMarketValueTomans,
      totalGoldMarketValueTomans,
      totalMarketCostTomans,
      addInstrumentAndHolding,
      addUnitsToGoldInstrument,
      updateHolding,
      removeHolding,
      refreshQuotes,
    ]
  );

  return (
    <MarketDataContext.Provider value={contextValue}>
      {children}
    </MarketDataContext.Provider>
  );
};

export function useMarketData(): MarketDataContextType {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
}
