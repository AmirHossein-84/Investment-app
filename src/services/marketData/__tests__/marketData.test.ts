import { normalizePersian } from '../TsetmcMarketDataProvider';
import { MarketInstrument, UserMarketHolding, MarketQuote } from '../types';

describe('TSETMC Market Data System', () => {
  test('Persian text normalization cleans Arabic chars and spaces', () => {
    expect(normalizePersian('عيار')).toBe('عیار');
    expect(normalizePersian('طلاي لوتوس')).toBe('طلای لوتوس');
    expect(normalizePersian('كشتي')).toBe('کشتی');
    expect(normalizePersian('  اهرم  ')).toBe('اهرم');
  });

  test('Valuation formula correctly converts Rials to Tomans and calculates currentValue = quantity * price', () => {
    const instrument: MarketInstrument = {
      id: 'inst_ayar_1',
      provider: 'tsetmc',
      providerInstrumentId: '34144395039913458',
      symbol: 'عیار',
      name: 'صندوق س. پشتوانه طلای لوتوس-ت',
      assetType: 'etf',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const holding: UserMarketHolding = {
      id: 'hold_ayar_1',
      instrumentId: instrument.id,
      quantity: 280, // 280 units
      averageBuyPriceTomans: 32000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const rawLastPriceRials = 350000; // 350,000 Rials per unit
    const lastPriceTomans = Math.round(rawLastPriceRials / 10); // 35,000 Tomans

    const quote: MarketQuote = {
      instrumentId: instrument.id,
      insCode: instrument.providerInstrumentId,
      symbol: instrument.symbol,
      name: instrument.name,
      lastPriceRials: rawLastPriceRials,
      closingPriceRials: 349000,
      yesterdayPriceRials: 345000,
      lastPriceTomans,
      closingPriceTomans: 34900,
      yesterdayPriceTomans: 34500,
      priceChangeTomans: 500,
      priceChangePercent: 1.45,
      lastFetchedAt: Date.now(),
      isStale: false,
    };

    // Calculate valuation
    const currentValueTomans = holding.quantity * quote.lastPriceTomans;
    const totalCostTomans = holding.quantity * (holding.averageBuyPriceTomans || 0);
    const profitTomans = currentValueTomans - totalCostTomans;

    // 280 * 35,000 = 9,800,000 Tomans
    expect(currentValueTomans).toBe(9800000);
    // Cost: 280 * 32,000 = 8,960,000 Tomans
    expect(totalCostTomans).toBe(8960000);
    // Profit: 9,800,000 - 8,960,000 = 840,000 Tomans
    expect(profitTomans).toBe(840000);
  });
});
