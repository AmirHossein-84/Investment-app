import React, { useState } from 'react';
import {
  X,
  Key,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Trash2,
  Lock,
} from 'lucide-react';
import { CryptoAsset } from '../../types/investment';
import { useNobitex } from '../../hooks/useNobitex';
import { NobitexAuthType } from '../../services/nobitex/types';
import { formatToman, toPersianDigits, getPersianFormattedDate } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';

interface NobitexSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  cryptoAssets: CryptoAsset[];
  onAssetsUpdated: (assets: CryptoAsset[]) => void;
  onNotify?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const NobitexSyncModal: React.FC<NobitexSyncModalProps> = ({
  isOpen,
  onClose,
  cryptoAssets,
  onAssetsUpdated,
  onNotify,
}) => {
  const {
    config,
    isConfigured,
    isSyncing,
    lastSyncedAt,
    profile,
    error,
    tomanCashBalance,
    syncedCoinsCount,
    saveConfig,
    removeConfig,
    syncWithNobitex,
  } = useNobitex();

  const [authType, setAuthType] = useState<NobitexAuthType>(config.authType || 'api_key');
  const [publicKey, setPublicKey] = useState(config.publicKey || '');
  const [secretKey, setSecretKey] = useState(config.secretKey || '');
  const [token, setToken] = useState(config.token || '');
  const [showSecret, setShowSecret] = useState(false);
  const [showToken, setShowToken] = useState(false);

  if (!isOpen) return null;

  const handleSaveAndSync = async () => {
    triggerHaptic('medium');
    const updatedConfig = {
      ...config,
      authType,
      publicKey: publicKey.trim(),
      secretKey: secretKey.trim(),
      token: token.trim(),
    };
    saveConfig(updatedConfig);

    const success = await syncWithNobitex(cryptoAssets, onAssetsUpdated);
    if (success) {
      triggerHaptic('success');
      onNotify?.('موجودی و قیمت‌های نوبیتکس با موفقیت همگام‌سازی شدند!');
    }
  };

  const handleDisconnect = () => {
    triggerHaptic('light');
    removeConfig();
    setPublicKey('');
    setSecretKey('');
    setToken('');
    onNotify?.('اتصال به نوبیتکس قطع شد', 'info');
  };

  const isValid =
    authType === 'api_key'
      ? publicKey.trim().length > 0 && secretKey.trim().length > 0
      : token.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-500/30">
              ⚡
            </div>
            <div>
              <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
                <span>اتصال به صرافی نوبیتکس (Nobitex)</span>
                {isConfigured && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    متصل
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                دریافت خودکار موجودی کیف‌پول‌ها و قیمت‌های لحظه‌ای بازار
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all touch-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Security Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-slate-300 leading-relaxed text-[11px]">
              <span className="font-bold text-indigo-300 block">امنیت و حریم خصوصی:</span>
              <p>
                کلید و امضای API تنها در حافظه دستگاه شما ذخیره می‌شود. برای حفظ امنیت، در پنل نوبیتکس کلید را با دسترسی <strong>فقط خواندنی (READ)</strong> بسازید.
              </p>
            </div>
          </div>

          {/* Connected Profile Box (If already connected) */}
          {isConfigured && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">وضعیت اتصال:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>متصل به حساب کاربری</span>
                </span>
              </div>

              {profile?.email && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">ایمیل:</span>
                  <span className="text-slate-200 font-bold dir-ltr">{profile.email}</span>
                </div>
              )}

              {lastSyncedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">آخرین همگام‌سازی:</span>
                  <span className="text-slate-300 font-medium">
                    {getPersianFormattedDate(new Date(lastSyncedAt))}
                  </span>
                </div>
              )}

              {tomanCashBalance > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400 font-medium">موجودی تومانی نقدی در نوبیتکس:</span>
                  <span className="text-gold-400 font-black">
                    {formatToman(tomanCashBalance)} تومان
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Method Selection Tabs */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">روش اتصال:</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setAuthType('api_key')}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition-all ${
                  authType === 'api_key'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                کلید API (پیشنهادی نوبیتکس)
              </button>
              <button
                type="button"
                onClick={() => setAuthType('token')}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition-all ${
                  authType === 'token'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                توکن ورود (Token)
              </button>
            </div>
          </div>

          {/* Tab 1: API Key Mode (Public Key + Secret Key) */}
          {authType === 'api_key' && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  اطلاعات کلید API از پنل نوبیتکس:
                </span>
                <a
                  href="https://nobitex.ir/panel/profile/api-key/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px] underline"
                >
                  <span>مدیریت کلیدهای API نوبیتکس</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Public Key */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  <span>۱. کلید عمومی (Public Key / Key):</span>
                </label>
                <input
                  type="text"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder="مثلاً f04a298a-54bf..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 dir-ltr font-mono text-xs"
                />
              </div>

              {/* Secret Key */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>۲. کلید خصوصی (Secret Key / Private Key):</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="کلید خصوصی داده شده در زمان ساخت کلید..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 dir-ltr font-mono text-xs pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-normal">
                💡 در پنل نوبیتکس هنگام ایجاد کلید API، دو مقدار <strong>Key</strong> و <strong>Secret</strong> نمایش داده می‌شوند. برنامه به صورت خودکار با استاندارد Ed25519 درخواست‌ها را امضا می‌کند.
              </p>
            </div>
          )}

          {/* Tab 2: Token Mode */}
          {authType === 'token' && (
            <div className="space-y-2 pt-1">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>توکن احراز هویت نوبیتکس (Token):</span>
              </label>

              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="توکن احراز هویت ورود مستقیم..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 dir-ltr font-mono text-xs pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[10px] text-slate-500 leading-normal">
                این گزینه برای توکن‌های ورود مستقیم و سشن‌های تستی است.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-2 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          {isConfigured ? (
            <button
              onClick={handleDisconnect}
              className="px-3.5 py-2.5 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all interactive-tap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>قطع اتصال</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all interactive-tap"
            >
              انصراف
            </button>

            <button
              onClick={handleSaveAndSync}
              disabled={isSyncing || !isValid}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 transition-all interactive-tap shadow-crypto-glow touch-target"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'در حال همگام‌سازی...' : 'ذخیره و همگام‌سازی'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
