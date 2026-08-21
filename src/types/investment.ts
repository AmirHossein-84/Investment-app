import { MarketInstrument, UserMarketHolding, MarketQuote, MarketStatus } from '../services/marketData/types';

export * from '../services/marketData/types';

export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  targetPercent: number; // e.g., 25 for 25%
  currentHoldingValue: number; // in Tomans
  currentAmount?: number; // coin amount (optional)
  unitPrice?: number; // unit price in Tomans (optional)
  color: string;
  isDefault?: boolean;
}

export type PhysicalGoldType =
  | 'gold_18k'
  | 'gold_24k'
  | 'coin_emami'
  | 'coin_bahar'
  | 'coin_half'
  | 'coin_quarter'
  | 'coin_gram';

export interface PhysicalGoldItem {
  id: PhysicalGoldType;
  title: string;
  unit: 'گرم' | 'عدد';
  quantity: number; // e.g. 15.5 grams or 2 coins
  unitPriceTomans: number; // live or user-custom price per unit in Tomans
  priceChangePercent?: number; // 24h change
  lastFetchedAt?: number;
  isCustomPrice?: boolean; // If user manually overridden the price
}

export interface GoldHolding {
  currentHoldingValue: number; // in Tomans
  currentGrams?: number; // in grams
  pricePerGram?: number; // in Tomans per gram
}

export interface AppSettings {
  savingsPercent: number; // default 30%
  goldPercent: number; // default 80% (of savings)
  cryptoPercent: number; // default 20% (of savings)
  calculationMode: 'rebalance' | 'direct'; // rebalance vs direct split
  currencyUnit: 'toman' | 'rial';
  goldPricePerGram: number; // e.g. 5,000,000 Tomans
}

export interface CalculatedCryptoBuy {
  id: string;
  symbol: string;
  name: string;
  targetPercent: number;
  currentHoldingValue: number;
  suggestedBuy: number; // in Tomans
  finalHoldingValue: number;
  finalPercent: number;
  color: string;
}

export interface CalculationResult {
  totalInputAmount: number; // Total user input
  totalSavingsAmount: number; // 30% of total
  goldBuyAmount: number; // 80% of savings (adjusted in rebalance)
  cryptoBuyAmount: number; // 20% of savings (adjusted in rebalance)
  cryptoBuys: CalculatedCryptoBuy[];
  totalCryptoBuySuggested: number;
  newTotalPortfolioValue: number;
}

export interface TransactionRecord {
  id: string;
  date: string; // ISO string
  persianDate: string;
  totalInputAmount: number;
  totalSavingsAmount: number;
  goldBuyAmount: number;
  cryptoBuyAmount: number;
  cryptoBuys: {
    symbol: string;
    name: string;
    amount: number;
  }[];
  appliedToHoldings: boolean;
}

export interface AppBackupData {
  version: number;
  exportDate: string;
  cryptoAssets: CryptoAsset[];
  goldHolding: GoldHolding;
  physicalGold?: PhysicalGoldItem[];
  settings: AppSettings;
  transactions: TransactionRecord[];
  marketInstruments?: MarketInstrument[];
  marketHoldings?: UserMarketHolding[];
}

export type ActiveTab =
  | 'dashboard'
  | 'gold'
  | 'crypto'
  | 'holdings'
  | 'settings'
  | 'history'
  | 'calculator'
  | 'market';
