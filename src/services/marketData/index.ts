import { TsetmcMarketDataProvider } from './TsetmcMarketDataProvider';
import { MarketDataProvider } from './types';

export * from './types';
export * from './TsetmcMarketDataProvider';

// Singleton instance
export const marketDataProvider: MarketDataProvider = new TsetmcMarketDataProvider();
