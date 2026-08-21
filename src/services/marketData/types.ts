/**
 * Types and Interfaces for Market Data System (TSETMC & Generic Providers)
 */

export type AssetType = 'etf' | 'stock' | 'commodity' | 'bond' | 'other';

export interface MarketInstrument {
  id: string; // Internal UUID or unique ID
  provider: 'tsetmc' | 'manual';
  providerInstrumentId: string; // TSETMC InsCode (e.g. "34144395039913458" for عیار)
  symbol: string; // Persian symbol (e.g. "عیار")
  name: string; // Full company / ETF name (e.g. "صندوق س. پشتوانه طلای لوتوس-ت")
  assetType: AssetType;
  cIsin?: string; // 12-char ISIN code if available
  createdAt: string;
  updatedAt: string;
}

export interface UserMarketHolding {
  id: string;
  instrumentId: string; // Foreign key referencing MarketInstrument.id
  quantity: number; // Units owned (e.g. 280)
  averageBuyPriceTomans?: number; // Optional purchase cost per unit in Tomans
  createdAt: string;
  updatedAt: string;
}

export interface MarketQuote {
  instrumentId: string; // Local Instrument ID
  insCode: string; // TSETMC InsCode
  symbol: string;
  name: string;
  
  // Prices in Rials (Native TSETMC)
  lastPriceRials: number; // pl / pDrCotVal (آخرین معامله)
  closingPriceRials: number; // pc / pClosing (قیمت پایانی)
  yesterdayPriceRials: number; // py / priceYesterday (دیروز)
  minPriceRials?: number; // priceMin
  maxPriceRials?: number; // priceMax

  // Prices in Tomans (Calculated: Rials / 10)
  lastPriceTomans: number;
  closingPriceTomans: number;
  yesterdayPriceTomans: number;

  // Change Stats
  priceChangeTomans: number;
  priceChangePercent: number;

  // Volume and Trades
  tradeCount?: number;
  tradeVolume?: number;
  tradeValueRials?: number;

  // Timestamp and Freshness
  tradeTime?: string; // HH:MM:SS
  tradeDate?: string; // YYYYMMDD
  lastFetchedAt: number; // Unix timestamp ms
  isStale: boolean;
}

export interface MarketStatus {
  isOpen: boolean;
  sessionName: string; // e.g. "جلسه معاملاتی بازار بورس تهران"
  serverTime: string;
  isTradingDay: boolean;
  message?: string;
}

export interface SearchInstrumentResult {
  insCode: string;
  symbol: string;
  name: string;
  assetType: AssetType;
  flow?: number; // Market flow (1=Bourse, 2=Farabourse, 4=Payeh)
}

export interface MarketDataProvider {
  readonly name: string;
  searchInstruments(query: string): Promise<SearchInstrumentResult[]>;
  getQuote(instrument: MarketInstrument): Promise<MarketQuote>;
  getQuotes(instruments: MarketInstrument[]): Promise<Record<string, MarketQuote>>;
  getMarketStatus(): Promise<MarketStatus>;
}
