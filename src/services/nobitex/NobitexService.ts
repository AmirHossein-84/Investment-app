import { Capacitor } from '@capacitor/core';
import { CryptoAsset } from '../../types/investment';
import { NobitexWallet, NobitexMarketStat, NobitexProfile, NobitexConfig } from './types';
import { signNobitexRequest } from './nobitexSigner';

// Map popular symbols to Persian labels and colors
const COIN_METADATA: Record<string, { name: string; color: string; targetPercent: number }> = {
  btc: { name: 'بیت‌کوین', color: '#F7931A', targetPercent: 25 },
  eth: { name: 'اتریوم', color: '#627EEA', targetPercent: 25 },
  sol: { name: 'سولانا', color: '#14F195', targetPercent: 20 },
  xrp: { name: 'ریپل', color: '#23292F', targetPercent: 10 },
  bnb: { name: 'بایننس‌کوین', color: '#F3BA2F', targetPercent: 15 },
  ada: { name: 'کاردانو', color: '#0033AD', targetPercent: 10 },
  dot: { name: 'پولکادات', color: '#E6007A', targetPercent: 10 },
  doge: { name: 'دوج‌کوین', color: '#C2A633', targetPercent: 10 },
  trx: { name: 'ترون', color: '#FF0013', targetPercent: 10 },
  pol: { name: 'پالیگان', color: '#8247E5', targetPercent: 10 },
  avax: { name: 'آوالانچ', color: '#E84142', targetPercent: 10 },
  link: { name: 'چین‌لینک', color: '#375BD2', targetPercent: 10 },
  near: { name: 'نیر پروتکل', color: '#000000', targetPercent: 10 },
  sui: { name: 'سویی', color: '#2A82E4', targetPercent: 10 },
  apt: { name: 'آپتوس', color: '#2EE5AC', targetPercent: 10 },
  usdt: { name: 'تتر', color: '#26A17B', targetPercent: 10 },
  not: { name: 'نات‌کوین', color: '#EAB308', targetPercent: 10 },
};

class NobitexService {
  private getBaseUrl(): string {
    // In native mobile apps (Capacitor Android / iOS), call direct
    if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
      return 'https://apiv2.nobitex.ir';
    }
    // In web browsers (localhost dev or Vercel production), use same-origin proxy to bypass CORS
    return '/api/nobitex';
  }

  private async getRequestHeaders(params: {
    config: NobitexConfig;
    method: 'GET' | 'POST' | 'DELETE' | 'PUT';
    path: string;
    body?: string;
  }): Promise<Record<string, string>> {
    const { config, method, path, body = '' } = params;

    if (config.authType === 'api_key' && config.publicKey && config.secretKey) {
      return signNobitexRequest({
        publicKey: config.publicKey,
        secretKey: config.secretKey,
        method,
        path,
        body,
      });
    }

    // Token authentication
    const token = config.token || config.publicKey || '';
    return {
      'Authorization': `Token ${token.trim()}`,
      'User-Agent': 'TraderBot/InvestmentApp-1.0.0',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private handleNobitexError(data: any, statusCode?: number): never {
    if (data?.code === 'UnexpectedError') {
      throw new Error(
        'امضای دیجیتال یا کلید نوبیتکس تایید نشد. لطفاً از صحت کلید عمومی (Key) و کلید خصوصی (Secret) اطمینان حاصل فرمایید.'
      );
    }
    if (data?.code === 'KeyNotFound' || statusCode === 401 || statusCode === 403) {
      throw new Error('کلید API یا توکن نوبیتکس نامعتبر است، منقضی شده یا دسترسی READ ندارد.');
    }
    if (data?.code === 'TooManyRequests' || statusCode === 429) {
      throw new Error('محدودیت درخواست‌های نوبیتکس (Rate Limit). لطفاً چند لحظه بعد تلاش کنید.');
    }
    throw new Error(data?.message || `خطا در ارتباط با نوبیتکس: کد ${statusCode || 'نامشخص'}`);
  }

  /**
   * Fetch User Profile to test API Key / Token validity
   */
  async getProfile(config: NobitexConfig): Promise<NobitexProfile> {
    const base = this.getBaseUrl();
    const path = '/users/profile';
    const url = `${base}${path}`;

    const headers = await this.getRequestHeaders({
      config,
      method: 'GET',
      path,
      body: '',
    });

    const res = await fetch(url, {
      method: 'GET',
      headers,
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      // Ignore JSON parse error
    }

    if (!res.ok || data.status === 'failed') {
      this.handleNobitexError(data, res.status);
    }

    return data.profile || data;
  }

  /**
   * Fetch User Wallets List
   */
  async getWallets(config: NobitexConfig): Promise<NobitexWallet[]> {
    const base = this.getBaseUrl();
    const path = '/users/wallets/list';
    const url = `${base}${path}`;

    const headers = await this.getRequestHeaders({
      config,
      method: 'POST',
      path,
      body: '',
    });

    const res = await fetch(url, {
      method: 'POST',
      headers,
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      // Ignore JSON parse error
    }

    if (!res.ok || data.status === 'failed') {
      this.handleNobitexError(data, res.status);
    }

    return data.wallets || [];
  }

  /**
   * Fetch User Trades (History of executed buy/sell orders)
   */
  async getUserTrades(config: NobitexConfig): Promise<any[]> {
    const base = this.getBaseUrl();
    const path = '/market/trades/list';
    const url = `${base}${path}`;

    try {
      const headers = await this.getRequestHeaders({
        config,
        method: 'GET',
        path,
        body: '',
      });

      const res = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        // Fallback to POST
        const postHeaders = await this.getRequestHeaders({
          config,
          method: 'POST',
          path,
          body: '',
        });
        const postRes = await fetch(url, {
          method: 'POST',
          headers: postHeaders,
        });
        if (postRes.ok) {
          const postData = await postRes.json();
          return postData.trades || [];
        }
        return [];
      }

      const data = await res.json();
      return data.trades || [];
    } catch (e) {
      console.warn('[NobitexService] Could not fetch user trades:', e);
      return [];
    }
  }

  /**
   * Fetch Market Stats (Latest Prices in Rials/Tomans for all pairs)
   */
  async getMarketStats(
    _srcCurrencies?: string[],
    dstCurrency: 'rls' | 'usdt' = 'rls'
  ): Promise<Record<string, NobitexMarketStat>> {
    const base = this.getBaseUrl();
    // Query without srcCurrency filter so Nobitex returns all 150+ valid pairs reliably
    const url = `${base}/market/stats?dstCurrency=${dstCurrency}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'TraderBot/InvestmentApp-1.0.0',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`خطا در دریافت نرخ‌های بازار نوبیتکس: کد ${res.status}`);
    }

    const data = await res.json();
    if (data.status === 'failed') {
      throw new Error(data.message || 'خطا در دریافت آمار بازار نوبیتکس');
    }

    return data.stats || {};
  }

  /**
   * Full Synchronizer:
   * 1. Pulls user's wallets from Nobitex
   * 2. Pulls real-time prices in Tomans (Rials / 10)
   * 3. Pulls user's buy trades to compute average purchase price & PnL
   * 4. Maps to CryptoAsset objects with accurate coin quantity, valuation and profit/loss
   */
  async syncUserCryptoHoldings(
    config: NobitexConfig,
    existingAssets: CryptoAsset[]
  ): Promise<{
    updatedAssets: CryptoAsset[];
    syncedCount: number;
    tomanBalance: number;
    profile?: NobitexProfile;
  }> {
    // 1. Fetch Wallets, Profile & Trades in parallel (with graceful fallback)
    const [wallets, profile, trades] = await Promise.all([
      this.getWallets(config),
      this.getProfile(config).catch(() => undefined),
      this.getUserTrades(config).catch(() => []),
    ]);

    // 2. Compute Weighted Average Buy Price per symbol from trades
    const avgBuyPriceMap = new Map<string, number>();
    if (trades && Array.isArray(trades) && trades.length > 0) {
      const buyTradesBySymbol: Record<string, { totalAmount: number; totalCostRials: number }> = {};

      for (const trade of trades) {
        const isBuy = trade.type === 'buy' || trade.side === 'buy';
        if (!isBuy) continue;

        let sym = '';
        if (trade.srcCurrency) {
          sym = trade.srcCurrency.toLowerCase();
        } else if (trade.symbol) {
          sym = trade.symbol.toLowerCase().replace('irt', '').replace('rls', '').replace('usdt', '');
        }

        if (!sym) continue;

        const amount = parseFloat(trade.amount || trade.matchedAmount || '0');
        const price = parseFloat(trade.price || '0');

        if (amount > 0 && price > 0) {
          if (!buyTradesBySymbol[sym]) {
            buyTradesBySymbol[sym] = { totalAmount: 0, totalCostRials: 0 };
          }
          buyTradesBySymbol[sym].totalAmount += amount;
          buyTradesBySymbol[sym].totalCostRials += amount * price;
        }
      }

      for (const [sym, data] of Object.entries(buyTradesBySymbol)) {
        if (data.totalAmount > 0) {
          const avgPriceTomans = Math.round(data.totalCostRials / (data.totalAmount * 10));
          avgBuyPriceMap.set(sym, avgPriceTomans);
        }
      }
    }

    // 3. Extract active crypto balances (exclude zero balances and rls)
    const cryptoWallets = wallets.filter(
      (w) => w.currency.toLowerCase() !== 'rls' && parseFloat(w.balance || '0') > 0
    );

    // Extract Rials wallet (cash on exchange)
    const rlsWallet = wallets.find((w) => w.currency.toLowerCase() === 'rls');
    const tomanBalance = rlsWallet ? Math.round(parseFloat(rlsWallet.balance || '0') / 10) : 0;

    // 4. Fetch Market Prices for all coins
    const stats = await this.getMarketStats(undefined, 'rls');

    // Tether price in Rials to convert any USDT-only rates if needed
    const usdtPriceRials = stats['usdt-rls']?.latest ? parseFloat(stats['usdt-rls'].latest) : 900000;
    const usdtPriceTomans = Math.round(usdtPriceRials / 10);

    // 5. Update or merge assets with PnL
    const updatedAssets: CryptoAsset[] = [];
    const processedSymbols = new Set<string>();

    // Update existing assets first
    for (const asset of existingAssets) {
      const sym = asset.symbol.toLowerCase();
      processedSymbols.add(sym);

      const wallet = cryptoWallets.find((w) => w.currency.toLowerCase() === sym);
      const statKey = `${sym}-rls`;
      const stat = stats[statKey];

      let unitPriceTomans = asset.unitPrice || 0;
      if (stat && stat.latest) {
        unitPriceTomans = Math.round(parseFloat(stat.latest) / 10);
      } else if (sym === 'usdt') {
        unitPriceTomans = usdtPriceTomans;
      }

      const coinAmount = wallet ? parseFloat(wallet.balance) : asset.currentAmount || 0;
      const holdingValue = unitPriceTomans > 0 ? Math.round(coinAmount * unitPriceTomans) : asset.currentHoldingValue;

      // Purchase Cost & PnL calculation
      const avgBuyPrice = asset.averageBuyPrice || avgBuyPriceMap.get(sym) || 0;
      const totalCost = avgBuyPrice > 0 && coinAmount > 0 ? Math.round(coinAmount * avgBuyPrice) : asset.totalCostTomans;
      const profitTomans = totalCost !== undefined && totalCost > 0 ? holdingValue - totalCost : undefined;
      const profitPercent = totalCost !== undefined && totalCost > 0 ? ((holdingValue - totalCost) / totalCost) * 100 : undefined;

      updatedAssets.push({
        ...asset,
        currentAmount: coinAmount,
        unitPrice: unitPriceTomans,
        currentHoldingValue: holdingValue,
        averageBuyPrice: avgBuyPrice > 0 ? avgBuyPrice : undefined,
        totalCostTomans: totalCost,
        profitTomans,
        profitPercent,
      });
    }

    // Add newly discovered assets from Nobitex wallets that weren't in user's list
    for (const wallet of cryptoWallets) {
      const sym = wallet.currency.toLowerCase();
      if (processedSymbols.has(sym)) continue;
      processedSymbols.add(sym);

      const statKey = `${sym}-rls`;
      const stat = stats[statKey];

      let unitPriceTomans = 0;
      if (stat && stat.latest) {
        unitPriceTomans = Math.round(parseFloat(stat.latest) / 10);
      } else if (sym === 'usdt') {
        unitPriceTomans = usdtPriceTomans;
      }

      const coinAmount = parseFloat(wallet.balance);
      const holdingValue = unitPriceTomans > 0 ? Math.round(coinAmount * unitPriceTomans) : 0;
      const meta = COIN_METADATA[sym] || {
        name: sym.toUpperCase(),
        color: '#6366F1',
        targetPercent: 10,
      };

      const avgBuyPrice = avgBuyPriceMap.get(sym) || 0;
      const totalCost = avgBuyPrice > 0 && coinAmount > 0 ? Math.round(coinAmount * avgBuyPrice) : undefined;
      const profitTomans = totalCost !== undefined && totalCost > 0 ? holdingValue - totalCost : undefined;
      const profitPercent = totalCost !== undefined && totalCost > 0 ? ((holdingValue - totalCost) / totalCost) * 100 : undefined;

      updatedAssets.push({
        id: `nobitex_${sym}_${Date.now()}`,
        symbol: sym.toUpperCase(),
        name: meta.name,
        targetPercent: meta.targetPercent,
        currentAmount: coinAmount,
        unitPrice: unitPriceTomans,
        currentHoldingValue: holdingValue,
        averageBuyPrice: avgBuyPrice > 0 ? avgBuyPrice : undefined,
        totalCostTomans: totalCost,
        profitTomans,
        profitPercent,
        color: meta.color,
      });
    }

    return {
      updatedAssets,
      syncedCount: cryptoWallets.length,
      tomanBalance,
      profile,
    };
  }
}

export const nobitexService = new NobitexService();
