import { useState, useCallback, useEffect } from 'react';
import { CryptoAsset } from '../types/investment';
import { NobitexProfile, NobitexWallet, NobitexConfig } from '../services/nobitex/types';
import { nobitexService } from '../services/nobitex';
import { loadNobitexConfig, saveNobitexConfig } from '../utils/storage';

export function useNobitex() {
  const [config, setConfig] = useState<NobitexConfig>(() => {
    const loaded = loadNobitexConfig();
    return {
      authType: loaded.authType || 'api_key',
      publicKey: loaded.publicKey || (loaded as any).apiKey || '',
      secretKey: loaded.secretKey || '',
      token: loaded.token || '',
      autoSyncEnabled: loaded.autoSyncEnabled ?? true,
      lastSyncedAt: loaded.lastSyncedAt,
    };
  });
  const [profile, setProfile] = useState<NobitexProfile | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tomanCashBalance, setTomanCashBalance] = useState<number>(0);
  const [syncedCoinsCount, setSyncedCoinsCount] = useState<number>(0);
  const [syncedTradesCount, setSyncedTradesCount] = useState<number>(0);

  const isConfigured = Boolean(
    (config.authType === 'api_key' && config.publicKey?.trim() && config.secretKey?.trim()) ||
    (config.authType === 'token' && config.token?.trim())
  );

  // Synchronize config across all hook instances when storage or custom event fires
  useEffect(() => {
    const handleSyncConfig = () => {
      const loaded = loadNobitexConfig();
      setConfig({
        authType: loaded.authType || 'api_key',
        publicKey: loaded.publicKey || (loaded as any).apiKey || '',
        secretKey: loaded.secretKey || '',
        token: loaded.token || '',
        autoSyncEnabled: loaded.autoSyncEnabled ?? true,
        lastSyncedAt: loaded.lastSyncedAt,
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('nobitex_config_updated', handleSyncConfig);
      window.addEventListener('storage', handleSyncConfig);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('nobitex_config_updated', handleSyncConfig);
        window.removeEventListener('storage', handleSyncConfig);
      }
    };
  }, []);

  const saveConfig = useCallback((newConfig: NobitexConfig) => {
    setConfig(newConfig);
    saveNobitexConfig(newConfig);
    setError(null);
  }, []);

  const removeConfig = useCallback(() => {
    const cleared: NobitexConfig = {
      authType: 'api_key',
      publicKey: '',
      secretKey: '',
      token: '',
      autoSyncEnabled: false,
      lastSyncedAt: undefined,
    };
    setConfig(cleared);
    saveNobitexConfig(cleared);
    setProfile(null);
    setTomanCashBalance(0);
    setSyncedTradesCount(0);
    setError(null);
  }, []);

  /**
   * Sync User Wallets & Live Crypto Market Prices
   */
  const syncWithNobitex = useCallback(
    async (
      currentAssets: CryptoAsset[],
      onAssetsUpdated: (updatedAssets: CryptoAsset[]) => void,
      overrideConfig?: NobitexConfig
    ): Promise<boolean> => {
      const activeConfig = overrideConfig || config;

      if (
        activeConfig.authType === 'api_key' &&
        (!activeConfig.publicKey?.trim() || !activeConfig.secretKey?.trim())
      ) {
        setError('لطفاً کلید عمومی و کلید خصوصی نوبیتکس خود را وارد کنید.');
        return false;
      }

      if (activeConfig.authType === 'token' && !activeConfig.token?.trim()) {
        setError('لطفاً توکن ورود نوبیتکس را وارد کنید.');
        return false;
      }

      setIsSyncing(true);
      setError(null);

      try {
        const result = await nobitexService.syncUserCryptoHoldings(
          activeConfig,
          currentAssets
        );

        onAssetsUpdated(result.updatedAssets);
        setTomanCashBalance(result.tomanBalance);
        setSyncedCoinsCount(result.syncedCount);
        setSyncedTradesCount(result.tradesCount || 0);
        if (result.profile) {
          setProfile(result.profile);
        }

        const updatedConfig: NobitexConfig = {
          ...activeConfig,
          lastSyncedAt: Date.now(),
        };
        setConfig(updatedConfig);
        saveNobitexConfig(updatedConfig);

        return true;
      } catch (err: any) {
        console.error('[Nobitex Hook] Sync failed:', err);
        setError(err.message || 'خطا در ارتباط با نوبیتکس. لطفا اتصال اینترنت و کلید API را بررسی کنید.');
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    [config]
  );

  /**
   * Auto-fetch only live price stats without altering user-set quantities
   */
  const refreshCryptoPrices = useCallback(
    async (
      currentAssets: CryptoAsset[],
      onAssetsUpdated: (updatedAssets: CryptoAsset[]) => void
    ) => {
      if (currentAssets.length === 0) return;
      try {
        const symbols = currentAssets.map((a) => a.symbol.toLowerCase());
        const stats = await nobitexService.getMarketStats(symbols, 'rls');

        const updated = currentAssets.map((asset) => {
          const sym = asset.symbol.toLowerCase();
          const stat = stats[`${sym}-rls`];
          if (stat && stat.latest) {
            const priceTomans = Math.round(parseFloat(stat.latest) / 10);
            const holdingVal = asset.currentAmount !== undefined
              ? Math.round(asset.currentAmount * priceTomans)
              : asset.currentHoldingValue;

            return {
              ...asset,
              unitPrice: priceTomans,
              currentHoldingValue: holdingVal,
            };
          }
          return asset;
        });

        onAssetsUpdated(updated);
      } catch (e) {
        console.warn('[Nobitex Hook] Market stats refresh failed:', e);
      }
    },
    []
  );

  return {
    config,
    isConfigured,
    isSyncing,
    lastSyncedAt: config.lastSyncedAt,
    profile,
    error,
    tomanCashBalance,
    syncedCoinsCount,
    syncedTradesCount,
    saveConfig,
    removeConfig,
    syncWithNobitex,
    refreshCryptoPrices,
  };
}
