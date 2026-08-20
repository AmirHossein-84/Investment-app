import { AppSettings, CryptoAsset, GoldHolding, TransactionRecord } from '../types/investment';
import { DEFAULT_CRYPTO_ASSETS, DEFAULT_GOLD_HOLDING, DEFAULT_SETTINGS } from '../constants/defaultData';

const STORAGE_KEYS = {
  SETTINGS: 'investment_app_settings_v1',
  CRYPTO_ASSETS: 'investment_app_crypto_assets_v1',
  GOLD_HOLDING: 'investment_app_gold_holding_v1',
  TRANSACTIONS: 'investment_app_transactions_v1',
  LAST_INPUT: 'investment_app_last_input_v1',
};

export interface ExportedBackupData {
  version: string;
  exportDate: string;
  settings: AppSettings;
  cryptoAssets: CryptoAsset[];
  goldHolding: GoldHolding;
  transactions: TransactionRecord[];
}

export function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadCryptoAssets(): CryptoAsset[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CRYPTO_ASSETS);
    return data ? JSON.parse(data) : DEFAULT_CRYPTO_ASSETS;
  } catch (e) {
    console.error('Failed to load crypto assets:', e);
    return DEFAULT_CRYPTO_ASSETS;
  }
}

export function saveCryptoAssets(assets: CryptoAsset[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CRYPTO_ASSETS, JSON.stringify(assets));
  } catch (e) {
    console.error('Failed to save crypto assets:', e);
  }
}

export function loadGoldHolding(): GoldHolding {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GOLD_HOLDING);
    return data ? { ...DEFAULT_GOLD_HOLDING, ...JSON.parse(data) } : DEFAULT_GOLD_HOLDING;
  } catch (e) {
    console.error('Failed to load gold holding:', e);
    return DEFAULT_GOLD_HOLDING;
  }
}

export function saveGoldHolding(holding: GoldHolding): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GOLD_HOLDING, JSON.stringify(holding));
  } catch (e) {
    console.error('Failed to save gold holding:', e);
  }
}

export function loadTransactions(): TransactionRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load transactions:', e);
    return [];
  }
}

export function saveTransactions(transactions: TransactionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions:', e);
  }
}

export function loadLastInput(): number {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LAST_INPUT);
    return data ? parseFloat(data) || 0 : 0;
  } catch (e) {
    return 0;
  }
}

export function saveLastInput(amount: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_INPUT, String(amount));
  } catch (e) {
    console.error('Failed to save last input:', e);
  }
}

export function exportBackupData(): string {
  const backup: ExportedBackupData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    settings: loadSettings(),
    cryptoAssets: loadCryptoAssets(),
    goldHolding: loadGoldHolding(),
    transactions: loadTransactions(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackupData(jsonString: string): boolean {
  try {
    const parsed: ExportedBackupData = JSON.parse(jsonString);
    if (!parsed || !parsed.settings || !parsed.cryptoAssets) {
      throw new Error('Invalid backup format');
    }
    saveSettings(parsed.settings);
    saveCryptoAssets(parsed.cryptoAssets);
    if (parsed.goldHolding) saveGoldHolding(parsed.goldHolding);
    if (parsed.transactions) saveTransactions(parsed.transactions);
    return true;
  } catch (e) {
    console.error('Failed to import backup:', e);
    return false;
  }
}

export function resetAllDataToDefault(): void {
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.CRYPTO_ASSETS);
  localStorage.removeItem(STORAGE_KEYS.GOLD_HOLDING);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.LAST_INPUT);
}
