export interface NobitexWallet {
  id: number;
  currency: string; // e.g. 'btc', 'eth', 'sol', 'usdt', 'rls'
  balance: string;
  blockedBalance: string;
  activeBalance: string;
  depositAddress?: string;
  user?: number;
}

export interface NobitexMarketStat {
  isClosed?: boolean;
  bestSell: string;
  bestBuy: string;
  volumeSrc: string;
  volumeDst: string;
  latest: string; // Traded price in Rials or USDT
  dayLow?: string;
  dayHigh?: string;
  dayOpen?: string;
  dayClose?: string;
  dayChange?: string; // Percentage e.g. '2.45' or '-1.12'
}

export interface NobitexProfile {
  email?: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  verifications?: {
    email?: boolean;
    phone?: boolean;
    identity?: boolean;
  };
}

export type NobitexAuthType = 'api_key' | 'token';

export interface NobitexConfig {
  authType: NobitexAuthType;
  publicKey?: string; // Nobitex-Key
  secretKey?: string; // Private key for Ed25519 signing
  token?: string; // Legacy Authorization: Token
  autoSyncEnabled?: boolean;
  lastSyncedAt?: number;
}
