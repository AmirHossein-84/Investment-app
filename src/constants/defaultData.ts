import { AppSettings, CryptoAsset, GoldHolding } from '../types/investment';

export const DEFAULT_CRYPTO_ASSETS: CryptoAsset[] = [
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'اتریوم (Ethereum)',
    targetPercent: 25,
    currentHoldingValue: 0,
    color: '#627EEA',
    isDefault: true,
  },
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'بیت‌کوین (Bitcoin)',
    targetPercent: 19,
    currentHoldingValue: 0,
    color: '#F7931A',
    isDefault: true,
  },
  {
    id: 'bnb',
    symbol: 'BNB',
    name: 'بایننس کوین (BNB)',
    targetPercent: 15,
    currentHoldingValue: 0,
    color: '#F3BA2F',
    isDefault: true,
  },
  {
    id: 'ada',
    symbol: 'ADA',
    name: 'کاردانو (Cardano)',
    targetPercent: 9,
    currentHoldingValue: 0,
    color: '#0033AD',
    isDefault: true,
  },
  {
    id: 'dot',
    symbol: 'DOT',
    name: 'پولکادات (Polkadot)',
    targetPercent: 9,
    currentHoldingValue: 0,
    color: '#E6007A',
    isDefault: true,
  },
  {
    id: 'trx',
    symbol: 'TRX',
    name: 'ترون (Tron)',
    targetPercent: 8,
    currentHoldingValue: 0,
    color: '#EF0027',
    isDefault: true,
  },
  {
    id: 'xrp',
    symbol: 'XRP',
    name: 'ریپل (Ripple)',
    targetPercent: 8,
    currentHoldingValue: 0,
    color: '#23292F',
    isDefault: true,
  },
  {
    id: 'doge',
    symbol: 'DOGE',
    name: 'دوج‌کوین (Dogecoin)',
    targetPercent: 5,
    currentHoldingValue: 0,
    color: '#C2A633',
    isDefault: true,
  },
  {
    id: 'pol',
    symbol: 'POL',
    name: 'پولیگان (Polygon Ecosystem)',
    targetPercent: 2,
    currentHoldingValue: 0,
    color: '#8247E5',
    isDefault: true,
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  savingsPercent: 30, // 30% savings from income/assets
  goldPercent: 80, // 80% of savings goes to Gold
  cryptoPercent: 20, // 20% of savings goes to Crypto
  calculationMode: 'rebalance', // Smart Rebalancing to reach target weights
  currencyUnit: 'toman',
  goldPricePerGram: 5200000, // Approximate gold price per gram in Tomans
};

export const DEFAULT_GOLD_HOLDING: GoldHolding = {
  currentHoldingValue: 0,
  currentGrams: 0,
  pricePerGram: 5200000,
};
