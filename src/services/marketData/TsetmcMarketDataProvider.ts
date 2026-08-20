import {
  MarketDataProvider,
  MarketInstrument,
  MarketQuote,
  MarketStatus,
  SearchInstrumentResult,
  AssetType,
} from './types';

/**
 * Normalizes Persian/Arabic characters and digits for consistent search matching
 */
export function normalizePersian(text: string): string {
  if (!text) return '';
  return text
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width spaces
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .trim();
}

/**
 * Maps TSETMC flow or name to AssetType
 */
function inferAssetType(name: string, symbol: string): AssetType {
  const normalized = (name + ' ' + symbol).toLowerCase();
  if (
    normalized.includes('صندوق') ||
    normalized.includes('پشتوانه طلا') ||
    normalized.includes('etf') ||
    normalized.includes('عیار') ||
    normalized.includes('طلا') ||
    normalized.includes('کهربا') ||
    normalized.includes('زر') ||
    normalized.includes('گوهر') ||
    normalized.includes('اهرم')
  ) {
    return 'etf';
  }
  if (normalized.includes('اوراق') || normalized.includes('مشارکت') || normalized.includes('اخزا')) {
    return 'bond';
  }
  return 'stock';
}

export class TsetmcMarketDataProvider implements MarketDataProvider {
  readonly name = 'TSETMC (Tehran Stock Exchange)';
  
  // Base URLs: Uses Vite proxy '/api/tsetmc' when in web browser, or direct CDN URL
  private readonly baseUrl: string;
  private readonly fallbackUrl = 'https://cdn.tsetmc.com/api';
  
  // Cache to avoid spamming upstream
  private quoteCache: Map<string, { quote: MarketQuote; fetchedAt: number }> = new Map();
  private readonly cacheTtlMs = 25000; // 25 seconds cache
  
  // Rate-limiting queue
  private lastRequestTime = 0;
  private readonly minRequestIntervalMs = 250; // Max 4 requests per second

  constructor() {
    // Check environment: In browser, use proxy endpoint to avoid CORS issues
    const isBrowser = typeof window !== 'undefined';
    this.baseUrl = isBrowser ? '/api/tsetmc' : this.fallbackUrl;
  }

  private async fetchWithThrottle(urlPath: string): Promise<any> {
    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTime;
    if (timeSinceLast < this.minRequestIntervalMs) {
      await new Promise((resolve) => setTimeout(resolve, this.minRequestIntervalMs - timeSinceLast));
    }
    this.lastRequestTime = Date.now();

    // Primary request (via proxy or direct)
    const primaryUrl = `${this.baseUrl}${urlPath}`;
    
    try {
      const response = await fetch(primaryUrl, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
        },
      });

      if (!response.ok) {
        throw new Error(`TSETMC HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      // If primary failed (e.g. CORS or proxy issue), try direct fallback URL
      if (this.baseUrl !== this.fallbackUrl) {
        try {
          const directUrl = `${this.fallbackUrl}${urlPath}`;
          const fallbackRes = await fetch(directUrl);
          if (fallbackRes.ok) {
            return await fallbackRes.json();
          }
        } catch {
          // Ignore and throw original error
        }
      }
      throw err;
    }
  }

  /**
   * Search instruments by Persian symbol or company name
   */
  async searchInstruments(query: string): Promise<SearchInstrumentResult[]> {
    const cleanQuery = normalizePersian(query);
    if (!cleanQuery || cleanQuery.length < 1) return [];

    try {
      const data = await this.fetchWithThrottle(`/Instrument/GetInstrumentSearch/${encodeURIComponent(cleanQuery)}`);
      
      const rawList = data?.instrumentSearch || [];
      if (!Array.isArray(rawList)) return [];

      return rawList.map((item: any) => {
        const symbol = normalizePersian(item.lVal18AFC || item.cValMne || '');
        const name = normalizePersian(item.lVal30 || '');
        const insCode = String(item.insCode || '');
        const flow = typeof item.flow === 'number' ? item.flow : undefined;

        return {
          insCode,
          symbol,
          name,
          assetType: inferAssetType(name, symbol),
          flow,
        };
      });
    } catch (error) {
      console.warn('[TSETMC] Search error:', error);
      return [];
    }
  }

  /**
   * Get single quote by Instrument definition
   */
  async getQuote(instrument: MarketInstrument): Promise<MarketQuote> {
    const insCode = instrument.providerInstrumentId;
    const now = Date.now();

    // Check cache
    const cached = this.quoteCache.get(insCode);
    if (cached && now - cached.fetchedAt < this.cacheTtlMs) {
      return cached.quote;
    }

    try {
      const data = await this.fetchWithThrottle(`/ClosingPrice/GetClosingPriceInfo/${insCode}`);
      const info = data?.closingPriceInfo;

      if (!info) {
        throw new Error(`Quote not available for insCode ${insCode}`);
      }

      // Extract raw Rial prices (TSETMC keys)
      const lastPriceRials = Number(info.pDrCotVal ?? info.pl ?? 0);
      const closingPriceRials = Number(info.pClosing ?? info.pc ?? lastPriceRials);
      const yesterdayPriceRials = Number(info.priceYesterday ?? info.py ?? closingPriceRials);
      const minPriceRials = Number(info.priceMin ?? 0);
      const maxPriceRials = Number(info.priceMax ?? 0);

      // Convert Rials to Tomans (1 Toman = 10 Rials)
      const lastPriceTomans = Math.round(lastPriceRials / 10);
      const closingPriceTomans = Math.round(closingPriceRials / 10);
      const yesterdayPriceTomans = Math.round(yesterdayPriceRials / 10);

      // Calculate price change
      const priceChangeTomans = lastPriceTomans - yesterdayPriceTomans;
      const priceChangePercent = yesterdayPriceTomans > 0 
        ? ((lastPriceTomans - yesterdayPriceTomans) / yesterdayPriceTomans) * 100 
        : 0;

      // Extract time / date
      const hEven = String(info.hEven || '').padStart(6, '0');
      const timeStr = hEven.length === 6 ? `${hEven.slice(0, 2)}:${hEven.slice(2, 4)}:${hEven.slice(4, 6)}` : undefined;
      const dateStr = String(info.dEven || '');

      const quote: MarketQuote = {
        instrumentId: instrument.id,
        insCode,
        symbol: instrument.symbol,
        name: instrument.name,
        lastPriceRials,
        closingPriceRials,
        yesterdayPriceRials,
        minPriceRials,
        maxPriceRials,
        lastPriceTomans,
        closingPriceTomans,
        yesterdayPriceTomans,
        priceChangeTomans,
        priceChangePercent: Math.round(priceChangePercent * 100) / 100,
        tradeCount: info.zTotTran,
        tradeVolume: info.qTotTran5J,
        tradeValueRials: info.qTotCap,
        tradeTime: timeStr,
        tradeDate: dateStr,
        lastFetchedAt: now,
        isStale: false,
      };

      // Store in cache
      this.quoteCache.set(insCode, { quote, fetchedAt: now });

      return quote;
    } catch (error) {
      console.warn(`[TSETMC] Failed to fetch quote for ${instrument.symbol} (${insCode}):`, error);
      
      // If we have an expired cache, return it with isStale: true
      if (cached) {
        return {
          ...cached.quote,
          isStale: true,
        };
      }

      // Return a fallback quote if never fetched
      return {
        instrumentId: instrument.id,
        insCode,
        symbol: instrument.symbol,
        name: instrument.name,
        lastPriceRials: 0,
        closingPriceRials: 0,
        yesterdayPriceRials: 0,
        lastPriceTomans: 0,
        closingPriceTomans: 0,
        yesterdayPriceTomans: 0,
        priceChangeTomans: 0,
        priceChangePercent: 0,
        lastFetchedAt: now,
        isStale: true,
      };
    }
  }

  /**
   * Get multiple quotes concurrently
   */
  async getQuotes(instruments: MarketInstrument[]): Promise<Record<string, MarketQuote>> {
    const results: Record<string, MarketQuote> = {};
    if (!instruments || instruments.length === 0) return results;

    const promises = instruments.map(async (inst) => {
      const quote = await this.getQuote(inst);
      results[inst.id] = quote;
    });

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Check if Tehran stock exchange is currently in an active trading session
   * Session hours: Saturday to Wednesday, 09:00 to 12:30 (and till 15:00 for Gold ETFs/Commodities)
   */
  async getMarketStatus(): Promise<MarketStatus> {
    try {
      const tehranDate = new Date(
        new Date().toLocaleString('en-US', { timeZone: 'Asia/Tehran' })
      );

      const dayOfWeek = tehranDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 4 = Thursday, 5 = Friday, 6 = Saturday
      const isTradingDay = dayOfWeek === 6 || (dayOfWeek >= 0 && dayOfWeek <= 3); // Sat, Sun, Mon, Tue, Wed

      const hours = tehranDate.getHours();
      const minutes = tehranDate.getMinutes();
      const timeInMinutes = hours * 60 + minutes;

      // Regular market: 09:00 (540 min) to 12:30 (750 min)
      // Extended gold ETF session: up to 15:00 (900 min)
      const isRegularSession = isTradingDay && timeInMinutes >= 540 && timeInMinutes <= 750;
      const isExtendedGoldSession = isTradingDay && timeInMinutes >= 540 && timeInMinutes <= 900;
      const isOpen = isExtendedGoldSession;

      const timeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      let message = 'بازار بسته است';
      if (isRegularSession) {
        message = 'جلسه معاملاتی بورس و فرابورس فعال است';
      } else if (isExtendedGoldSession) {
        message = 'معاملات صندوق‌های طلا و کالایی فعال است';
      } else if (!isTradingDay) {
        message = 'امروز تعطیل رسمی / پایان هفته بازار است';
      }

      return {
        isOpen,
        sessionName: 'بازار بورس و اوراق بهادار تهران (TSETMC)',
        serverTime: timeFormatted,
        isTradingDay,
        message,
      };
    } catch {
      return {
        isOpen: false,
        sessionName: 'TSETMC',
        serverTime: '',
        isTradingDay: false,
        message: 'عدم امکان بررسی وضعیت بازار',
      };
    }
  }
}
