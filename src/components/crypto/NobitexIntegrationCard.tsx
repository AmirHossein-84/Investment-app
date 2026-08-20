import React, { useState } from 'react';
import {
  RefreshCw,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Wallet,
  Settings2,
} from 'lucide-react';
import { CryptoAsset } from '../../types/investment';
import { useNobitex } from '../../hooks/useNobitex';
import { formatToman, toPersianDigits, getPersianFormattedDate } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';
import { NobitexSyncModal } from './NobitexSyncModal';

interface NobitexIntegrationCardProps {
  cryptoAssets: CryptoAsset[];
  onAssetsUpdated: (assets: CryptoAsset[]) => void;
  onNotify?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const NobitexIntegrationCard: React.FC<NobitexIntegrationCardProps> = ({
  cryptoAssets,
  onAssetsUpdated,
  onNotify,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    isConfigured,
    isSyncing,
    lastSyncedAt,
    profile,
    error,
    tomanCashBalance,
    syncedCoinsCount,
    syncWithNobitex,
  } = useNobitex();

  const handleQuickSync = async () => {
    triggerHaptic('light');
    if (!isConfigured) {
      setIsModalOpen(true);
      return;
    }

    const success = await syncWithNobitex(cryptoAssets, onAssetsUpdated);
    if (success) {
      triggerHaptic('success');
      onNotify?.('موجودی و قیمت‌های نوبیتکس با موفقیت به‌روزرسانی شدند!');
    }
  };

  return (
    <>
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-md relative overflow-hidden space-y-3">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-base border border-indigo-500/30">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-slate-100">
                  اتصال خودکار به صرافی نوبیتکس
                </h4>
                {isConfigured ? (
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>متصل</span>
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                    غیرفعال
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isConfigured
                  ? `همگام‌سازی خودکار ${toPersianDigits(syncedCoinsCount || cryptoAssets.length)} رمزارز با نرخ لحظه‌ای`
                  : 'با وارد کردن کلید API، موجودی کیف‌پول‌ها و قیمت‌ها خودکار تنظیم می‌شوند'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                triggerHaptic('light');
                setIsModalOpen(true);
              }}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-indigo-300 border border-slate-700/80 transition-all interactive-tap touch-target"
              title="تنظیمات کلید API نوبیتکس"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleQuickSync}
              disabled={isSyncing}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all interactive-tap touch-target shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'در حال دریافت...' : 'همگام‌سازی'}</span>
            </button>
          </div>
        </div>

        {/* Sync Info / Last Synced */}
        {isConfigured && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              {profile?.email && (
                <span>کاربر: <strong className="text-slate-300 dir-ltr">{profile.email}</strong></span>
              )}
              {tomanCashBalance > 0 && (
                <span>• موجودی نقدی: <strong className="text-gold-400">{formatToman(tomanCashBalance)} ت</strong></span>
              )}
            </div>

            {lastSyncedAt && (
              <span className="text-[10px] text-slate-500">
                بروزرسانی: {getPersianFormattedDate(new Date(lastSyncedAt))}
              </span>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-2 text-[10px]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

      </div>

      {/* Configuration Modal */}
      <NobitexSyncModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cryptoAssets={cryptoAssets}
        onAssetsUpdated={onAssetsUpdated}
        onNotify={onNotify}
      />
    </>
  );
};
