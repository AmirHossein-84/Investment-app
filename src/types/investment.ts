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

export type ActiveTab = 'calculator' | 'holdings' | 'settings' | 'history';
